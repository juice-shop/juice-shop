package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"strings"

	"github.com/simongottschlag/azure-openai-gpt-slack-bot/internal/gpt3"
	"github.com/simongottschlag/azure-openai-gpt-slack-bot/internal/tokenizer"

	"github.com/alexflint/go-arg"
	"github.com/shomali11/slacker"
	"github.com/slack-go/slack"
)

var (
	maxTokensMap = map[string]int{
		"text-002": 4097,
		"text-003": 4097,
	}
)

func main() {
	cfg, err := newConfig(os.Args[1:])
	if err != nil {
		fmt.Fprintf(os.Stderr, "unable to load config: %v\n", err)
		os.Exit(1)
	}

	err = run(cfg)
	if err != nil {
		fmt.Fprintf(os.Stderr, "application returned an error: %v\n", err)
		os.Exit(1)
	}
}

func run(cfg *config) error {
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)
	defer cancel()

	bot := slacker.NewClient(cfg.SlackBotToken, cfg.SlackAppToken)
	gptClient := gpt3.NewClient(cfg.AzureOpenAIEndpoint, cfg.AzureOpenAIKey, cfg.OpenAIDeploymentName)

	definition := &slacker.CommandDefinition{
		Description: "GPT prompt",
		Examples:    []string{"gpt: <prompt>"},
		Handler: func(botCtx slacker.BotContext, request slacker.Request, response slacker.ResponseWriter) {
			if botCtx.Event().Type != "message" {
				return
			}

			prompts := []string{request.Param("prompt")}
			if botCtx.Event().IsThread() {
				var err error
				prompts, err = slackThreadContent(botCtx)
				if err != nil {
					fmt.Fprintf(os.Stderr, "slack thread content error: %v\n", err)
					response.ReportError(err, slacker.WithThreadError(true))
					return
				}
			}

			user := botCtx.Event().UserName

			completion, err := gptCompletion(botCtx.Context(), gptClient, prompts, cfg.OpenAIDeploymentName, user)
			if err != nil {
				fmt.Fprintf(os.Stderr, "completion error: %v\n", err)
				response.ReportError(err, slacker.WithThreadError(true))
				return
			}

			response.Reply(completion, slacker.WithThreadReply(true))
		},
	}

	bot.Command("gpt: <prompt>", definition)

	err := bot.Listen(ctx)
	if err != nil {
		return err
	}

	return nil
}

func slackThreadContent(botCtx slacker.BotContext) ([]string, error) {
	client := botCtx.SocketMode()
	msgs, hasMore, nextCursor, err := client.GetConversationRepliesContext(botCtx.Context(), &slack.GetConversationRepliesParameters{
		Timestamp: botCtx.Event().ThreadTimeStamp,
		ChannelID: botCtx.Event().Channel,
	})
	if err != nil {
		return nil, err
	}

	if hasMore || nextCursor != "" {
		return nil, fmt.Errorf("unimplemented. hasMore=%t, nextCursor=%s", hasMore, nextCursor)
	}

	var messages []string
	for _, msg := range msgs {
		message := strings.TrimSpace(msg.Msg.Text)
		if msg.BotID == "" && !strings.HasPrefix(message, "gpt: ") {
			continue
		}
		message = strings.TrimPrefix(message, "gpt: ")
		messages = append(messages, message)
	}

	return messages, nil
}

func gptCompletion(ctx context.Context, client gpt3.Client, prompts []string, deploymentName string, user string) (string, error) {
	maxTokens, err := calculateMaxTokens(prompts, deploymentName)
	if err != nil {
		return "", err
	}
	var prompt strings.Builder
	fmt.Fprintf(&prompt, "You are a Slack Bot responding to an end user in Slack. Please format all text to make sure it looks good in Slack.\nContext from the end user named %s:\n", user)
	for _, p := range prompts {
		fmt.Fprintf(&prompt, "%s\n", p)
	}
	resp, err := client.Completion(ctx, gpt3.CompletionRequest{
		Prompt:    []string{prompt.String()},
		MaxTokens: maxTokens,
		Echo:      false,
		N:         gpt3.ToPtr(1),
	})

	if err != nil {
		return "", err
	}

	if len(resp.Choices) != 1 {
		return "", fmt.Errorf("expected choices to be 1 but received: %d", len(resp.Choices))
	}

	return resp.Choices[0].Text, nil
}

func calculateMaxTokens(prompts []string, deploymentName string) (*int, error) {
	maxTokens, ok := maxTokensMap[deploymentName]
	if !ok {
		return nil, fmt.Errorf("deploymentName %q not found in max tokens map", deploymentName)
	}

	encoder, err := tokenizer.NewEncoder()
	if err != nil {
		return nil, err
	}

	// start at 100 since the encoder at times doesn't get it exactly correct
	totalTokens := 100
	for _, prompt := range prompts {
		tokens, err := encoder.Encode(prompt)
		if err != nil {
			return nil, err
		}
		totalTokens += len(tokens)
	}

	remainingTokens := maxTokens - totalTokens
	return &remainingTokens, nil
}

type config struct {
	AzureOpenAIEndpoint  string `arg:"--azure-openai-endpoint,env:AZURE_OPENAI_ENDPOINT,required" help:"The endpoint for Azure OpenAI service"`
	AzureOpenAIKey       string `arg:"--azure-openai-key,env:AZURE_OPENAI_KEY,required" help:"The (api) key for Azure OpenAI service"`
	OpenAIDeploymentName string `arg:"--openai-deployment-name,env:OPENAI_DEPLOYMENT_NAME" default:"text-003" help:"The deployment name used for the model in OpenAI service"`
	SlackAppToken        string `arg:"--slack-app-token,env:SLACK_APP_TOKEN,required" help:"The Slack app token"`
	SlackBotToken        string `arg:"--slack-bot-token,env:SLACK_BOT_TOKEN,required" help:"The Slack bot token"`
}

func newConfig(args []string) (*config, error) {
	cfg := &config{}
	parser, err := arg.NewParser(arg.Config{
		Program:   "openai-slack-example",
		IgnoreEnv: false,
	}, cfg)
	if err != nil {
		return &config{}, err
	}

	err = parser.Parse(args)
	if err != nil {
		return &config{}, err
	}

	return cfg, err
}
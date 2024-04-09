using Azure.AI.OpenAI;

public class OpenAIClientService
{
    private OpenAIClient _client;

    public OpenAIClientService()
    {
        _client = new OpenAIClient();
    }

    public string GetChatCompletion(string text, string oaiModelName)
    {
        ChatCompletionsOptions chatCompletionsOptions = new ChatCompletionsOptions()
        {
            Messages =
            {
                new ChatMessage(ChatRole.System, "You are a helpful assistant. Summarize the following text in 60 words or less."),
                new ChatMessage(ChatRole.User, text),
            },
            MaxTokens = 120,
            Temperature = 0.7f,
        };

        ChatCompletions response = _client.GetChatCompletions(
            deploymentOrModelName: oaiModelName,
            chatCompletionsOptions);

        string completion = response.Choices[0].Message.Content;
        return completion;
    }
}
class Program
{
    static void Main(string[] args)
    {
        string oaiModelName = "your_model_name"; // Replace with your actual model name
        string text = "Your input text goes here.";

        var openAIClientService = new OpenAIClientService();
        string completion = openAIClientService.GetChatCompletion(text, oaiModelName);

        Console.WriteLine("Summary: " + completion);
    }
}

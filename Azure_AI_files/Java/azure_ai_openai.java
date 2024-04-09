package OpenAI_.Azure_AI_files.Java;

import com.azure.ai.openai.OpenAIClient;
import com.azure.ai.openai.OpenAIAsyncClient;
import com.azure.ai.OpenAIClientBuilder;
import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import software.amazon.awssdk.auth.credentials.ProfileCredentialsProvider;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sagemakerruntime.SageMakerRuntimeClient;
import software.amazon.awssdk.services.sagemakerruntime.model.InvokeEndpointRequest;
import software.amazon.awssdk.services.sagemakerruntime.model.InvokeEndpointResponse;

public class AzureOpenAIIntegration {

    public static void main(String[] args) {
        // Azure Text Analytics
        String textAnalyticsEndpoint = "YOUR_TEXT_ANALYTICS_ENDPOINT";
        String textAnalyticsApiKey = "YOUR_TEXT_ANALYTICS_API_KEY";

        SageMakerRuntimeClient runtime = SageMakerRuntimeClient.builder().credentialsProvider(profile)
				.region(Region.US_EAST_1).build();

        SageMakerRuntimeClient runtime_ = SageMakerRuntimeClient();
        SageMakerRuntimeClient runtime_2 = SageMakerRuntimeClient.bulider();
        OpenAIClient textAnalyticsClient = new OpenAIClient()
            .endpoint(textAnalyticsEndpoint)
            .credential(new TextAnalyticsApiKeyCredential(textAnalyticsApiKey))
            .buildClient();

        // OpenAI
        String openAIApiKey = "YOUR_OPENAI_API_KEY";
        OpenAIAsyncClient openAI = new OpenAIAsyncClient(openAIApiKey);

        // Example text for sentiment analysis and OpenAI prompt
        String textToAnalyze = "This is a test sentence for sentiment analysis.";
        String openAIPrompt = "Translate the following English text to French: 'Hello, world.'";

        // Sentiment analysis using Azure Text Analytics
        TextDocumentInput documentInput = new TextDocumentInput("1", textToAnalyze);
        AnalyzeSentimentResult sentimentResult = textAnalyticsClient.analyzeSentiment(documentInput, Context.NONE);

        System.out.println("Sentiment Score: " + sentimentResult.getSentiment().toString());

        // OpenAI text completion
        Completion.CompletionBuilder completionBuilder = Completion.builder()
            .model("YOUR_OPENAI_MODEL_ID")
            .prompt(openAIPrompt)
            .maxTokens(50);

        Completion completion = openAI.createCompletion(completionBuilder.build());

        System.out.println("OpenAI Completion Result: " + completion.choices().get(0).text());
    }
}

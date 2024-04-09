using HuggingFace;

namespace example;
public class ExampleModule : HuggingFaceModule
{
     public async Task Generate()
    {
        var apiKey =
            Environment.GetEnvironmentVariable("HUGGINGFACE_API_KEY") ??
            throw new AssertInconclusiveException("HUGGINGFACE_API_KEY environment variable is not found.");

        using var client = new HttpClient();
        var api = new HuggingFaceApi(apiKey, client);
        var response = await api.GenerateTextAsync(
            RecommendedModelIds.Gpt2,
            new GenerateTextRequest
            {
                Inputs = "Give random 5 words in response",
                Parameters = new GenerateTextRequestParameters
                {
                    Max_new_tokens = 250,
                    Return_full_text = false,
                },
                Options = new GenerateTextRequestOptions
                {
                    Use_cache = true,
                    Wait_for_model = false,
                },
            });
        response.Should().NotBeEmpty();

        foreach (var value in response)
        {
            Console.WriteLine(value.Generated_text);
        }
    }
    
    [TestMethod]
    public async Task Llama2()
    {
        var apiKey =
            Environment.GetEnvironmentVariable("HUGGINGFACE_API_KEY") ??
            throw new AssertInconclusiveException("HUGGINGFACE_API_KEY environment variable is not found.");

        using var client = new HttpClient();
        var api = new HuggingFaceApi(apiKey, client);
        var response = await api.GenerateTextAsync(
            RecommendedModelIds.Llama2.Chat._7B,
            new GenerateTextRequest
            {
                Inputs = "Give random 5 words in response",
                Parameters = new GenerateTextRequestParameters
                {
                    Max_new_tokens = 250,
                    Return_full_text = false,
                },
                Options = new GenerateTextRequestOptions
                {
                    Use_cache = true,
                    Wait_for_model = false,
                },
            });
        response.Should().NotBeEmpty();

        foreach (var value in response)
        {
            Console.WriteLine(value.Generated_text);
        }
    }
    
    [TestMethod]
    public async Task GenerateError()
    {
        var apiKey =
            Environment.GetEnvironmentVariable("HUGGINGFACE_API_KEY") ??
            throw new AssertInconclusiveException("HUGGINGFACE_API_KEY environment variable is not found.");

        using var client = new HttpClient();
        var api = new HuggingFaceApi(apiKey, client);
        Func<Task> act = async () => await api.GenerateTextAsync(
            RecommendedModelIds.Gpt2,
            new GenerateTextRequest
            {
                Inputs = "Hello",
                Parameters = new GenerateTextRequestParameters
                {
                    Max_new_tokens = 2501,
                    Return_full_text = false,
                },
                Options = new GenerateTextRequestOptions
                {
                    Use_cache = true,
                    Wait_for_model = false,
                },
            });
        
        await act.Should().ThrowAsync<ApiException>();
    }
}

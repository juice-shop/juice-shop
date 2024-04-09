from azure.openai import OpenAIClient  
from azure.core.credentials import AzureKeyCredential  
  
# Set up the Azure OpenAI client  
client_ai= OpenAIClient()  
api_key = os.environ["AZURE_OPENAI_API_KEY"]  
endpoint = os.environ["AZURE_OPENAI_ENDPOINT"]  
client = OpenAIClient(AzureKeyCredential(api_key), endpoint)  
  
# Define your input data  
input_data = {  
    "language": "en",  
    "text": "What is the capital of Italy?",  
}  
# Send the request to the Azure OpenAI API  
response = client.predict(input_data)  
  
# Extract the generated response  
generated_text = response.generated_text  
  
# Print the response  
print("Generated text:", generated_text)
import azure
from azure.openai import OpenAIClient 
from azure.ai.ml import MLClient 

new_client = OpenAIClient()
new_client_azure = MLClient()
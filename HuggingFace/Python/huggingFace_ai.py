from huggingface_hub import HfApi, list_models
from huggingface_hub import InferenceClient
# Use root method
models = list_models()

#Example1
# Or configure a HfApi client
hf_api = HfApi(
    endpoint="https://huggingface.co", # Can be a Private Hub endpoint.
    token="hf_xxx", # Token is not persisted on the machine.
)
models = hf_api.list_models()

#Example2
client = InferenceClient()
output = client.conversational("Hi, who are you?")



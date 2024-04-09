import { OpenAIClient } from "@azure/openai";
import { DefaultAzureCredential } from "@azure/identity";
import { HfAgent } from "@huggingface/agents";

function initializeClients() {
    const endpoint = "<your_openai_endpoint>"; // Replace with your OpenAI endpoint
    const HF_ACCESS_TOKEN = "hf_..."; // Replace with your Hugging Face access token

    const openaiClient = new OpenAIClient(endpoint, new DefaultAzureCredential());
    const agent = new HfAgent(HF_ACCESS_TOKEN);

    return { openaiClient, agent };
}

const { openaiClient, agent } = initializeClients();

// You can now use openaiClient and agent in the rest of your code

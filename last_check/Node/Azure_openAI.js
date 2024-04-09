const { OpenAIClient } = require("@azure/openai");
const { DefaultAzureCredential } = require("@azure/identity");


const client = new OpenAIClient("<endpoint>", new DefaultAzureCredential());
const openai = client
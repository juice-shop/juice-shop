import { HfAgent } from "@huggingface/agents";

const HF_ACCESS_TOKEN = "hf_..."; // get your token at https://huggingface.co/settings/tokens

const agent = new HfAgent(HF_ACCESS_TOKEN);

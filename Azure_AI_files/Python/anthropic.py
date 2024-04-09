import anthropic
import os

class Anthropic:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ['ANTHROPIC_API_KEY']
        self.c = anthropic.Client(self.api_key)

    def chat(self, prompt: str) -> dict:
        resp = self.c.completion(
            prompt=f"{anthropic.HUMAN_PROMPT} {prompt}{anthropic.AI_PROMPT}",
            stop_sequences=[anthropic.HUMAN_PROMPT],
            model="model1"
        )
        return resp


if __name__ == '__main__':
    pass
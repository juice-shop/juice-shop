import openai
from openai import Completion,ChatCompletion

def main():
    openai.api_key = "YOUR_API_KEY"  # Replace with your actual OpenAI API key
    openai.api_base = "https://api.openai.com/v1"  # Use the correct API endpoint

    model = "vicuna-7b-v1.5"
    prompt = "Once upon a time"

    # Create a completion
    completion = openai.Completion.create(model=model, prompt=prompt, max_tokens=64)
    # Print the completion
    print(prompt + completion.choices[0].text)

    # Create a chat completion
    completion = openai.ChatCompletion.create(
        model=model,
        messages=[{"role": "user", "content": "Hello! What is your name?"}]
    )
    # Print the completion
    print(completion.choices[0].message["content"])

if __name__ == "__main__":
    main()
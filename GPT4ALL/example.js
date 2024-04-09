const { createCompletion, loadModel } = require('gpt4all');
async function generateText() {
  // Load the GPT model
  const model = await loadModel('your-model-name', { verbose: true });

  // Define a prompt or input text
  const prompt = 'Generate a creative story about a forest adventure.';

  // Generate text based on the prompt
  const response = await createCompletion(model, [{ role: 'user', content: prompt }]);

  // Process and use the generated text
  console.log(response);
}

generateText();
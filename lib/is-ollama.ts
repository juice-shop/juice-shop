let isOllamaCached = false

export async function initOllamaCheck (): Promise<boolean> {
  const url = process.env.OLLAMA_URL ?? 'http://localhost:11434'
  try {
    const res = await fetch(`${url}/api/tags`, { signal: AbortSignal.timeout(2000) })
    isOllamaCached = res.ok
  } catch {
    isOllamaCached = false
  }
  return isOllamaCached
}

export default function isOllama (): boolean {
  return isOllamaCached
}

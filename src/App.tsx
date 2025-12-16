import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { geminiClient } from './lib/gemini'

function App() {
  const [count, setCount] = useState(0)
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setResponse('');
    try {
      const result = await geminiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      console.log(result);
      // The snippet says result.text. Let's check the type definition or just trust the snippet.
      // Snippet: console.log(response.text);
      // But wait, the snippet has async function main() { const response = await ... }
      // So result is the response.
      setResponse(result.text || "No text returned");
    } catch (error) {
      console.error("Gemini Error:", error);
      setResponse("Error generating content. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + Gemini</h1>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px', margin: '0 auto' }}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask Gemini something..."
          style={{ padding: '0.5rem', fontSize: '1rem' }}
        />
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate with Gemini'}
        </button>
        {response && (
          <div style={{ textAlign: 'left', padding: '1rem', background: '#f0f0f0', borderRadius: '8px', color: '#333' }}>
            <strong>Response:</strong>
            <p style={{ whiteSpace: 'pre-wrap' }}>{response}</p>
          </div>
        )}
      </div>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App

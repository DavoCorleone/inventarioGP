const fs = require('fs');

async function main() {
  let apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Read from .env.local
    const envs = fs.readFileSync('.env.local', 'utf8');
    const match = envs.match(/GEMINI_API_KEY=["']?([^"'\n]+)/);
    if (match) apiKey = match[1];
  }

  if (!apiKey) {
    console.error("No API key found in .env.local");
    return;
  }

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  if (data.error) {
    console.error("API Error:", data.error);
    return;
  }
  console.log("Available models:");
  data.models.forEach(m => console.log(m.name, m.supportedGenerationMethods.join(", ")));
}

main();

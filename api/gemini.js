// api/gemini.js
// Vercel Serverless Function proxy for Google Gemini API

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Get secure API Key from server environment variable
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'Gemini API Key is not configured in Server environment variables. Please add GEMINI_API_KEY in your hosting dashboard.' 
    });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required in the request body.' });
    }

    // Call official Gemini API server-side
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.error?.message || 'Error occurred querying the Gemini API.' 
      });
    }

    // Return the response data safely
    return res.status(200).json(data);
  } catch (error) {
    console.error("Serverless Gemini Proxy Error:", error);
    return res.status(500).json({ error: 'Internal Server Error occurred in proxy function.' });
  }
}

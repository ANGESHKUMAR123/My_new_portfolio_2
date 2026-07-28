// netlify/functions/chat.js
//
// This function runs on Netlify's servers, never in the browser.
// Your Gemini API key lives only in Netlify's environment variables,
// so it's never exposed in the page source.
//
// Uses Google Gemini's FREE tier (gemini-2.5-flash / flash-lite) —
// no credit card needed to get a key.

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Server misconfigured: missing GEMINI_API_KEY" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages array required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Gemini's REST format is different from OpenAI's:
  // - system prompt goes in "systemInstruction"
  // - roles are "user" / "model" (not "assistant")
  // - message content goes under "parts": [{ text }]
  const systemMsg = messages.find((m) => m.role === "system");
  const turns = messages.filter((m) => m.role !== "system");

  const contents = turns.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const MODEL = "gemini-2.5-flash"; // free tier; swap to gemini-2.5-flash-lite for higher free RPM
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        ...(systemMsg
          ? { systemInstruction: { parts: [{ text: systemMsg.content }] } }
          : {}),
        generationConfig: {
          maxOutputTokens: 300,
          temperature: 0.4,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini error:", geminiRes.status, errText);
      return new Response(
        JSON.stringify({ error: "Upstream AI error", status: geminiRes.status }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await geminiRes.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!reply) {
      return new Response(JSON.stringify({ error: "Empty AI reply" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }
    

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Chat function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/chat",
};

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { action, text } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set" },
        { status: 500 }
      );
    }

    const prompts: Record<string, string> = {
      improve: "Improve this resume bullet. Make it stronger, clearer, and more impactful. Use action verbs.",
      "rewrite-pro": "Rewrite professionally with a polished tone suitable for a resume.",
      "add-metrics": "Add measurable metrics, numbers, and results to improve impact. If no specific numbers are in the text, use placeholders like [X]% or $[Y].",
      shorten: "Shorten this text while keeping its meaning and strength.",
      expand: "Expand this text with more detail and context, but keep it concise.",
      grammar: "Fix grammar and clarity while preserving meaning."
    };

    const promptInstruction = prompts[action] || prompts["improve"];

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${promptInstruction}\n\nInput:\n${text}\n\nOutput ONLY the improved resume text. Do not include any explanations, markdown formatting, or quotes.`
            }
          ]
        }
      ]
    });

    const output = result.response.text().trim();

    return NextResponse.json({ result: output });

  } catch (err) {
    console.error("Gemini Error:", err);
    return NextResponse.json({ error: "Gemini generation failed" }, { status: 500 });
  }
}

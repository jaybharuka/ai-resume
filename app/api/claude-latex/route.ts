import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  try {
    // Check for API key
    if (!process.env.CLAUDE_API_KEY) {
      console.error('CLAUDE_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'Claude API key not configured. Please add CLAUDE_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }

    const client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });

    const { prompt, resumeText, jdText } = await req.json();
    
    console.log('Claude API called with:', {
      promptLength: prompt?.length || 0,
      resumeLength: resumeText?.length || 0,
      jdLength: jdText?.length || 0
    });

    if (!resumeText) {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      );
    }

    // Construct the full message for Claude
    const fullPrompt = `${prompt}

Resume:
${resumeText}

${jdText ? `Job Description:\n${jdText}` : ''}`;

    console.log('Calling Claude API with full prompt length:', fullPrompt.length);
    console.log('First 200 chars of prompt:', fullPrompt.substring(0, 200));

    // Call Claude API
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: fullPrompt,
        },
      ],
    });

    console.log('Claude API response received:', {
      contentLength: message.content[0].type === 'text' ? message.content[0].text.length : 0,
      usage: message.usage
    });

    // Extract the LaTeX code from Claude's response
    const output = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    // Clean up the output (remove markdown code blocks if present)
    let cleanedLatex = output;
    if (cleanedLatex.includes('```latex')) {
      cleanedLatex = cleanedLatex.replace(/```latex\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedLatex.includes('```')) {
      cleanedLatex = cleanedLatex.replace(/```\n?/g, '');
    }

    return NextResponse.json({
      latex: cleanedLatex.trim(),
      model: 'claude-3-5-sonnet-20241022',
      tokens: message.usage,
    });

  } catch (error: any) {
    console.error('Claude API Error:', {
      message: error.message,
      status: error.status,
      type: error.type,
      error: error
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate LaTeX code';
    
    if (error.status === 401) {
      errorMessage = 'Invalid Claude API key. Please check your CLAUDE_API_KEY in .env.local';
    } else if (error.status === 429) {
      errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
    } else if (error.status === 400) {
      errorMessage = 'Invalid request to Claude API. Please check your inputs.';
    } else if (error.message) {
      errorMessage = `Claude API error: ${error.message}`;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message || 'Unknown error',
        status: error.status || 500
      },
      { status: error.status || 500 }
    );
  }
}

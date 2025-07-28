import { enhancePromptSession } from "@/configs/AiModel";
import Prompt from "@/data/Prompt";
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { prompt } = await request.json();
        
        const result = await enhancePromptSession.sendMessage([
            Prompt.ENHANCE_PROMPT_RULES,
            `Original prompt: ${prompt}`
        ]);
        
        const text = result.response.text();
        
        return NextResponse.json({
            enhancedPrompt: text.trim()
        });
    } catch (error) {
        console.error('Enhance prompt error:', error);
        
        // Check for specific error types
        if (error.message.includes('API_KEY')) {
            return NextResponse.json({ 
                error: 'API key not configured. Please set GEMINI_API_KEY in your environment variables.',
                success: false 
            }, { status: 500 });
        }
        
        return NextResponse.json({ 
            error: error.message || 'Failed to enhance prompt',
            success: false 
        }, { status: 500 });
    }
} 
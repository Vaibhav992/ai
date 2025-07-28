import { NextResponse } from "next/server";
import { FollowUpQuestionsSession } from '@/configs/AiModel';
import Prompt from '@/data/Prompt';

export async function POST(req) {
    try {
        const { userPrompt } = await req.json();
        
        const followUpPrompt = `User Request: ${userPrompt}\n\n${Prompt.FOLLOW_UP_QUESTIONS_PROMPT}`;
        
        const result = await FollowUpQuestionsSession.sendMessage(followUpPrompt);
        const response = result.response.text();
        
        // Try to parse JSON response, with fallback
        try {
            return NextResponse.json(JSON.parse(response));
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            // Return a fallback response if JSON parsing fails
            return NextResponse.json({
                questions: [
                    {
                        id: 1,
                        question: "What specific features would you like in your app?",
                        category: "features",
                        options: ["User authentication", "Data storage", "Real-time updates", "Push notifications"]
                    },
                    {
                        id: 2,
                        question: "What design style do you prefer?",
                        category: "ui_ux",
                        options: ["Modern and minimal", "Colorful and playful", "Professional and corporate", "Dark theme"]
                    },
                    {
                        id: 3,
                        question: "Which platforms are most important to you?",
                        category: "platform",
                        options: ["Web only", "Mobile only", "Both web and mobile"]
                    }
                ],
                totalQuestions: 3
            });
        }
    } catch (error) {
        console.error('Follow-up questions error:', error);
        
        // Check for specific error types
        if (error.message.includes('API_KEY')) {
            return NextResponse.json({ 
                error: 'API key not configured. Please set GEMINI_API_KEY in your environment variables.',
                success: false 
            }, { status: 500 });
        }
        
        return NextResponse.json({ 
            error: error.message || "Failed to generate follow-up questions",
            success: false 
        }, { status: 500 });
    }
} 
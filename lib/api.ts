// lib/api.ts

// Message type should match the one from the API route
interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface ChatResponse {
    response: {
        response_type: 'question' | 'assessment';
        question?: {
            text: string;
            type: 'multiple_choice' | 'numeric' | 'free_response';
            options?: string[];
        };
        assessment?: {
            possible_conditions: Array<{
                condition: string;
                likelihood: 'high' | 'medium' | 'low';
                type: 'bacterial' | 'viral' | 'other';
            }>;
            recommended_treatments: Array<{
                name: string;
                type: 'otc_medication' | 'home_remedy';
                instructions: string;
            }>;
            doctor_visit_recommendation: {
                urgency: 'immediate' | 'within_24_hours' | 'within_week' | 'not_needed';
                reason: string;
            };
            expected_recovery_time: string;
        };
    };
    messages: Message[];
}

export async function sendMessage(messages: Message[], userInput: string): Promise<ChatResponse> {
    try {
        const response = await fetch('/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages,
                userInput,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

// Optional: Add type guard functions to validate responses
export function isValidChatResponse(data: any): data is ChatResponse {
    return (
        data &&
        typeof data === 'object' &&
        'response' in data &&
        'messages' in data &&
        Array.isArray(data.messages) &&
        data.messages.every((msg: any) =>
            msg &&
            typeof msg === 'object' &&
            'role' in msg &&
            'content' in msg &&
            typeof msg.content === 'string' &&
            (msg.role === 'system' || msg.role === 'user' || msg.role === 'assistant')
        )
    );
}
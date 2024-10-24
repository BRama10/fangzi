// app/api/medical-chat/route.ts
import OpenAI from 'openai';
import { NextRequest } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache'
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { PROMPT_TEMPLATE } from '@/lib/const';

noStore()

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Type definitions
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ConversationRequest {
  messages?: Message[];
  userInput: string;
}

// Helper function to convert our Message type to OpenAI's ChatCompletionMessageParam
function convertToOpenAIMessages(messages: Message[]): ChatCompletionMessageParam[] {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content
  })) as ChatCompletionMessageParam[];
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body: ConversationRequest = await req.json();
    const { messages = [], userInput } = body;

    // Initialize conversation if it's the first message
    const conversationMessages: Message[] = messages.length === 0 
      ? [
          {
            role: 'system',
            content: PROMPT_TEMPLATE // Your medical system prompt
          }
        ]
      : messages;

    // Add user's message
    conversationMessages.push({
      role: 'user',
      content: userInput
    });

    // Convert messages to OpenAI's expected format
    const openAIMessages = convertToOpenAIMessages(conversationMessages);

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // or your preferred model
      messages: openAIMessages,
      temperature: 0.7,
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    // Get the assistant's response
    const assistantMessage = completion.choices[0].message;

    // Add assistant's response to conversation history
    conversationMessages.push({
      role: 'assistant',
      content: assistantMessage.content || '{}'
    });

    // Parse the JSON response
    const responseContent = JSON.parse(assistantMessage.content || '{}');

    // Return the response with full conversation history
    return Response.json({
      response: responseContent,
      messages: conversationMessages,
    }, { status: 200 });

  } catch (error) {
    console.error('Error in medical chat API:', error);
    return Response.json({
      error: 'Failed to process medical chat request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
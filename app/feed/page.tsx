// app/medical-chat/page.tsx
'use client';

import { useState } from 'react';
import { sendMessage } from '@/lib/api';

interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export default function MedicalChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setLoading(true);
        try {
            const response = await sendMessage(messages, input);
            setMessages(response.messages);

            // Handle the response based on type
            const aiResponse = response.response;
            if (aiResponse.response_type === 'question') {
                // Display question UI based on question type
                if (aiResponse.question?.type === 'multiple_choice') {
                    // Render multiple choice options
                } else if (aiResponse.question?.type === 'numeric') {
                    // Render numeric input (1-10)
                } else {
                    // Render free response input
                }
            } else {
                // Display final assessment UI
            }

        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
            setInput('');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="space-y-4 mb-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`p-4 rounded-lg ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                        {typeof msg.content === 'string'
                            ? msg.content
                            : JSON.stringify(msg.content, null, 2)}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 p-2 border rounded"
                    placeholder="Describe your symptoms..."
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                >
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    );
}
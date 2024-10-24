'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle, Clock, Pill, Stethoscope, SendHorizontal, Bot
} from "lucide-react";
import { sendMessage } from '@/lib/api';
import { PROMPT_TEMPLATE } from '@/lib/const';

type MessageOption = {
  id: string;
  text: string;
  value: string;
};

type Message = {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  type?: 'text' | 'options' | 'scale' | 'input' | 'symptomSelect';
  options?: MessageOption[];
  selected?: string;
  imageUrl?: string;
};

type Diagnosis = {
  condition: string;
  likelihood: number;
  type: 'bacterial' | 'viral' | 'other';
  description: string;
};

type Treatment = {
  medicine: string;
  dosage: string;
  frequency: string;
  notes?: string;
};

type DiagnosisResult = {
  diagnoses: Diagnosis[];
  treatments: Treatment[];
  requiresDoctor: boolean;
  urgency: 'low' | 'medium' | 'high';
  recoveryTime: string;
};

// ... (previous types remain the same) ...

type APIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

// Add these type definitions at the top
interface APIResponse {
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
}

const SymptomChecker = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [apiMessages, setApiMessages] = useState<APIMessage[]>([]);


  const commonSymptoms = [
    'Headache', 'Fever', 'Cough', 'Fatigue',
    'Nausea', 'Sore Throat', 'Body Aches'
  ];

  useEffect(() => {
    if (messages.length === 0) {
      const initialMessages: Message[] = [
        {
          id: '1',
          text: "Hi! I'm your AI health assistant. I'm here to help you understand your symptoms.",
          sender: 'bot',
          type: 'text'
        },
        {
          id: '2',
          text: "What symptoms are you experiencing? You can select from common symptoms or type your own.",
          sender: 'bot',
          type: 'symptomSelect'
        }
      ];
      setMessages(initialMessages);
    }
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (apiMessages.length === 0) {
      setApiMessages([{
        role: 'system',
        content: PROMPT_TEMPLATE // Make sure to define this constant
      }]);
    }
  }, [apiMessages]);

  // Update handleUserInput function
  const handleUserInput = async (input: string) => {
    if (!input.trim()) return;

    //@ts-ignore
    let loadingId = Date.now().toString();

    try {
      setIsTyping(true);

      // Add user message to UI immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        text: input,
        sender: 'user',
        type: 'text'
      };
      setMessages(prev => [...prev, userMessage]);
      setCurrentInput('');

      // Add loading message

      setMessages(prev => [...prev, {
        id: loadingId,
        text: "Thinking...",
        sender: 'bot',
        type: 'text'
      }]);

      const response = await sendMessage(apiMessages, input);

      // Remove loading message
      setMessages(prev => prev.filter(msg => msg.id !== loadingId));

      setApiMessages(response.messages);

      const botMessage = processApiResponse(response.response);
      if (botMessage) {
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev.filter(msg => msg.id !== loadingId), {
        id: Date.now().toString(),
        text: "I'm sorry, I encountered an error. Please try again.",
        sender: 'bot',
        type: 'text'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  //@ts-ignore
  const isValidResponse = (response: any): response is APIResponse => {
    return response &&
      (response.response_type === 'question' || response.response_type === 'assessment') &&
      (response.response_type === 'question' ? !!response.question : !!response.assessment);
  };


  // Convert API response to UI message format
  const processApiResponse = (response: APIResponse): Message | null => {
    try {
      if (response.response_type === 'question' && response.question) {
        let messageType: Message['type'] = 'text';
        let options: MessageOption[] | undefined;

        if (response.question.type === 'multiple_choice' && response.question.options) {
          messageType = 'options';
          options = response.question.options.map((opt, index) => ({
            id: index.toString(),
            text: opt,
            value: opt
          }));
        } else if (response.question.type === 'numeric') {
          messageType = 'scale';
          options = Array.from({ length: 10 }, (_, i) => ({
            id: (i + 1).toString(),
            text: (i + 1).toString(),
            value: (i + 1).toString()
          }));
        }

        return {
          id: Date.now().toString(),
          text: response.question.text,
          sender: 'bot',
          type: messageType,
          options
        };
      } else if (response.response_type === 'assessment' && response.assessment) {
        displayAssessment(response.assessment);
        return {
          id: Date.now().toString(),
          text: "I've analyzed your symptoms and prepared a detailed assessment. You can view it in the panel to the right.",
          sender: 'bot',
          type: 'text'
        };
      }
      return null;
    } catch (error) {
      console.error('Error processing API response:', error);
      return {
        id: Date.now().toString(),
        text: "I apologize, but I couldn't process the response correctly. Please try again.",
        sender: 'bot',
        type: 'text'
      };
    }
  }

  const displayAssessment = (assessment: APIResponse['assessment']) => {
    if (!assessment) return;

    try {
      const diagnosisResult: DiagnosisResult = {
        diagnoses: assessment.possible_conditions.map(condition => ({
          condition: condition.condition,
          likelihood: condition.likelihood === 'high' ? 0.9 :
            condition.likelihood === 'medium' ? 0.6 : 0.3,
          type: condition.type,
          description: `This condition is ${condition.likelihood} likelihood and requires attention.`
        })),
        treatments: assessment.recommended_treatments.map(treatment => ({
          medicine: treatment.name,
          dosage: treatment.instructions,
          frequency: 'As needed', // Default value
          notes: treatment.type === 'otc_medication' ?
            'Over-the-counter medication' : 'Home remedy'
        })),
        requiresDoctor: assessment.doctor_visit_recommendation.urgency !== 'not_needed',
        urgency: assessment.doctor_visit_recommendation.urgency === 'immediate' ? 'high' :
          assessment.doctor_visit_recommendation.urgency === 'within_24_hours' ? 'medium' : 'low',
        recoveryTime: assessment.expected_recovery_time || 'Varies based on treatment adherence'
      };

      setDiagnosis(diagnosisResult);
    } catch (error) {
      console.error('Error processing assessment:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "I apologize, but I couldn't process the assessment correctly. Please try describing your symptoms again.",
        sender: 'bot',
        type: 'text'
      }]);
    }
  };

  const handleOptionSelect = (messageId: string, option: MessageOption) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, selected: option.value }
        : msg
    ));

    handleUserInput(option.text);
  };

  const handleSymptomSelect = (symptom: string) => {
    handleUserInput(symptom);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="h-[calc(100vh-2rem)] max-w-5xl mx-auto flex gap-4">
        {/* Chat Interface */}
        <Card className="w-1/2 flex flex-col bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4 flex-1 flex flex-col h-full overflow-hidden">
            {/* Messages Container */}
            <div
              className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 scroll-smooth"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#E5E7EB transparent'
              }}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} 
                  animate-fadeIn`}
                >
                  {message.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <Bot className="w-5 h-5 text-blue-600" />
                    </div>
                  )}

                  <div className={`max-w-[80%] ${message.type === 'options' || message.type === 'scale' || message.type === 'symptomSelect'
                    ? 'w-full'
                    : ''
                    }`}>
                    {message.type === 'text' && (
                      <div className={`p-3 rounded-lg animate-slideIn ${message.sender === 'user'
                        ? 'bg-blue-500 text-white ml-auto rounded-br-none'
                        : 'bg-white shadow-sm border rounded-bl-none'
                        }`}>
                        {message.text}
                      </div>
                    )}

                    {message.type === 'options' && (
                      <div className="space-y-2 animate-slideUp">
                        <div className="p-3 rounded-lg bg-white shadow-sm border rounded-bl-none">
                          {message.text}
                        </div>
                        <div className="space-y-2">
                          {message.options?.map((option) => (
                            <Button
                              key={option.id}
                              onClick={() => handleOptionSelect(message.id, option)}
                              variant="outline"
                              className={`w-full justify-start hover:bg-blue-50 transition-colors ${message.selected === option.value ? 'bg-blue-50 border-blue-200' : ''
                                }`}
                            >
                              {option.text}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {message.type === 'scale' && (
                      <div className="space-y-2 animate-slideUp">
                        <div className="p-3 rounded-lg bg-white shadow-sm border rounded-bl-none">
                          {message.text}
                        </div>
                        <div className="grid grid-cols-10 gap-1">
                          {message.options?.map((option) => (
                            <Button
                              key={option.id}
                              onClick={() => handleOptionSelect(message.id, option)}
                              variant="outline"
                              className={`p-2 hover:bg-blue-50 transition-colors ${message.selected === option.value
                                ? 'bg-blue-50 border-blue-200'
                                : ''
                                }`}
                            >
                              {option.text}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {message.type === 'symptomSelect' && (
                      <div className="space-y-2 animate-slideUp">
                        <div className="p-3 rounded-lg bg-white shadow-sm border rounded-bl-none">
                          {message.text}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {commonSymptoms.map((symptom) => (
                            <Button
                              key={symptom}
                              onClick={() => handleSymptomSelect(symptom)}
                              variant="outline"
                              className="hover:bg-blue-50 transition-colors"
                            >
                              {symptom}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="p-3 rounded-lg bg-white shadow-sm border rounded-bl-none w-16">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex gap-2 bg-white p-2 rounded-lg shadow-sm border mt-auto">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSymptomSelect(currentInput)}
                className="flex-1 p-2 focus:outline-none"
                placeholder="Type your symptoms..."
              />
              <Button
                onClick={() => handleSymptomSelect(currentInput)}
                size="icon"
                className="hover:bg-blue-600 transition-colors"
              >
                <SendHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="w-1/2 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
          <CardContent
            className="p-4 h-full overflow-y-auto"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#E5E7EB transparent'
            }}
          >
            {!diagnosis ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                  <Stethoscope className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-center">Share your symptoms and I&apos;ll provide a detailed analysis here</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                {/* Diagnosis Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Potential Conditions
                  </h3>
                  <div className="space-y-3">
                    {diagnosis.diagnoses.map((d, i) => (
                      <div
                        key={i}
                        className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow animate-slideIn"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-lg">{d.condition}</span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {(d.likelihood * 100).toFixed(0)}% likelihood
                          </span>
                        </div>
                        <p className="text-gray-600">{d.description}</p>
                        <div className="mt-2">
                          <span className="text-sm px-2 py-1 bg-gray-100 rounded-full">
                            {d.type.charAt(0).toUpperCase() + d.type.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Treatments Section */}
                {diagnosis.treatments.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Pill className="h-5 w-5" />
                      Recommended Treatments
                    </h3>
                    <div className="space-y-3">
                      {diagnosis.treatments.map((t, i) => (
                        <div key={i} className="p-4 bg-white rounded-lg shadow-sm border">
                          <div className="font-medium text-lg mb-1">{t.medicine}</div>
                          <div className="space-y-1 text-sm">
                            <div className="flex gap-2">
                              <span className="font-medium">Dosage:</span>
                              <span>{t.dosage}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-medium">Frequency:</span>
                              <span>{t.frequency}</span>
                            </div>
                            {t.notes && (
                              <div className="mt-2 text-gray-600 italic">
                                Note: {t.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Doctor Visit Recommendation */}
                {diagnosis.requiresDoctor && (
                  <Alert className={`
                  ${diagnosis.urgency === 'high' ? 'bg-red-50 border-red-200' :
                      diagnosis.urgency === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-blue-50 border-blue-200'}
                `}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {diagnosis.urgency === 'high'
                        ? 'Please seek immediate medical attention'
                        : diagnosis.urgency === 'medium'
                          ? 'Recommended to consult with a healthcare provider soon'
                          : 'Consider scheduling a check-up with your healthcare provider'}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Recovery Time */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Expected Recovery Time
                  </h3>
                  <div className="p-4 bg-white rounded-lg shadow-sm border">
                    <p>{diagnosis.recoveryTime}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
      </div>
    </div>
  );
};

export default SymptomChecker;
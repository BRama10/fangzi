import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertCircle, Clock, Pill, Stethoscope, SendHorizontal, 
  ThermometerSun, Activity, HeartPulse, Bot
} from "lucide-react";

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

const SymptomChecker = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const simulateTyping = (callback: () => void) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, Math.random() * 1000 + 500);
  };

  const handleSymptomSelect = (symptom: string) => {
    addMessage({
      id: Date.now().toString(),
      text: symptom,
      sender: 'user',
      type: 'text'
    });

    simulateTyping(() => {
      if (symptom.toLowerCase() === 'headache') {
        addMessage({
          id: Date.now().toString(),
          text: "How severe is your headache?",
          sender: 'bot',
          type: 'scale',
          options: Array.from({length: 10}, (_, i) => ({
            id: (i + 1).toString(),
            text: (i + 1).toString(),
            value: (i + 1).toString()
          }))
        });
      } else if (symptom.toLowerCase() === 'fever') {
        addMessage({
          id: Date.now().toString(),
          text: "What's your temperature?",
          sender: 'bot',
          type: 'options',
          options: [
            { id: '1', text: 'Below 38°C (100.4°F)', value: 'low' },
            { id: '2', text: '38°C-39°C (100.4°F-102.2°F)', value: 'medium' },
            { id: '3', text: 'Above 39°C (102.2°F)', value: 'high' }
          ]
        });
      } else {
        handleFinalDiagnosis(symptom);
      }
    });
  };

  const handleOptionSelect = (messageId: string, option: MessageOption) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, selected: option.value }
        : msg
    ));

    addMessage({
      id: Date.now().toString(),
      text: option.text,
      sender: 'user',
      type: 'text'
    });

    simulateTyping(() => {
      if (option.value === 'high') {
        addMessage({
          id: Date.now().toString(),
          text: "How long have you had this fever?",
          sender: 'bot',
          type: 'options',
          options: [
            { id: '1', text: 'Less than 24 hours', value: 'recent' },
            { id: '2', text: '1-3 days', value: 'short' },
            { id: '3', text: 'More than 3 days', value: 'long' }
          ]
        });
      } else {
        handleFinalDiagnosis(option.value);
      }
    });
  };

  const handleFinalDiagnosis = (symptom: string) => {
    // const result = mockDiagnosis(symptom);

    // setDiagnosis(result);
    
    // addMessage({
    //   id: Date.now().toString(),
    //   text: "I've analyzed your symptoms and prepared a detailed assessment. You can view it in the panel to the right.",
    //   sender: 'bot',
    //   type: 'text'
    // });
  };

  return (
    <div className="h-[600px] max-w-5xl mx-auto p-4 flex gap-4">
      {/* Chat Interface */}
      <Card className="w-1/2 h-full flex flex-col bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
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
                
                <div className={`max-w-[80%] ${
                  message.type === 'options' || message.type === 'scale' || message.type === 'symptomSelect'
                    ? 'w-full'
                    : ''
                }`}>
                  {message.type === 'text' && (
                    <div className={`p-3 rounded-lg animate-slideIn ${
                      message.sender === 'user'
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
                            className={`w-full justify-start hover:bg-blue-50 transition-colors ${
                              message.selected === option.value ? 'bg-blue-50 border-blue-200' : ''
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
                            className={`p-2 hover:bg-blue-50 transition-colors ${
                              message.selected === option.value 
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
          <div className="flex gap-2 bg-white p-2 rounded-lg shadow-sm border">
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
      <Card className="w-1/2 h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
        <CardContent className="p-4">
          {!diagnosis ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-center">Share your symptoms and I'll provide a detailed analysis here</p>
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

              {/* Rest of the results panel remains similar but with added animations */}
              {/* ... previous results panel code ... */}
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
  );
};

export default SymptomChecker;
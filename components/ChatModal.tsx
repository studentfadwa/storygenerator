import React, { useState, useEffect, useRef } from 'react';
import * as webllm from '@mlc-ai/web-llm';
import { SendIcon, CloseIcon } from './icons';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelInitProgress, setModelInitProgress] = useState('');

  const engineRef = useRef<webllm.MLCEngine | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use a capable and relatively small model that runs well in the browser.
  const SELECTED_MODEL = "gemma-2b-it-q4f32_1-MLC";
  
  const CHAT_SYSTEM_PROMPT = "أنت مساعد ذكاء اصطناعي إبداعي وودود. مهمتك هي مساعدة المستخدم في كتابة قصص الأطفال. يمكنك اقتراح أفكار، كتابة فقرات، المساعدة في تطوير الشخصيات، أو الإجابة على أي سؤال يتعلق بعملية الكتابة الإبداعية. حافظ على نبرة إيجابية ومشجعة. كن موجزًا ومباشرًا في ردودك.";

  const initEngine = async () => {
    setIsModelLoading(true);
    setModelInitProgress('جاري تهيئة مساعد الذكاء الاصطناعي...');
    try {
      const engine = await webllm.CreateMLCEngine(SELECTED_MODEL, {
          initProgressCallback: (progress) => {
              setModelInitProgress(progress.text);
          }
      });
      engineRef.current = engine;
      setMessages([{ sender: 'ai', text: 'مرحباً! أنا مساعدك الإبداعي. كيف يمكنني مساعدتك في قصتك اليوم؟' }]);
    } catch (err) {
      console.error(err);
      setModelInitProgress("فشل تحميل المساعد. قد لا يدعم متصفحك هذه الميزة أو قد تكون هناك مشكلة في الشبكة.");
    } finally {
      setIsModelLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !engineRef.current && !isModelLoading) {
      initEngine();
    } else if (!isOpen) {
      // Don't unload the model to avoid re-downloading.
      // Reset the state for the next time it opens.
      setMessages([]);
      setInputValue('');
    }
  }, [isOpen]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isGenerating || isModelLoading || !engineRef.current) return;

    const userMessage: Message = { sender: 'user', text: trimmedInput };
    
    // Construct the conversation history for the model
    const conversationHistory: webllm.ChatCompletionMessageParam[] = [
        { role: 'system', content: CHAT_SYSTEM_PROMPT },
        ...messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
        }) as webllm.ChatCompletionMessageParam),
        { role: 'user', content: trimmedInput }
    ];

    setMessages(prev => [...prev, userMessage, { sender: 'ai', text: '' }]); // Add an empty placeholder for the AI's response
    setInputValue('');
    setIsGenerating(true);

    try {
      const stream = await engineRef.current.chat.completions.create({
          stream: true,
          messages: conversationHistory,
      });

      for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || "";
          if (delta) {
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.sender === 'ai') {
                    lastMessage.text += delta;
                }
                return newMessages;
            });
          }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.sender === 'ai') {
            lastMessage.text = "عذراً، حدث خطأ ما. الرجاء المحاولة مرة أخرى.";
          }
          return newMessages;
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-white text-stone-800 rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-stone-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-amber-900 font-amiri">مساعد الذكاء الاصطناعي</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-200 transition-colors" aria-label="إغلاق">
            <CloseIcon />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {isModelLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800"></div>
                <p className="mt-4 font-semibold text-amber-900">جاري تحميل المساعد...</p>
                <p className="text-sm text-stone-600 px-4">{modelInitProgress}</p>
                <p className="text-xs text-stone-500 mt-2">(يحدث هذا التحميل مرة واحدة فقط)</p>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md lg:max-w-lg p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-stone-200 text-stone-800 rounded-bl-none'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-stone-200 p-3 rounded-2xl rounded-bl-none">
                    <div className="flex items-center justify-center gap-2 px-2">
                        <span className="h-2 w-2 bg-stone-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-stone-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-stone-500 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </main>

        <footer className="p-4 border-t border-stone-200 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={isModelLoading || !engineRef.current ? "الرجاء الانتظار حتى يتم تحميل المساعد..." : "اكتب رسالتك هنا..."}
              className="flex-1 w-full p-3 border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-300"
              disabled={isGenerating || isModelLoading || !engineRef.current}
            />
            <button
              type="submit"
              disabled={isGenerating || isModelLoading || !engineRef.current || !inputValue.trim()}
              className="p-3 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition-colors disabled:bg-stone-400 disabled:cursor-not-allowed"
              aria-label="إرسال"
            >
              <SendIcon />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default ChatModal;
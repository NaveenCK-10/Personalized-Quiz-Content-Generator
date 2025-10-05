import React, { useState, useEffect, useRef } from 'react';
// FIX: Removed the unused 'Bot' icon to resolve the warning.
import { Loader2, Send } from 'lucide-react';

export default function Chatbot({ history, onSendMessage, isLoading }) {
  const [input, setInput] = useState('');
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [history]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };
  
  return (
    <>
      <div ref={chatWindowRef} className="flex-grow p-4 overflow-y-auto flex flex-col gap-3">
        {history && history.slice(1).map((msg, index) => ( // slice(1) to skip the initial context
          <div key={index} className={`p-3 rounded-xl max-w-sm text-sm ${msg.role === 'user' ? 'chat-bubble-user self-end' : 'chat-bubble-ai self-start'}`}>
            {msg.parts[0].text}
          </div>
        ))}
        {isLoading && <div className="p-3 self-start"><Loader2 className="w-6 h-6 animate-spin text-pink-300" /></div>}
      </div>
      <div className="p-2 border-t border-white/10">
        <div className="flex gap-2 items-center">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
            className="flex-grow p-2 bg-black/20 border border-white/20 rounded-full text-sm px-4 text-white placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500 outline-none" 
            placeholder="Ask a brief question..." 
          />
          <button 
            onClick={handleSend} 
            disabled={isLoading} 
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold p-2 rounded-full hover:scale-110 disabled:bg-gray-500 transition-all"
          >
            <Send size={20}/>
          </button>
        </div>
      </div>
      <style jsx>{`
        .chat-bubble-user { 
          background-color: #a21caf; 
          color: white; 
        }
        .chat-bubble-ai { 
          background-color: rgba(255, 255, 255, 0.1); 
          color: #fbcfe8; 
        }
      `}</style>
    </>
  );
};

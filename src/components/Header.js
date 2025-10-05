import React from 'react';
import { Bot } from 'lucide-react';

export default function Header() {
  return (
    <header className="text-center py-6">
      <div className="inline-block bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-full shadow-lg">
        <Bot size={40} className="text-white" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mt-4">Personalized Learning Assistant</h1>
      <p className="text-lg text-gray-600 mt-2">Your AI-powered study partner.</p>
    </header>
  );
}

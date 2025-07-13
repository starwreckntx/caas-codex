import React, { useState, useRef, useEffect } from 'react';
import type { Message, AppFile } from '../types';
import { Role } from '../types';
import { SendIcon, UserIcon, ModelIcon, DownloadIcon } from '../constants';
import { Spinner } from './Spinner';

interface ChatViewProps {
  files: AppFile[];
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  error: string | null;
}

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isModel = message.role === Role.Model;
  return (
    <div className={`flex items-start gap-4 py-4`}>
      <div className="flex-shrink-0">{isModel ? <ModelIcon /> : <UserIcon />}</div>
      <div className="flex-grow pt-1">
        <p className="text-green-300 leading-relaxed whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
};

export const ChatView: React.FC<ChatViewProps> = ({ files, messages, onSendMessage, isLoading, error }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = () => {
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleDownload = () => {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const fileList = files.length > 0 
      ? files.map(f => `> ${f.name}`).join('\n')
      : 'No data streams ingested.';
      
    let chatContent = `Hue and Logic - Logic Stream Log\nTimestamp: ${new Date().toLocaleString()}\n\n`;
    chatContent += `=== KNOWLEDGE BASE ===\n${fileList}\n\n`;
    chatContent += `=== LOG ===\n\n`;
    
    messages.forEach(msg => {
      const prefix = msg.role === Role.User ? 'USER_QUERY' : 'LOGIC_CORE';
      chatContent += `// ${prefix}:\n${msg.text}\n\n--------------------------------\n\n`;
    });
  
    const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hue-and-logic-chat-${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col bg-black/80 h-full">
      <header className="p-4 bg-black/50 border-b-2 border-green-900/50 flex items-center justify-between z-10">
        <h2 className="text-lg font-bold text-green-400">// Logic Stream</h2>
        <button
          onClick={handleDownload}
          className="flex items-center bg-black/50 hover:bg-green-900/50 text-green-400 font-bold py-2 px-3 rounded-md text-sm transition-colors border-2 border-green-900/50 hover:border-green-500"
        >
          <DownloadIcon />
          <span className="ml-2">Export Log</span>
        </button>
      </header>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 divide-y divide-green-900/50">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {isLoading && (
             <div className="flex items-start gap-4 p-4">
                <ModelIcon />
                <div className="flex-grow pt-1 flex items-center">
                    <Spinner />
                    <span className="ml-3 text-green-500 animate-pulse">// Synthesizing...</span>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 bg-black/50 border-t-2 border-green-900/50">
        <div className="max-w-3xl mx-auto">
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <div className="flex items-center bg-black/80 rounded-lg p-2 border-2 border-green-900/50 focus-within:border-green-500 focus-within:shadow-[0_0_10px_rgba(0,255,65,0.5)] transition-all">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter query..."
              className="flex-1 bg-transparent text-green-300 placeholder-green-700 focus:outline-none resize-none"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputText.trim()}
              className="ml-2 p-2 rounded-md bg-green-900 text-green-300 hover:bg-green-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Bot, Sparkles } from 'lucide-react';
import { ChatMessage } from '@/components/ChatMessage';

export function ChatPanel() {
  const history = useEditorStore((state) => state.history);
  const sendMessage = useEditorStore((state) => state.sendMessage);
  const isLoading = useEditorStore((state) => state.isLoading);
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
      // 送信後にフォーカスを戻す
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing && !isLoading) {
      if (!event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    }
  };

  // 履歴が更新されたら一番下にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* ヘッダー部分 - 固定 */}
      <div className="flex-none p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-medium">AIアシスタント</h2>
        </div>
      </div>

      {/* チャットメッセージ部分 - スクロール可能 */}
      <div className="flex-grow overflow-y-auto p-4 scrollbar-thin">
        <div className="space-y-4">
          {history.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-center p-4">
              <Sparkles className="h-10 w-10 text-primary/20 mb-3" />
              <h3 className="text-lg font-medium mb-1">AIアシスタントへようこそ</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                テキストファイルをアップロードまたは入力して、AIに編集指示を出しましょう。
              </p>
            </div>
          )}
          {history.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 入力部分 - 固定 */}
      <div className="flex-none border-t p-4 bg-card">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            placeholder="編集指示を入力..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-grow shadow-sm"
            autoComplete="off"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !inputValue.trim()} 
            size="icon"
            className={`transition-all duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Shift+Enter で改行 | Enter で送信
        </p>
      </div>
    </div>
  );
}
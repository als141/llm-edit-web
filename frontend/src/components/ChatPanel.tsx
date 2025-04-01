"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizonal } from 'lucide-react';
import { ChatMessage } from '@/components/ChatMessage'; // ChatMessageコンポーネントを別途作成

export function ChatPanel() {
  const { history, sendMessage, isLoading } = useEditorStore((state) => ({
    history: state.history,
    sendMessage: state.sendMessage,
    isLoading: state.isLoading,
  }));
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing && !isLoading) {
       // Shift+Enterで改行を許可する場合は条件を追加
       if (!event.shiftKey) {
         event.preventDefault(); // デフォルトのEnterキー動作（改行やフォーム送信）を防ぐ
         handleSend();
       }
    }
  };

  // 履歴が更新されたら一番下にスクロール
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div'); // ScrollArea内部のビューポート要素を取得
       if(scrollViewport) {
           scrollViewport.scrollTop = scrollViewport.scrollHeight;
       }
    }
  }, [history]);

  return (
    <div className="flex flex-col h-full p-4 bg-muted/50">
       <h2 className="text-lg font-semibold mb-4">チャット</h2>
      <ScrollArea className="flex-grow mb-4 pr-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {history.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
        </div>
      </ScrollArea>
      <div className="flex items-center space-x-2">
        <Input
          placeholder="編集指示を入力 (Shift+Enterで改行)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="flex-grow"
          // Shift+Enterでの改行を有効にする場合はTextareaを使うか、InputでShiftキーを判定
        />
        <Button onClick={handleSend} disabled={isLoading || !inputValue.trim()} size="icon">
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
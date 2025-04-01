"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Bot, Sparkles } from 'lucide-react';
import { ChatMessage } from '@/components/ChatMessage';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChatPanel() {
  const history = useEditorStore((state) => state.history);
  const sendMessage = useEditorStore((state) => state.sendMessage);
  const isLoading = useEditorStore((state) => state.isLoading);
  
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
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
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [history]);

  return (
    <Card className="flex flex-col h-full rounded-none border-none shadow-none">
      <CardHeader className="px-4 pb-0 pt-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AIアシスタント
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full p-0">
        <ScrollArea className="flex-grow px-4 py-2" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
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
          </div>
        </ScrollArea>
        
        <div className="border-t p-4 bg-card/50">
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
      </CardContent>
    </Card>
  );
}
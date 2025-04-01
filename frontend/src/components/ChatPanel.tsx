"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Bot, Sparkles, FileText } from 'lucide-react';
import { ChatMessage } from '@/components/ChatMessage';

interface ChatPanelProps {
  onSelectEditor?: () => void; // モバイル表示でエディタタブに切り替えるためのコールバック
}

export function ChatPanel({ onSelectEditor }: ChatPanelProps) {
  const history = useEditorStore((state) => state.history);
  const sendMessage = useEditorStore((state) => state.sendMessage);
  const isLoading = useEditorStore((state) => state.isLoading);
  const fileContent = useEditorStore((state) => state.fileContent);
  
  const [inputValue, setInputValue] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // レスポンシブ対応
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // 初期チェック
    checkScreenSize();
    
    // リサイズイベントリスナー
    window.addEventListener("resize", checkScreenSize);
    
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

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

  // 改善: フォーカス時にスクロールしない（オプション指定の改善）
  const handleFocus = () => {
    // フォーカス時のスクロールが不要なため削除
  };

  // 改善: スクロール方法の改善
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      // オーバースクロールを防ぐために、scrollToを使用
      const scrollHeight = chatContainerRef.current.scrollHeight;
      const containerHeight = chatContainerRef.current.clientHeight;
      chatContainerRef.current.scrollTo({
        top: scrollHeight - containerHeight,
        behavior: 'smooth'
      });
    }
  };

  // 履歴が更新されたら一番下にスクロール
  useEffect(() => {
    // ディレイを短くし、スクロールをコンテナに対して行う
    setTimeout(scrollToBottom, 50);
  }, [history]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* ヘッダー部分 - コンパクト化 */}
      <div className="flex-none p-2 md:p-4 border-b bg-card shadow-sm z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            <h2 className="text-sm md:text-lg font-medium">AIアシスタント</h2>
          </div>
          
          {/* ファイルが読み込まれているが、テキストがまだ表示されていない場合に表示するボタン (モバイル用) */}
          {fileContent && onSelectEditor && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSelectEditor}
              className="flex md:hidden items-center gap-1 h-7 px-2 py-0"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="text-xs">テキストを表示</span>
            </Button>
          )}
        </div>
      </div>

      {/* チャットメッセージ部分 - スクロール可能 - パディング最適化 */}
      <div 
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-2 md:p-4 scrollbar-thin chat-container"
      >
        <div className="space-y-2 md:space-y-4">
          {history.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 md:h-40 text-center p-3 md:p-4">
              <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-primary/20 mb-2 md:mb-3" />
              <h3 className="text-base md:text-lg font-medium mb-1">AIアシスタントへようこそ</h3>
              <p className="text-xs md:text-sm text-muted-foreground max-w-sm">
                テキストファイルをアップロードまたは入力して、AIに編集指示を出しましょう。
              </p>
            </div>
          )}
          {history.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {/* 空のdivを使わず、コンテナ自体のスクロールに依存 */}
          <div ref={messagesEndRef} className="h-6" />
        </div>
      </div>

      {/* 入力部分 - 固定・コンパクト化 */}
      <div className="flex-none border-t p-2 md:p-4 bg-card shadow-sm z-10">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            placeholder="編集指示を入力..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            disabled={isLoading}
            className="flex-grow shadow-sm text-sm h-8 md:h-10"
            autoComplete="off"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !inputValue.trim()} 
            size="icon"
            className={`transition-all duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'} h-8 w-8 md:h-10 md:w-10 p-0`}
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] md:text-xs text-muted-foreground mt-1 md:mt-2 text-center">
          Shift+Enter で改行 | Enter で送信
        </p>
      </div>
    </div>
  );
}
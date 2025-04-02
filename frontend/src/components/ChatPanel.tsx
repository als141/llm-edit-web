"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Bot, Sparkles, FileText, Smile, Image, Trash2, Paperclip } from 'lucide-react';
import { ChatMessage } from '@/components/ChatMessage';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ChatPanelProps {
  onSelectEditor?: () => void; // モバイル表示でエディタタブに切り替えるためのコールバック
}

export function ChatPanel({ onSelectEditor }: ChatPanelProps) {
  const history = useEditorStore((state) => state.history);
  const sendMessage = useEditorStore((state) => state.sendMessage);
  const isLoading = useEditorStore((state) => state.isLoading);
  const fileContent = useEditorStore((state) => state.fileContent);
  const clearHistory = useEditorStore((state) => state.clearHistory);
  
  const [inputValue, setInputValue] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

  // メッセージ数の監視
  useEffect(() => {
    setMessageCount(history.length);
  }, [history]);

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

  // フォーカス管理
  const handleFocus = () => {
    setIsInputFocused(true);
  };

  const handleBlur = () => {
    setIsInputFocused(false);
  };

  // スクロール方法の改善
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // 履歴が更新されたら一番下にスクロール
  useEffect(() => {
    if (history.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [history]);

  // 履歴削除の処理
  const handleClearHistory = () => {
    clearHistory();
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* ヘッダー部分 - 高さを完全に統一 */}
      <div className="flex-none h-14 md:h-16 px-3 py-2 md:px-4 md:py-3 border-b bg-card shadow-sm z-10 sticky top-0">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 md:h-6 md:w-6 text-primary">
              <Bot className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <h2 className="text-sm md:text-base font-medium">AIアシスタント</h2>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 履歴削除ボタン */}
            {history.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">履歴を削除</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">チャット履歴を削除</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* ファイルが読み込まれているが、テキストがまだ表示されていない場合に表示するボタン (モバイル用) */}
            {fileContent && onSelectEditor && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onSelectEditor}
                  className="flex md:hidden items-center gap-1 h-8 px-2.5 py-0"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span className="text-xs">テキストを表示</span>
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* チャットメッセージ部分 - スクロール改善 */}
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-grow relative overflow-y-auto scrollbar-thin"
      >
        <div className="px-2 md:px-4 py-3 md:py-4 space-y-1">
          <AnimatePresence>
            {history.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center h-32 md:h-40 text-center p-3 md:p-4 my-8"
              >
                <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-primary/5 flex items-center justify-center mb-3 md:mb-4">
                  <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-primary/40" />
                </div>
                <h3 className="text-base md:text-lg font-medium mb-1.5">AIアシスタントへようこそ</h3>
                <p className="text-xs md:text-sm text-muted-foreground max-w-sm leading-relaxed">
                  テキストファイルをアップロードまたは入力して、AIに編集指示を出しましょう。
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* メッセージの表示 */}
          {history.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          
          {/* スクロール用のアンカー */}
          <div ref={messagesEndRef} className="h-6" />
        </div>
      </ScrollArea>

      {/* 入力部分 - 音声入力ボタンの削除 */}
      <div className={cn(
        "flex-none border-t px-2 md:px-4 py-2 md:py-3 bg-card",
        "transition-all duration-300",
        isInputFocused ? "shadow-md" : "shadow-sm",
        "z-10 sticky bottom-0"
      )}>
        <div className={cn(
          "flex items-center gap-1.5 md:gap-2 p-1 rounded-full border bg-background",
          isInputFocused ? "ring-2 ring-primary/20" : "",
          isLoading ? "opacity-80" : ""
        )}>
          {/* 追加機能ボタン (モバイルでは非表示) */}
          <div className="hidden md:flex space-x-1 ml-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-70 hover:opacity-100" disabled={isLoading}>
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">添付ファイル</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-70 hover:opacity-100" disabled={isLoading}>
                    <Image className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">画像</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-70 hover:opacity-100" disabled={isLoading}>
                    <Smile className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">絵文字</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* テキスト入力 */}
          <Input
            ref={inputRef}
            placeholder="編集指示を入力..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={isLoading}
            className="flex-grow border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm h-9 md:h-10 rounded-full px-3"
            autoComplete="off"
          />
          
          {/* 送信ボタン */}
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !inputValue.trim()} 
            size="icon"
            className={cn(
              "h-8 w-8 md:h-9 md:w-9 rounded-full bg-primary shadow transition-all duration-300",
              inputValue.trim() ? "opacity-100 scale-100" : "opacity-80 scale-95",
              isLoading ? "opacity-50" : ""
            )}
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-[10px] md:text-xs text-muted-foreground mt-2 text-center opacity-70">
          Shift+Enter で改行 | Enter で送信
        </p>
      </div>

      {/* 履歴削除の確認ダイアログ */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>チャット履歴を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。すべてのチャット履歴が削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
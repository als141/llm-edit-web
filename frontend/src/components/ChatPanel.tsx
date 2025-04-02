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
import { HelpDialog } from "@/components/HelpDialog";
import { EditPromptHints } from "@/components/EditPromptHints";
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hasKeyboard, setHasKeyboard] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // レスポンシブ対応とデバイス判定
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // iOSデバイスの判定（セーフエリア対応に利用）
    const checkPlatform = () => {
      setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) || 
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    };
    
    // 初期チェック
    checkScreenSize();
    checkPlatform();
    
    // リサイズイベントリスナー
    window.addEventListener("resize", checkScreenSize);
    
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // キーボード表示監視のためのビューポート高さ変更検出
  useEffect(() => {
    const visualViewportHandler = () => {
      if (window.visualViewport) {
        const currentHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        
        // ビューポート高さがウィンドウ高さよりかなり小さい場合はキーボードが表示されていると判断
        setHasKeyboard(windowHeight - currentHeight > 150);
      }
    };
    
    // visualViewportが利用可能な場合はそれを使用、そうでなければwindowのresize
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', visualViewportHandler);
      window.visualViewport.addEventListener('scroll', visualViewportHandler);
    } else {
      window.addEventListener('resize', visualViewportHandler);
    }
    
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', visualViewportHandler);
        window.visualViewport.removeEventListener('scroll', visualViewportHandler);
      } else {
        window.removeEventListener('resize', visualViewportHandler);
      }
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

  // フォーカス管理
  const handleFocus = () => {
    setIsInputFocused(true);
    
    // モバイルでフォーカス時、スクロール位置調整（キーボードが表示された場合）
    if (isMobile) {
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    }
  };

  const handleBlur = () => {
    setIsInputFocused(false);
  };

  // スクロール方法の改善
  const scrollToBottom = () => {
    if (isMobile && chatContainerRef.current) {
      const scrollHeight = chatContainerRef.current.scrollHeight;
      chatContainerRef.current.scrollTo({
        top: scrollHeight,
        behavior: 'smooth'
      });
    } else if (scrollAreaRef.current) {
      const scrollHeight = scrollAreaRef.current.scrollHeight;
      scrollAreaRef.current.scrollTo({
        top: scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // 履歴が更新されたら一番下にスクロール
  useEffect(() => {
    if (history.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [history, scrollToBottom]);

  // キーボード表示状態に変更があった場合のスクロール調整
  useEffect(() => {
    if (hasKeyboard) {
      setTimeout(scrollToBottom, 100);
    }
  }, [hasKeyboard, scrollToBottom]);

  // 履歴削除の処理
  const handleClearHistory = () => {
    clearHistory();
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* ヘッダー部分 - セーフエリア対応 */}
      <div className={cn(
        "flex-none h-14 md:h-16 px-3 py-2 md:px-4 md:py-3 border-b bg-card shadow-sm z-10 sticky top-0",
        isIOS && "ios-safe-top" // iOS用のセーフエリア対応
      )}>
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 md:h-6 md:w-6 text-primary">
              <Bot className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <h2 className="text-sm md:text-base font-medium">AIアシスタント</h2>
          </div>
          
          <div className="flex items-center gap-2">
            {/* ヘルプボタン - 追加 */}
            <HelpDialog />
            
            {/* 履歴削除ボタン */}
            {history.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive transition-colors touch-target"
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
            {fileContent && onSelectEditor && isMobile && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onSelectEditor}
                  className="flex md:hidden items-center gap-1 h-8 px-2.5 py-0 touch-target"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span className="text-xs">テキストを表示</span>
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* チャットメッセージ部分 - モバイル対応改善 */}
      {isMobile ? (
        <div 
          ref={chatContainerRef}
          className={cn(
            "flex-grow overflow-y-auto overflow-x-hidden scrollbar-thin pb-safe-area overscroll-contain",
            hasKeyboard && "has-keyboard" // キーボード表示時には余白を増やす
          )}
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
            
            {/* スクロール用のアンカー - セーフエリア対応 */}
            <div ref={messagesEndRef} className={cn(
              "h-6",
              isMobile && "mb-safe h-20" // モバイルではより大きな下部マージン
            )} />
          </div>
        </div>
      ) : (
        // デスクトップ用スクロールエリア
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
      )}

      {/* 入力部分 - セーフエリア対応 */}
      <div className={cn(
        "input-area-container",
        isInputFocused ? 
          "shadow-md mobile-input-focus" : 
          "shadow-sm mobile-input-blur",
        isMobile && "ios-safe-bottom" // iOS用セーフエリア
      )}>
        <div className="px-2 md:px-4 py-2 md:py-3">
          {/* 編集プロンプトヒント - 追加 */}
          {fileContent && <EditPromptHints />}
          
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
                      <Image className="h-4 w-4" aria-label="画像を追加" />
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

            {/* テキスト入力 - サイズ最適化 */}
            <Input
              ref={inputRef}
              placeholder="編集指示を入力..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={isLoading}
              className={cn(
                "flex-grow border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm",
                "h-9 md:h-10 rounded-full px-3",
                isMobile ? "py-1.5" : "py-2" // モバイルでは少しコンパクトに
              )}
              autoComplete="off"
            />
            
            {/* 送信ボタン - タップ領域拡大 */}
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !inputValue.trim()} 
              size="icon"
              className={cn(
                "h-8 w-8 md:h-9 md:w-9 rounded-full bg-primary shadow transition-all duration-300",
                "touch-target", // タップ領域を広く
                inputValue.trim() ? "opacity-100 scale-100" : "opacity-80 scale-95",
                isLoading ? "opacity-50" : ""
              )}
            >
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </div>
          
          {/* モバイル表示では送信方法のヒントをより目立たなく */}
          <p className={cn(
            "text-center opacity-70 mt-1",
            isMobile ? "text-[9px]" : "text-[10px] md:text-xs",
            "text-muted-foreground"
          )}>
            Shift+Enter で改行 | Enter で送信
          </p>
        </div>
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
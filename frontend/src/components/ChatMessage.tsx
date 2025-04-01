"use client";

import React, { useCallback, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type ConversationMessage, MessageRole, MessageType, type AiResponse } from '@/lib/types';
import { Bot, User, AlertTriangle, CheckCircle, XCircle, Info, LoaderCircle, Check, MessageSquare, MessageSquarePlus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DiffView } from './DiffView';
import { ProposalActions } from './ProposalActions';
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatMessageProps {
  message: ConversationMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const startFeedback = useEditorStore(state => state.startFeedback);
  const history = useEditorStore(state => state.history);
  const lastProposal = useEditorStore(state => state.lastProposal);
  const isFeedbackMode = useEditorStore(state => state.isFeedbackMode);
  const feedbackMessageIds = useEditorStore(state => state.feedbackMessageIds);
  const isUser = message.role === MessageRole.User;
  // このメッセージがフィードバックかどうかを判定
  const isFeedbackMessage = isUser && feedbackMessageIds.includes(message.id);
  const [isMobile, setIsMobile] = useState(false);
  const [timeString, setTimeString] = useState('');
  const [showIndicator, setShowIndicator] = useState(false);
  
  // レスポンシブ対応
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // 初期チェック
    checkScreenSize();
    
    // リサイズイベントリスナー - スロットリングを追加
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkScreenSize, 100);
    };
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // 時間表示の設定 - 一度だけ設定するように修正
  useEffect(() => {
    if (!timeString) {
      setTimeString(format(new Date(), 'HH:mm'));
    }
  }, [timeString]);

  // メッセージ送信後のアニメーション
  useEffect(() => {
    if (message.role === MessageRole.User) {
      setShowIndicator(true);
      const timer = setTimeout(() => {
        setShowIndicator(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [message.role]);
  
  const isAssistant = message.role === MessageRole.Assistant;
  const isSystem = message.role === MessageRole.System;
  const isProposal = message.type === MessageType.Proposal;
  const isLoading = message.type === MessageType.Loading;
  const isError = message.type === MessageType.Error;
  const isSystemInfo = message.type === MessageType.SystemInfo;

  let aiResponse: AiResponse | null = null;
  if (isAssistant && typeof message.content === 'object' && message.content !== null) {
    aiResponse = message.content as AiResponse;
  }

  const getAvatar = useCallback(() => {
    if (isUser) {
      if (isFeedbackMessage) {
        return <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />;
      }
      return <User className="h-4 w-4 md:h-5 md:w-5" />;
    }
    if (isAssistant) return <Bot className="h-4 w-4 md:h-5 md:w-5" />;
    if (isSystemInfo && message.content.toString().includes('適用')) return <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500" />;
    if (isSystemInfo && message.content.toString().includes('拒否')) return <XCircle className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />;
    if (isError) return <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-red-500" />;
    if (isLoading) return (
      <LoaderCircle className="h-4 w-4 md:h-5 md:w-5 animate-spin text-primary" />
    );
    return <Info className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />;
  }, [isUser, isAssistant, isSystemInfo, isError, isLoading, isFeedbackMessage, message.content]);

  const renderContent = useCallback(() => {
    if (isLoading) {
      return (
        <div className="flex items-center space-x-2">
          <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-primary/30 animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-primary/50 animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-primary/70 animate-bounce"></div>
        </div>
      );
    }
    
    if (isError) {
      return <p className="text-xs md:text-sm text-inherit">{message.content as string}</p>;
    }
    
    if(isSystemInfo) {
      return (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-xs md:text-sm"
        >
          {message.content as string}
        </motion.p>
      );
    }

    if (aiResponse) {
      switch (aiResponse.status) {
        case 'success':
        case 'multiple_edits':
        case 'replace_all':
          return (
            <div className="space-y-2 md:space-y-3 w-full">
              <div className="flex items-center gap-2">
                <Badge variant={aiResponse.status === 'success' ? 'default' : aiResponse.status === 'multiple_edits' ? 'secondary' : 'outline'} className="text-xs font-medium rounded-full">
                  {aiResponse.status === 'success' 
                    ? '単一編集'
                    : aiResponse.status === 'multiple_edits'
                      ? '複数編集'
                      : '全体置換'
                  }
                </Badge>
                {aiResponse.status === 'multiple_edits' && aiResponse.edits && (
                  <span className="text-xs text-muted-foreground">
                    {aiResponse.edits.length}箇所
                  </span>
                )}
              </div>
              <DiffView response={aiResponse} isMobile={isMobile} />
            </div>
          );
        case 'clarification_needed':
        case 'conversation':
        case 'rejected':
          return (
            <div className="prose prose-xs md:prose-sm dark:prose-invert max-w-none break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {aiResponse.message || ''}
              </ReactMarkdown>
            </div>
          );
        case 'error':
          return <p className="text-xs md:text-sm text-destructive">{aiResponse.message || '不明なAIエラー'}</p>;
        default:
          return <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">{JSON.stringify(aiResponse, null, 2)}</pre>;
      }
    } else if (typeof message.content === 'string') {
      return (
        <div className="prose prose-xs md:prose-sm dark:prose-invert max-w-none break-words">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      );
    }
    return null;
  }, [isLoading, isError, isSystemInfo, aiResponse, message.content, isMobile]);

  // 現在のメッセージがAIの最新の提案メッセージであるか確認
  const isLatestAssistantMessage = useMemo(() => {
    return history.length > 0 && history[history.length - 1]?.id === message.id;
  }, [history, message.id]);
  
  // 現在のメッセージがAIの提案メッセージで、なおかつlastProposalの状態が一致する場合にアクションボタンを表示
  const showActions = useMemo(() => {
    return isLatestAssistantMessage && 
           isProposal && 
           aiResponse && 
           lastProposal?.status === aiResponse?.status;
  }, [isLatestAssistantMessage, isProposal, aiResponse, lastProposal?.status]);

  // ユーザーメッセージのスタイル
  const userMessageStyle = useMemo(() => {
    return cn(
      "relative max-w-[85%] rounded-2xl px-3 md:px-4 py-2 md:py-3",
      isFeedbackMessage 
        ? "bg-gradient-to-br from-purple-600 to-violet-800 text-white border-2 border-purple-300/50 dark:border-purple-500/30 rounded-tr-sm shadow-lg" 
        : "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none rounded-tr-sm shadow-md",
      "dark:shadow-primary/5"
    );
  }, [isFeedbackMessage]);

  // AIメッセージのスタイル
  const aiMessageStyle = useMemo(() => {
    return cn(
      "max-w-[85%] rounded-2xl px-3 md:px-4 py-2 md:py-3", 
      isLoading ? "py-1.5 md:py-2 h-8 md:h-10 flex items-center" : "", 
      isError 
        ? 'bg-destructive/10 border border-destructive/20 text-destructive rounded-tl-sm shadow-sm'
        : isSystemInfo 
          ? 'bg-transparent text-muted-foreground border-none px-0 py-1 italic text-xs' 
          : 'bg-card/80 backdrop-blur-sm border border-border/30 rounded-tl-sm shadow-sm'
    );
  }, [isLoading, isError, isSystemInfo]);

  // アニメーション設定
  const messageVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      transition: { 
        duration: 0.2,
        ease: "easeIn"
      } 
    }
  };

  // セーフエリア (内容をラップする)
  const contentWrapper = useCallback((children: React.ReactNode) => (
    <div className="relative">
      {children}
      
      {/* 時間表示 */}
      <div className={cn(
        "text-[0.65rem] mt-1 opacity-70",
        isUser ? "text-right mr-1" : "ml-1",
        isSystemInfo && "hidden"
      )}>
        {timeString}
      </div>
      
      {/* ユーザーメッセージの既読表示 */}
      {isUser && showIndicator && !isFeedbackMessage && (
        <motion.div 
          initial={{ opacity: 0, x: -5 }} 
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="absolute -bottom-1 -right-1 text-primary-foreground"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-primary/80 rounded-full p-0.5">
                  <Check className="h-3 w-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                メッセージ送信済み
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      )}

      {/* フィードバック専用の送信完了マーク */}
      {isUser && showIndicator && isFeedbackMessage && (
        <motion.div 
          initial={{ opacity: 0, x: -5 }} 
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="absolute -bottom-1 -right-1 text-white"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-purple-500 rounded-full p-0.5">
                  <Check className="h-3 w-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                フィードバック送信済み
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      )}
    </div>
  ), [isUser, isSystemInfo, showIndicator, isFeedbackMessage, timeString]);

  // フィードバック処理コールバックをメモ化
  const handleFeedback = useCallback(() => {
    if (aiResponse) {
      startFeedback(aiResponse);
    }
  }, [aiResponse, startFeedback]);

  return (
    <div
      className={cn(
        "flex items-start gap-2 md:gap-3 mb-3 md:mb-4", 
        isUser ? 'justify-end' : '',
        // フィードバックモードの場合、強調表示
        isProposal && isFeedbackMode && lastProposal?.status === aiResponse?.status && "edit-highlight rounded-md p-2 -mx-2",
        // フィードバックメッセージの場合、セクション全体を強調
        isFeedbackMessage && "relative pl-2 pr-2 my-4 mx-1"
      )}
      data-message-type={message.type}
      data-feedback={isFeedbackMessage ? "true" : "false"}
      data-message-id={message.id}
    >
      {!isUser && (
        <Avatar className={cn(
          "h-7 w-7 md:h-8 md:w-8 border flex-shrink-0 transition-all",
          isLoading && "animate-pulse",
          isAssistant && "bg-primary/10 border-primary/30 ring-2 ring-primary/10",
          isError && "bg-destructive/10 border-destructive/30",
          isSystemInfo && "bg-muted border-transparent"
        )}>
          <AvatarFallback className={cn(
            "text-muted-foreground",
            isAssistant && "text-primary",
            isError && "text-destructive",
            isSystemInfo && message.content.toString().includes('適用') && "text-green-500",
            isSystemInfo && message.content.toString().includes('拒否') && "text-yellow-500"
          )}>
            {getAvatar()}
          </AvatarFallback>
        </Avatar>
      )}

      {/* フィードバック装飾（フィードバックの場合のみ表示） */}
      {isFeedbackMessage && (
        <>
          {/* 縦の接続線 */}
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 16 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="absolute left-1/2 -top-4 transform -translate-x-1/2 w-[2px] bg-gradient-to-b from-transparent to-purple-500"
          />
          
          {/* キラキラエフェクト */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 flex items-center justify-center"
          >
            <div className="absolute inset-0 opacity-20 rounded-full bg-purple-300 dark:bg-purple-700 animate-pulse"></div>
            <MessageSquarePlus className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 z-10" />
          </motion.div>
        </>
      )}

      <div className={cn(
        isUser ? userMessageStyle : aiMessageStyle,
        // フィードバックメッセージの場合、特別なスタイルを追加
        isFeedbackMessage && "ring-4 ring-purple-400/20 dark:ring-purple-700/20"
      )}>
        {/* フィードバックバッジをメッセージの上部に表示 - デザイン改善 */}
        {isFeedbackMessage && (
          <div className="absolute -top-3 left-4 z-10">
            <Badge 
              variant="secondary" 
              className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200 text-[10px] md:text-xs px-2 py-0.5 rounded-full shadow-md border border-purple-200 dark:border-purple-700 flex items-center gap-1"
            >
              <MessageSquare className="h-3 w-3" />
              フィードバック
            </Badge>
          </div>
        )}

        {/* フィードバックの場合、内容の前に説明テキストを追加 */}
        {isFeedbackMessage && (
          <div className="text-[10px] md:text-xs text-purple-100 mb-2 border-b border-purple-400/30 pb-1.5">
            <span className="font-medium">提案に対するフィードバック</span>
          </div>
        )}

        {contentWrapper(renderContent())}
        
        {showActions && aiResponse && (
          <div className="mt-2 md:mt-3 pt-2 border-t border-border/50 dark:border-border/30">
            <ProposalActions
              proposal={aiResponse}
              onFeedback={handleFeedback}
              isMobile={isMobile}
              messageId={message.id}
            />
          </div>
        )}
      </div>

      {isUser && (
        <div className="relative">
          <Avatar className={cn(
            "h-7 w-7 md:h-8 md:w-8 border-2 flex-shrink-0 shadow-sm",
            isFeedbackMessage 
              ? "border-purple-500/30 bg-purple-700/10" 
              : "border-primary/30 bg-primary/10"
          )}>
            <AvatarImage src="/avatar-placeholder.png" alt="User Avatar" className="object-cover" />
            <AvatarFallback className={cn(
              isFeedbackMessage 
                ? "text-purple-500 bg-purple-50 dark:bg-purple-900/40" 
                : "text-primary bg-primary/15"
            )}>
              {getAvatar()}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
}

// ProposalActionsコンポーネントがメッセージIDプロパティを受け取るように修正する必要があります
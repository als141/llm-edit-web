"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type ConversationMessage, MessageRole, MessageType, type AiResponse } from '@/lib/types';
import { Bot, User, AlertTriangle, CheckCircle, XCircle, Info, LoaderCircle, Check } from 'lucide-react';
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
    
    // リサイズイベントリスナー
    window.addEventListener("resize", checkScreenSize);
    
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // 時間表示の設定
  useEffect(() => {
    setTimeString(format(new Date(), 'HH:mm'));
  }, []);

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

  const getAvatar = () => {
    if (isUser) return <User className="h-4 w-4 md:h-5 md:w-5" />;
    if (isAssistant) return <Bot className="h-4 w-4 md:h-5 md:w-5" />;
    if (isSystemInfo && message.content.toString().includes('適用')) return <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500" />;
    if (isSystemInfo && message.content.toString().includes('拒否')) return <XCircle className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />;
    if (isError) return <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-red-500" />;
    if (isLoading) return (
      <LoaderCircle className="h-4 w-4 md:h-5 md:w-5 animate-spin text-primary" />
    );
    return <Info className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />;
  };

  const renderContent = () => {
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
  };

  // 現在のメッセージがAIの最新の提案メッセージであるか確認
  const isLatestAssistantMessage = history.length > 0 && history[history.length - 1]?.id === message.id;
  
  // 現在のメッセージがAIの提案メッセージで、なおかつlastProposalの状態が一致する場合にアクションボタンを表示
  const showActions = isLatestAssistantMessage && 
                      isProposal && 
                      aiResponse && 
                      lastProposal?.status === aiResponse?.status;

  // ユーザーメッセージのスタイル
  const userMessageStyle = cn(
    "relative max-w-[85%] rounded-2xl px-3 md:px-4 py-2 md:py-3",
    isFeedbackMessage 
      ? "bg-gradient-to-br from-purple-500 to-violet-600 text-white border-2 border-purple-300 dark:border-purple-700 rounded-tr-sm shadow-md" 
      : "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none rounded-tr-sm shadow-md",
    "dark:shadow-primary/5"
  );

  // AIメッセージのスタイル
  const aiMessageStyle = cn(
    "max-w-[85%] rounded-2xl px-3 md:px-4 py-2 md:py-3", 
    isLoading ? "py-1.5 md:py-2 h-8 md:h-10 flex items-center" : "", 
    isError 
      ? 'bg-destructive/10 border border-destructive/20 text-destructive rounded-tl-sm shadow-sm'
      : isSystemInfo 
        ? 'bg-transparent text-muted-foreground border-none px-0 py-1 italic text-xs' 
        : 'bg-card/80 backdrop-blur-sm border border-border/30 rounded-tl-sm shadow-sm'
  );

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
  const contentWrapper = (children: React.ReactNode) => (
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
      {isUser && showIndicator && (
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
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          "flex items-start gap-2 md:gap-3 mb-3 md:mb-4", 
          isUser ? 'justify-end' : '',
          // フィードバックモードの場合、強調表示
          isProposal && isFeedbackMode && lastProposal?.status === aiResponse?.status && "edit-highlight rounded-md p-2 -mx-2",
          // フィードバックメッセージの場合、セクション全体を強調
          isFeedbackMessage && "relative pl-2 pr-2"
        )}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={messageVariants}
        data-message-type={message.type}
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

        <div className={isUser ? userMessageStyle : aiMessageStyle}>
          {/* フィードバックバッジをメッセージの上部に表示 */}
        {isFeedbackMessage && (
          <div className="absolute -top-3 left-3 z-10">
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200 text-[10px] px-2 py-0.5 rounded-full shadow-sm">
              フィードバック
            </Badge>
          </div>
        )}
        {contentWrapper(renderContent())}
          
          {showActions && aiResponse && (
            <div className="mt-2 md:mt-3 pt-2 border-t border-border/50 dark:border-border/30">
              <ProposalActions proposal={aiResponse} onFeedback={() => startFeedback(aiResponse)} isMobile={isMobile} />
            </div>
          )}
        </div>

        {isUser && (
          <div className="relative">
            <Avatar className="h-7 w-7 md:h-8 md:w-8 border-2 border-primary/30 bg-primary/10 flex-shrink-0 shadow-sm">
              <AvatarImage src="/avatar-placeholder.png" alt="User Avatar" className="object-cover" />
              <AvatarFallback className="text-primary bg-primary/15">
                <User className="h-4 w-4 md:h-5 md:w-5" />
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
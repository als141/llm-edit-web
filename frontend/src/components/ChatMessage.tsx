"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { type ConversationMessage, MessageRole, MessageType, type AiResponse } from '@/lib/types';
import { Bot, User, AlertTriangle, CheckCircle, XCircle, Info, LoaderCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DiffView } from './DiffView';
import { ProposalActions } from './ProposalActions';
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ChatMessageProps {
  message: ConversationMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const startFeedback = useEditorStore(state => state.startFeedback);
  const history = useEditorStore(state => state.history);
  const lastProposal = useEditorStore(state => state.lastProposal);
  const [isMobile, setIsMobile] = useState(false);
  
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
  
  const isUser = message.role === MessageRole.User;
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
                <div className="bg-primary/20 text-xs font-medium px-2 py-0.5 rounded-full text-primary-foreground">
                  {aiResponse.status === 'success' 
                    ? '単一編集'
                    : aiResponse.status === 'multiple_edits'
                      ? '複数編集'
                      : '全体置換'
                  }
                </div>
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

  const isLatestAssistantMessage = history.length > 0 && history[history.length - 1]?.id === message.id;
  const showActions = isLatestAssistantMessage && isProposal && aiResponse && lastProposal?.status === aiResponse?.status;

  // モーション設定
  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      className={cn("flex items-start gap-2 md:gap-3", isUser ? 'justify-end' : '')}
      initial="hidden"
      animate="visible"
      variants={messageVariants}
      data-message-type={message.type}
    >
      {!isUser && (
        <Avatar className={cn(
          "h-7 w-7 md:h-8 md:w-8 border flex-shrink-0 transition-all",
          isLoading && "animate-pulse",
          isAssistant && "bg-primary/10 border-primary/30",
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

      <div className={cn(
        "max-w-[85%] rounded-lg px-3 md:px-4 py-2 md:py-3", 
        isLoading ? "py-1.5 md:py-2 h-8 md:h-10 flex items-center" : "", 
        isUser 
          ? 'bg-primary/90 text-primary-foreground border border-primary/20 rounded-tr-none shadow-sm'
          : isError 
            ? 'bg-destructive/10 border border-destructive/20 text-destructive rounded-tl-none shadow-sm'
            : isSystemInfo 
              ? 'bg-transparent text-muted-foreground border-none px-0 py-1 italic text-xs' 
              : 'bg-card border border-border/50 rounded-tl-none shadow-sm'
      )}>
        {renderContent()}
        
        {showActions && aiResponse && (
          <div className="mt-2 md:mt-3 pt-2 border-t border-border/50">
            <ProposalActions proposal={aiResponse} onFeedback={() => startFeedback(aiResponse)} isMobile={isMobile} />
          </div>
        )}
      </div>

      {isUser && (
        <Avatar className="h-7 w-7 md:h-8 md:w-8 border border-primary/30 bg-primary/10 flex-shrink-0">
          <AvatarFallback className="text-primary">
            <User className="h-4 w-4 md:h-5 md:w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
}
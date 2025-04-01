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

interface ChatMessageProps {
  message: ConversationMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  // 個別のセレクタを使用
  const startFeedback = useEditorStore(state => state.startFeedback);
  const history = useEditorStore(state => state.history);
  const lastProposal = useEditorStore(state => state.lastProposal);
  
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
    if (isUser) return <User className="h-5 w-5" />;
    if (isAssistant) return <Bot className="h-5 w-5" />;
    if (isSystemInfo && message.content.toString().includes('適用')) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (isSystemInfo && message.content.toString().includes('拒否')) return <XCircle className="h-5 w-5 text-yellow-500" />;
    if (isError) return <AlertTriangle className="h-5 w-5 text-red-500" />;
    if (isLoading) return <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground"/>;
    return <Info className="h-5 w-5 text-blue-500" />;
  };

  const renderContent = () => {
    if (isLoading) {
      return null;
    }
    if (isError) {
         return <p className="text-inherit">{message.content as string}</p>; // 親要素の色を継承
    }
    if(isSystemInfo) {
        // proseクラスが適用されるとitalicなどが効きにくいため、直接スタイル指定は避ける
        return <p>{message.content as string}</p>;
    }

    if (aiResponse) {
      switch (aiResponse.status) {
        case 'success':
        case 'multiple_edits':
        case 'replace_all':
          return (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">編集提案 ({aiResponse.status}):</p>
              <DiffView response={aiResponse} />
            </div>
          );
        case 'clarification_needed':
        case 'conversation':
        case 'rejected':
           // ↓↓↓ className を削除 ↓↓↓
           return <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiResponse.message || ''}</ReactMarkdown>;
        case 'error':
           return <p className="text-inherit">{aiResponse.message || '不明なAIエラー'}</p>; // 親要素の色を継承
        default:
          return <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">{JSON.stringify(aiResponse, null, 2)}</pre>;
      }
    } else if (typeof message.content === 'string') {
       // ↓↓↓ className を削除 ↓↓↓
       return <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>;
    }
    return null;
  };

   const isLatestAssistantMessage = history.length > 0 && history[history.length - 1]?.id === message.id;
   // 提案メッセージであり、かつそれがストア内の最新の提案と一致する場合にアクションを表示
   const showActions = isLatestAssistantMessage && isProposal && aiResponse && lastProposal?.status === aiResponse?.status;

  return (
    <div className={cn("flex items-start space-x-3", isUser ? 'justify-end' : '')}>
      {!isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className={cn(
              "bg-transparent text-muted-foreground",
              isAssistant && "text-primary",
              isError && "text-destructive",
              isSystemInfo && message.content.toString().includes('適用') && "text-green-500",
              isSystemInfo && message.content.toString().includes('拒否') && "text-yellow-500",
          )}>
            {getAvatar()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn(
        "max-w-[80%] rounded-lg px-4 py-3", // proseクラスを削除 (Markdownコンポーネント内で適用される)
        isLoading ? "py-1" : "", // ローディング中は少し高さを抑える
        isUser ? 'bg-primary text-primary-foreground'
      : isError ? 'bg-destructive/10 border border-destructive/20 text-destructive'
      : isSystemInfo ? 'bg-transparent text-muted-foreground border-none px-0 py-1 italic text-xs' // システム情報はより目立たなく
      : 'bg-muted border' // Assistant or System (normal)
      )}>
        {/* Markdown表示用にdivで囲み、proseクラスを適用 */}
        <div className="prose prose-sm dark:prose-invert max-w-none break-words">
          {renderContent()}
        </div>
        {/* アクションボタンはメッセージ本体の外側に配置 */}
        {showActions && aiResponse && (
             <ProposalActions proposal={aiResponse} onFeedback={() => startFeedback(aiResponse)} />
        )}
      </div>

       {isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
           <AvatarFallback>
             <User className="h-5 w-5" />
           </AvatarFallback>
        </Avatar>
       )}
    </div>
  );
}
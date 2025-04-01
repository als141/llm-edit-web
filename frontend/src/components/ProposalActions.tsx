"use client";

import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, MessageSquarePlus, ThumbsUp, Pencil, RefreshCw, MessageSquare, Bot } from 'lucide-react';
import { useEditorStore } from "@/store/editorStore";
import { AiResponse } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProposalActionsProps {
  proposal: AiResponse;
  onFeedback: () => void;
  isMobile?: boolean;
  // 親メッセージのIDを追加
  messageId: string;
}

function ProposalActionsComponent({ proposal, onFeedback, isMobile = false, messageId }: ProposalActionsProps) {
  const { applyEdit, rejectEdit, isLoading, sendMessage } = useEditorStore();
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isHovered, setIsHovered] = useState<string | null>(null);

  // シートを開くときに呼び出す関数 - stopPropagationを追加
  const handleOpenFeedbackSheet = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // イベントの伝播を停止
    onFeedback(); // 編集ストアに現在の提案を記録
    setIsSheetOpen(true);
  }, [onFeedback]);

  // フィードバックの送信 - useCallbackでメモ化
  const handleSendFeedback = useCallback(() => {
    if (feedbackText.trim()) {
      setIsSubmitting(true);
      
      // フィードバックとして送信
      sendMessage(feedbackText, true)
        .then(() => {
          toast.success("フィードバックを送信しました", {
            description: "AIが新しい提案を生成しています",
          });
        })
        .catch((error) => {
          toast.error("フィードバックの送信に失敗しました", {
            description: error.message || "もう一度お試しください",
          });
        })
        .finally(() => {
          setFeedbackText(""); 
          setIsSubmitting(false);
          setIsSheetOpen(false);
        });
    }
  }, [feedbackText, sendMessage]);

  // 適用ボタンハンドラ - stopPropagationとuseCallbackを追加
  const handleApply = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    applyEdit();
  }, [applyEdit]);

  // 拒否ボタンハンドラ - stopPropagationとuseCallbackを追加
  const handleReject = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    rejectEdit();
  }, [rejectEdit]);

  const getProposalTypeLabel = useCallback(() => {
    switch (proposal.status) {
      case 'success': return '単一編集';
      case 'multiple_edits': return '複数編集';
      case 'replace_all': return '全体置換';
      default: return '提案';
    }
  }, [proposal.status]);

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  // ボタンのレンダリング
  const renderButton = useCallback((
    key: string,
    icon: React.ReactNode,
    label: string,
    action: (e: React.MouseEvent) => void,
    variant: "default" | "outline" | "ghost" = "default",
    color?: string,
    description?: string
  ) => (
    <TooltipProvider key={`tooltip-${key}-${messageId}`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
            onMouseEnter={() => setIsHovered(key)}
            onMouseLeave={() => setIsHovered(null)}
            className="flex-1"
          >
            <Button 
              variant={variant} 
              size={isMobile ? "sm" : "default"} 
              onClick={action} 
              disabled={isLoading}
              className={cn(
                "w-full text-xs md:text-sm h-8 md:h-9 gap-1.5",
                "transition-all duration-200 shadow-sm",
                color,
                isHovered === key ? "translate-y-[-2px]" : ""
              )}
              data-action={key}
              data-message-id={messageId}
            >
              {icon}
              <span className={isMobile ? "hidden" : ""}>{label}</span>
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="text-xs">
            <p className="font-medium">{label}</p>
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ), [isHovered, isLoading, isMobile, buttonVariants, messageId]);

  return (
    <div
      className="grid grid-cols-3 gap-2 md:gap-3 proposal-actions"
      data-message-id={messageId}
      onClick={(e) => e.stopPropagation()} // バブリング防止
    >
      {/* 適用ボタン */}
      {renderButton(
        "apply", 
        <Check className="h-3.5 w-3.5 md:h-4 md:w-4" />,
        "適用",
        handleApply,
        "default",
        "bg-green-600 hover:bg-green-700 text-white border-none",
        "この編集提案を適用します"
      )}
      
      {/* 拒否ボタン */}
      {renderButton(
        "reject", 
        <X className="h-3.5 w-3.5 md:h-4 md:w-4" />,
        "拒否",
        handleReject,
        "outline",
        "",
        "この編集提案を拒否します"
      )}

      {/* フィードバックボタン */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <motion.div
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
            onMouseEnter={() => setIsHovered("feedback")}
            onMouseLeave={() => setIsHovered(null)}
            className="flex-1"
          >
            <Button 
              variant="ghost" 
              size={isMobile ? "sm" : "default"} 
              onClick={handleOpenFeedbackSheet} 
              disabled={isLoading}
              className={cn(
                "w-full text-xs md:text-sm h-8 md:h-9 gap-1.5",
                "transition-all duration-200 shadow-sm",
                "bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20",
                "text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200",
                "border border-purple-200/50 dark:border-purple-600/20",
                "hover:bg-gradient-to-r hover:from-purple-100 hover:to-violet-100 dark:hover:from-purple-900/30 dark:hover:to-violet-900/30",
                isHovered === "feedback" ? "translate-y-[-2px]" : ""
              )}
              data-action="feedback"
              data-message-id={messageId}
            >
              <MessageSquarePlus className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className={isMobile ? "hidden" : ""}>フィードバック</span>
              
              {/* 装飾的な光沢効果 */}
              <div className="absolute inset-0 rounded-md overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-purple-400/30 dark:via-purple-500/20 to-transparent"></div>
              </div>
            </Button>
          </motion.div>
        </SheetTrigger>
        
        <SheetContent className="sm:max-w-md overflow-hidden">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-lg text-purple-700 dark:text-purple-300">
              <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              編集提案へのフィードバック
            </SheetTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={
                proposal.status === 'success' ? 'default' : 
                proposal.status === 'multiple_edits' ? 'secondary' : 'outline'
              }>
                {getProposalTypeLabel()}
              </Badge>
            </div>
            <SheetDescription className="mt-2">
              AIがフィードバックを反映した新しい提案を生成します。
              具体的なフィードバックほど良い結果につながります。
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-3 py-4">
            {/* 提案タイプを視覚的に表示 */}
            <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-3 border border-purple-200 dark:border-purple-700/30">
              <div className="text-xs text-purple-700 dark:text-purple-300 font-medium mb-1 flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5 text-purple-500" />
                AIの現在の提案:
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">
                {proposal.status === 'success' && '特定の一箇所を変更する単一編集の提案を行っています'}
                {proposal.status === 'multiple_edits' && (proposal.edits?.length || 0) > 0 && 
                  `${proposal.edits?.length}箇所の変更を含む複数編集の提案を行っています`
                }
                {proposal.status === 'replace_all' && '文書全体を新しい内容に置き換える提案を行っています'}
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="feedback-input" className="text-sm font-medium text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                <Pencil className="h-3.5 w-3.5" />
                フィードバックを入力:
              </label>
              <Textarea
                id="feedback-input"
                placeholder="例: 「もう少し簡潔な表現にしてほしい」「この部分は変更せずに他の箇所だけ修正して」「以下の条件も考慮してほしい...」など"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={6}
                className="resize-none shadow-sm bg-muted/20 focus-visible:bg-transparent transition-colors border-purple-200 dark:border-purple-700/50 focus-visible:border-purple-400 focus-visible:ring-purple-400/30"
              />
            </div>
            
            <div className="bg-muted/30 p-3 rounded-lg border border-border/50 text-xs text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">フィードバックのヒント:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>具体的な変更内容を指定する</li>
                <li>変更してほしくない部分があれば明示する</li>
                <li>追加の条件や要件を明確に伝える</li>
              </ul>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent h-6"></div>
          
          <SheetFooter className="sm:justify-between gap-3 mt-2 relative z-10">
            <SheetClose asChild>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="sm:w-32 border-purple-200 dark:border-purple-800/30 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                onClick={(e) => e.stopPropagation()}
              >
                キャンセル
              </Button>
            </SheetClose>
            
            <Button
              type="submit"
              onClick={handleSendFeedback}
              disabled={isLoading || isSubmitting || !feedbackText.trim()}
              size="sm"
              className="sm:w-full gap-2 group relative overflow-hidden bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white"
            >
              {isSubmitting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4 group-hover:scale-110 transition-transform" />
              )}
              {isSubmitting ? "送信中..." : "フィードバックを送信"}
              
              {/* アクセントライン */}
              <motion.div 
                className="absolute bottom-0 left-0 h-0.5 bg-white"
                initial={{ width: "0%" }}
                animate={{ width: feedbackText.trim() ? "100%" : "0%" }}
                transition={{ duration: 0.3 }}
              />
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// React.memoでコンポーネントをラップして不要な再レンダリングを防ぐ
export const ProposalActions = memo(ProposalActionsComponent);
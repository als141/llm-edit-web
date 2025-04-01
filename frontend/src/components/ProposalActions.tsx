"use client";

import { Button } from "@/components/ui/button";
import { Check, X, MessageSquarePlus, ThumbsUp, Pencil, RefreshCw } from 'lucide-react';
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
}

export function ProposalActions({ proposal, onFeedback, isMobile = false }: ProposalActionsProps) {
  const { applyEdit, rejectEdit, isLoading, sendMessage } = useEditorStore();
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isHovered, setIsHovered] = useState<string | null>(null);

  // シートを開くときに呼び出す関数
  const handleOpenFeedbackSheet = () => {
    onFeedback(); // 編集ストアに現在の提案を記録
    setIsSheetOpen(true);
  };

  // フィードバックの送信
  const handleSendFeedback = () => {
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
  };

  const getProposalTypeLabel = () => {
    switch (proposal.status) {
      case 'success': return '単一編集';
      case 'multiple_edits': return '複数編集';
      case 'replace_all': return '全体置換';
      default: return '提案';
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  // ボタンのレンダリング
  const renderButton = (
    key: string,
    icon: React.ReactNode,
    label: string,
    action: () => void,
    variant: "default" | "outline" | "ghost" = "default",
    color?: string,
    description?: string
  ) => (
    <TooltipProvider>
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
  );

  return (
    <AnimatePresence>
      <motion.div 
        className="grid grid-cols-3 gap-2 md:gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {/* 適用ボタン */}
        {renderButton(
          "apply", 
          <Check className="h-3.5 w-3.5 md:h-4 md:w-4" />,
          "適用",
          applyEdit,
          "default",
          "bg-green-600 hover:bg-green-700 text-white border-none",
          "この編集提案を適用します"
        )}
        
        {/* 拒否ボタン */}
        {renderButton(
          "reject", 
          <X className="h-3.5 w-3.5 md:h-4 md:w-4" />,
          "拒否",
          rejectEdit,
          "outline",
          "",
          "この編集提案を拒否します"
        )}

        {/* フィードバックボタン */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            {renderButton(
              "feedback", 
              <MessageSquarePlus className="h-3.5 w-3.5 md:h-4 md:w-4" />,
              "フィードバック",
              handleOpenFeedbackSheet,
              "ghost",
              "hover:bg-primary/10 text-primary",
              "提案に対するフィードバックを送信"
            )}
          </SheetTrigger>
          
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-lg">
                <Pencil className="h-5 w-5 text-primary" />
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
            
            <div className="space-y-3 py-6">
              <div className="space-y-1">
                <Textarea
                  placeholder="例: 「もう少し簡潔な表現にしてほしい」「この部分は変更せずに他の箇所だけ修正して」「以下の条件も考慮してほしい...」など"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={7}
                  className="resize-none shadow-sm bg-muted/20 focus-visible:bg-transparent transition-colors"
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
            
            <SheetFooter className="sm:justify-between gap-3">
              <SheetClose asChild>
                <Button type="button" variant="outline" size="sm" className="sm:w-32">
                  キャンセル
                </Button>
              </SheetClose>
              
              <Button
                type="submit"
                onClick={handleSendFeedback}
                disabled={isLoading || isSubmitting || !feedbackText.trim()}
                size="sm"
                className="sm:w-full gap-2 group relative overflow-hidden"
              >
                {isSubmitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <ThumbsUp className="h-4 w-4 group-hover:scale-110 transition-transform" />
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
      </motion.div>
    </AnimatePresence>
  );
}
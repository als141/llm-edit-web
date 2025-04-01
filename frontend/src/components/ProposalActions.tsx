"use client";

import { Button } from "@/components/ui/button";
import { Check, X, MessageSquarePlus, ThumbsUp, Pencil } from 'lucide-react';
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
import { useState } from "react";
import { motion } from "framer-motion";

interface ProposalActionsProps {
  proposal: AiResponse;
  onFeedback: () => void;
}

export function ProposalActions({ proposal, onFeedback }: ProposalActionsProps) {
  const { applyEdit, rejectEdit, isLoading, sendMessage } = useEditorStore();
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendFeedback = () => {
    if (feedbackText.trim()) {
      setIsSubmitting(true);
      sendMessage(feedbackText, true).finally(() => {
        setFeedbackText(""); 
        setIsSubmitting(false);
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

  return (
    <motion.div 
      className="flex flex-wrap gap-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Button 
        variant="default" 
        size="sm" 
        onClick={applyEdit} 
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <Check className="h-4 w-4 mr-1" />
        適用する
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={rejectEdit} 
        disabled={isLoading}
      >
        <X className="h-4 w-4 mr-1" />
        拒否する
      </Button>

      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onFeedback} 
            disabled={isLoading}
            className="ml-auto"
          >
            <MessageSquarePlus className="h-4 w-4 mr-1" />
            フィードバック
          </Button>
        </SheetTrigger>
        
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-primary" />
              編集提案へのフィードバック
            </SheetTitle>
            <SheetDescription>
              {getProposalTypeLabel()}の提案に対するフィードバックを入力してください。
              AIがフィードバックを反映した新しい提案を生成します。
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-3 py-6">
            <div className="space-y-1">
              <label className="text-sm font-medium">フィードバック内容</label>
              <Textarea
                placeholder="例: 「もう少し簡潔な表現にしてほしい」「この部分は変更せずに他の箇所だけ修正して」「以下の条件も考慮してほしい...」など"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
            
            <p className="text-xs text-muted-foreground italic">
              具体的なフィードバックを提供することで、より適切な編集提案を受け取ることができます。
            </p>
          </div>
          
          <SheetFooter className="sm:justify-between">
            <SheetClose asChild>
              <Button type="button" variant="outline" size="sm">
                キャンセル
              </Button>
            </SheetClose>
            
            <SheetClose asChild>
              <Button
                type="submit"
                onClick={handleSendFeedback}
                disabled={isLoading || isSubmitting || !feedbackText.trim()}
                size="sm"
                className="gap-2"
              >
                <ThumbsUp className="h-4 w-4" />
                フィードバックを送信
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
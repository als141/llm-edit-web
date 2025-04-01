"use client";

import { Button } from "@/components/ui/button";
import { Check, X, MessageSquarePlus } from 'lucide-react';
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
} from "@/components/ui/sheet"; // フィードバック入力用にSheetを使用
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface ProposalActionsProps {
  proposal: AiResponse;
  onFeedback: () => void; // Sheetを開くトリガー
}

export function ProposalActions({ proposal, onFeedback }: ProposalActionsProps) {
  const { applyEdit, rejectEdit, isLoading, sendMessage } = useEditorStore();
  const [feedbackText, setFeedbackText] = useState("");

  const handleSendFeedback = () => {
    if (feedbackText.trim()) {
      sendMessage(feedbackText, true); // isFeedback=true で送信
      setFeedbackText(""); // 送信後クリア
      // Sheetを閉じるためにSheetCloseを使うか、programmaticallyに閉じる
    }
  };

  return (
    <div className="flex items-center space-x-2 mt-3">
      <Button variant="outline" size="sm" onClick={applyEdit} disabled={isLoading}>
        <Check className="h-4 w-4 mr-1" />
        適用 (はい)
      </Button>
      <Button variant="outline" size="sm" onClick={rejectEdit} disabled={isLoading}>
        <X className="h-4 w-4 mr-1" />
        拒否 (いいえ)
      </Button>

      {/* フィードバックボタンとSheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" onClick={onFeedback} disabled={isLoading}>
            <MessageSquarePlus className="h-4 w-4 mr-1" />
            フィードバック
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>編集提案へのフィードバック</SheetTitle>
            <SheetDescription>
              AIの提案 ({proposal.status}) に対して、どのように修正してほしいか具体的に指示してください。
              {/* 提案内容のサマリを表示しても良い */}
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <Textarea
              placeholder="例: 「もう少し詳しく説明を追加して」「この部分は変更しないで」など"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={5}
            />
          </div>
          <SheetFooter>
            <SheetClose asChild>
                <Button type="button" variant="outline">キャンセル</Button>
            </SheetClose>
            {/* SheetCloseでSheetを閉じつつフィードバックを送信 */}
            <SheetClose asChild>
              <Button
                type="submit"
                onClick={handleSendFeedback}
                disabled={isLoading || !feedbackText.trim()}
              >
                フィードバックを送信
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
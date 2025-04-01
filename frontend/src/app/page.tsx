"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ChatPanel } from "@/components/ChatPanel";
import { EditorPanel } from "@/components/EditorPanel";
import { useEditorStore } from "@/store/editorStore";
import { useEffect } from "react";
// ↓↓↓ sonnerからtoast関数をインポート ↓↓↓
import { toast } from "sonner";

export default function Home() {
  // ↓↓↓ useToast は削除 ↓↓↓
  // const { toast } = useToast();
  const { error, clearError } = useEditorStore((state) => ({
     error: state.error,
     clearError: state.clearError
  }));

  // エラーが発生したらトーストで表示
  useEffect(() => {
    if (error) {
      // ↓↓↓ sonnerのtoast関数を使用 ↓↓↓
      toast.error("エラーが発生しました", {
        description: error,
        duration: 5000, // 表示時間 (ms)
        action: { // オプション: エラーをクリアするボタン
           label: "閉じる",
           onClick: () => clearError(),
         },
         // onDismiss: () => clearError(), // トーストが消えたらエラーをクリアする場合
      });
      // エラー表示後すぐにクリアするかどうかはUXによる
      // clearError();
    }
  }, [error, clearError]);


  return (
    <main className="flex h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-12 bg-background">
      {/* 全体の高さを確保し、背景色を設定 */}
      <ResizablePanelGroup
        direction="horizontal"
        className="w-full h-full max-w-screen-2xl rounded-lg border shadow-sm" // 最大幅、ボーダー、影を追加
      >
        <ResizablePanel defaultSize={40} minSize={25}>
          <ChatPanel />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60} minSize={35}>
          <EditorPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
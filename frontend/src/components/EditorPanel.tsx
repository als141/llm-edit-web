"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileInput } from "@/components/FileInput"; // FileInputコンポーネントを別途作成
import { useEditorStore } from "@/store/editorStore";
import { ScrollArea } from "@/components/ui/scroll-area";

export function EditorPanel() {
  const { currentText, fileContent } = useEditorStore((state) => ({
     currentText: state.currentText,
     fileContent: state.fileContent, // 初期状態判定用
  }));

  // Textareaは読み取り専用とし、編集はAI経由のみとする
  // または、編集可能にして、変更があれば差分を明示するなど、仕様による

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
       <h2 className="text-lg font-semibold">エディタ</h2>
      <FileInput />
      <Card className="flex-grow flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">現在のテキスト</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow p-0 overflow-hidden">
           {/* テキストエリアをCardの高さに追従させる */}
          <ScrollArea className="h-full p-4 pt-0">
              {/* 初期状態またはファイル未選択時はプレースホルダー表示 */}
              {fileContent === '' ? (
                  <div className="text-muted-foreground h-full flex items-center justify-center">
                      左下のエリアからテキストを入力またはファイルをアップロードしてください。
                  </div>
              ) : (
                  <pre className="text-sm whitespace-pre-wrap break-words">
                      {currentText}
                  </pre>
                  // Textareaを使う場合:
                  // <Textarea
                  //   value={currentText}
                  //   readOnly // 基本的に読み取り専用
                  //   className="h-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-4 text-sm"
                  //   placeholder="テキストを入力またはファイルをアップロードしてください"
                  // />
              )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
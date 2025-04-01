"use client";

import { FileInput } from "@/components/FileInput";
import { useEditorStore } from "@/store/editorStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeIcon, FileText, Type } from "lucide-react";

export function EditorPanel() {
  const currentText = useEditorStore(state => state.currentText);
  const fileContent = useEditorStore(state => state.fileContent);

  return (
    <div className="h-full flex flex-col bg-background">
      <Tabs defaultValue="editor" className="h-full flex flex-col">
        {/* ヘッダー部分 - タブを右側に配置 */}
        <div className="flex-none p-4 border-b bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-medium">テキストエディタ</h2>
            </div>
            <TabsList className="bg-muted/40 h-8">
              <TabsTrigger value="editor" className="flex items-center gap-1 h-7 px-3 text-xs">
                <Type className="h-3.5 w-3.5" />
                <span>エディタ</span>
              </TabsTrigger>
              <TabsTrigger value="raw" className="flex items-center gap-1 h-7 px-3 text-xs">
                <CodeIcon className="h-3.5 w-3.5" />
                <span>Raw</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        {/* コンテンツ部分 */}
        <div className="flex-grow p-4 overflow-y-auto scrollbar-thin">
          <TabsContent value="editor" className="space-y-4 mt-0 h-full">
            {/* ファイル入力部分 */}
            <FileInput />
            
            {/* テキストエディタ部分 */}
            <div className="border rounded-md shadow-sm bg-card">
              <div className="py-2 px-4 border-b flex items-center justify-between">
                <h3 className="text-sm font-medium">現在のテキスト</h3>
                <span className="text-xs text-muted-foreground">
                  {currentText.length > 0 ? `${currentText.length.toLocaleString()} 文字` : ''}
                </span>
              </div>
              
              <div className="max-h-[calc(100vh-360px)] overflow-y-auto">
                {fileContent === '' ? (
                  <div className="text-muted-foreground flex flex-col items-center justify-center p-8 h-48">
                    <FileText className="h-12 w-12 mb-4 text-muted-foreground/25" />
                    <p className="text-center max-w-md">
                      テキストを入力またはファイルをアップロードしてください。
                      AIが編集の手助けをします。
                    </p>
                  </div>
                ) : (
                  <div className="p-4">
                    <pre className="text-sm whitespace-pre-wrap break-words font-mono bg-muted/30 p-4 rounded-md">
                      {currentText}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="raw" className="mt-0 h-full">
            <div className="border rounded-md shadow-sm bg-card">
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {fileContent === '' ? (
                  <div className="text-muted-foreground flex flex-col items-center justify-center p-8 h-48">
                    <CodeIcon className="h-12 w-12 mb-4 text-muted-foreground/25" />
                    <p className="text-center">テキストが入力されていません</p>
                  </div>
                ) : (
                  <pre className="p-4 text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                    {currentText}
                  </pre>
                )}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
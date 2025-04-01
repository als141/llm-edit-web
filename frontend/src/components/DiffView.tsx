"use client";

import { useState } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';
import type { ReactDiffViewerStylesOverride } from 'react-diff-viewer';
import { type AiResponse, type Edit } from '@/lib/types';
import { useEditorStore } from '@/store/editorStore';
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { File, FileText, Code, Maximize2, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

interface DiffViewProps {
  response: AiResponse;
}

export function DiffView({ response }: DiffViewProps) {
  const currentText = useEditorStore(state => state.currentText);
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme === 'dark';
  const [viewType, setViewType] = useState<'diff' | 'code'>('diff');

  // 差分表示のスタイル設定
  const commonStyles: ReactDiffViewerStylesOverride = {
    diffContainer: { 
      borderRadius: '0.375rem',
      lineHeight: '1.5',
      overflow: 'hidden',
    },
    diffRemoved: { 
      backgroundColor: isDarkTheme
        ? 'rgba(239, 68, 68, 0.15)'
        : 'rgba(239, 68, 68, 0.1)',
      borderColor: isDarkTheme
        ? 'rgba(239, 68, 68, 0.3)'
        : 'rgba(239, 68, 68, 0.2)',
    },
    diffAdded: { 
      backgroundColor: isDarkTheme
        ? 'rgba(34, 197, 94, 0.15)'
        : 'rgba(34, 197, 94, 0.1)',
      borderColor: isDarkTheme
        ? 'rgba(34, 197, 94, 0.3)'
        : 'rgba(34, 197, 94, 0.2)',
    },
    line: { 
      padding: '4px 2px',
      fontSize: '0.875rem', 
    },
    gutter: { 
      minWidth: '30px',
      padding: '0 8px',
      fontSize: '0.75rem',
      textAlign: 'right' as const,
      background: isDarkTheme
        ? 'rgba(255, 255, 255, 0.03)'
        : 'rgba(0, 0, 0, 0.03)',
    }
  };

  // モーダル用のスタイル
  const modalStyles: ReactDiffViewerStylesOverride = {
    ...commonStyles,
    diffContainer: {
      borderRadius: '0.375rem',
      lineHeight: '1.5',
      overflow: 'hidden',
      maxHeight: 'none',
    },
    line: {
      padding: '4px 2px',
      fontSize: '0.95rem',
    },
    gutter: {
      minWidth: '40px',
      padding: '0 10px',
      fontSize: '0.85rem',
      textAlign: 'right' as const,
      background: isDarkTheme
        ? 'rgba(255, 255, 255, 0.03)'
        : 'rgba(0, 0, 0, 0.03)',
    }
  };

  if (response.status === 'success' && response.old_string !== undefined && response.new_string !== undefined) {
    return (
      <div className="w-full overflow-hidden rounded-md border">
        <Tabs value={viewType} onValueChange={(v) => setViewType(v as 'diff' | 'code')} className="w-full">
          <div className="flex items-center justify-between bg-muted/50 px-2 py-1 border-b">
            <TabsList className="bg-transparent h-7 p-0">
              <TabsTrigger value="diff" className="h-7 px-2 text-xs">
                <FileText className="h-3.5 w-3.5 mr-1" />差分表示
              </TabsTrigger>
              <TabsTrigger value="code" className="h-7 px-2 text-xs">
                <Code className="h-3.5 w-3.5 mr-1" />コード表示
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">単一編集</div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-6 w-6">
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span className="sr-only">拡大表示</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>差分の詳細表示</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-auto mt-4">
                    <Tabs defaultValue="diff" className="w-full">
                      <TabsList>
                        <TabsTrigger value="diff">
                          <FileText className="h-4 w-4 mr-1.5" />差分表示
                        </TabsTrigger>
                        <TabsTrigger value="code">
                          <Code className="h-4 w-4 mr-1.5" />コード表示
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="diff" className="mt-2">
                        <div className="overflow-auto">
                          <ReactDiffViewer
                            oldValue={response.old_string}
                            newValue={response.new_string}
                            splitView={true}
                            compareMethod={DiffMethod.WORDS}
                            styles={modalStyles}
                            useDarkTheme={isDarkTheme}
                          />
                        </div>
                      </TabsContent>
                      <TabsContent value="code" className="mt-2">
                        <div className="bg-muted/30 p-4 rounded-md overflow-auto">
                          <pre className="whitespace-pre-wrap">{response.new_string}</pre>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <TabsContent value="diff" className="m-0">
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <ReactDiffViewer
                oldValue={response.old_string}
                newValue={response.new_string}
                splitView={false}
                compareMethod={DiffMethod.WORDS}
                styles={commonStyles}
                useDarkTheme={isDarkTheme}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="code" className="m-0">
            <div className="overflow-x-auto bg-muted/30 p-3 max-h-[300px] overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap">{response.new_string}</pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (response.status === 'multiple_edits' && Array.isArray(response.edits)) {
    return (
      <div className="space-y-2">
        <Tabs value={viewType} onValueChange={(v) => setViewType(v as 'diff' | 'code')} className="w-full">
          <div className="flex items-center justify-between bg-muted/50 px-2 py-1 rounded-t-md border">
            <TabsList className="bg-transparent h-7 p-0">
              <TabsTrigger value="diff" className="h-7 px-2 text-xs">
                <FileText className="h-3.5 w-3.5 mr-1" />差分表示
              </TabsTrigger>
              <TabsTrigger value="code" className="h-7 px-2 text-xs">
                <Code className="h-3.5 w-3.5 mr-1" />コード表示
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">{response.edits.length}箇所の編集</div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-6 w-6">
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span className="sr-only">拡大表示</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>{response.edits.length}箇所の編集 - 詳細表示</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-auto mt-4">
                    <Tabs defaultValue="diff" className="w-full">
                      <TabsList>
                        <TabsTrigger value="diff">
                          <FileText className="h-4 w-4 mr-1.5" />差分表示
                        </TabsTrigger>
                        <TabsTrigger value="code">
                          <Code className="h-4 w-4 mr-1.5" />コード表示
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="diff" className="mt-2">
                        <div className="border rounded-md">
                          {response.edits.map((edit: Edit, index: number) => (
                            <div key={index} className="border-b last:border-b-0">
                              <div className="text-sm font-medium bg-muted/50 px-3 py-1.5 text-muted-foreground border-b">
                                編集 {index + 1}
                              </div>
                              <div className="overflow-auto">
                                <ReactDiffViewer
                                  oldValue={edit.old_string}
                                  newValue={edit.new_string}
                                  splitView={true}
                                  compareMethod={DiffMethod.WORDS}
                                  styles={modalStyles}
                                  useDarkTheme={isDarkTheme}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="code" className="mt-2">
                        <div className="bg-muted/30 p-4 rounded-md space-y-4">
                          {response.edits.map((edit: Edit, index: number) => (
                            <div key={index} className="mb-3 last:mb-0">
                              <div className="text-sm font-medium mb-1 text-muted-foreground">
                                編集 {index + 1}:
                              </div>
                              <pre className="whitespace-pre-wrap bg-muted p-3 rounded-md">{edit.new_string}</pre>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <TabsContent value="diff" className="m-0 border border-t-0 rounded-b-md overflow-hidden">
            <div className="space-y-px max-h-[400px] overflow-y-auto">
              {response.edits.map((edit: Edit, index: number) => (
                <div key={index} className="border-b last:border-b-0">
                  <div className="text-xs font-medium bg-muted/50 px-2 py-1 text-muted-foreground border-b">
                    編集 {index + 1}
                  </div>
                  <div className="overflow-x-auto">
                    <ReactDiffViewer
                      oldValue={edit.old_string}
                      newValue={edit.new_string}
                      splitView={false}
                      compareMethod={DiffMethod.WORDS}
                      styles={{...commonStyles, diffContainer: { borderRadius: '0' }}}
                      useDarkTheme={isDarkTheme}
                    />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="code" className="m-0 border border-t-0 rounded-b-md">
            <div className="bg-muted/30 p-3 max-h-[300px] overflow-auto">
              {response.edits.map((edit: Edit, index: number) => (
                <div key={index} className="mb-3 last:mb-0">
                  <div className="text-xs font-medium mb-1 text-muted-foreground">
                    編集 {index + 1}:
                  </div>
                  <pre className="text-sm whitespace-pre-wrap bg-muted p-2 rounded-md">{edit.new_string}</pre>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (response.status === 'replace_all' && response.content !== undefined) {
    return (
      <div className="w-full overflow-hidden rounded-md border">
        <Tabs value={viewType} onValueChange={(v) => setViewType(v as 'diff' | 'code')} className="w-full">
          <div className="flex items-center justify-between bg-muted/50 px-2 py-1 border-b">
            <TabsList className="bg-transparent h-7 p-0">
              <TabsTrigger value="diff" className="h-7 px-2 text-xs">
                <FileText className="h-3.5 w-3.5 mr-1" />差分表示
              </TabsTrigger>
              <TabsTrigger value="code" className="h-7 px-2 text-xs">
                <Code className="h-3.5 w-3.5 mr-1" />コード表示
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">全体置換</div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-6 w-6">
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span className="sr-only">拡大表示</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>全体置換 - 詳細表示</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-auto mt-4">
                    <Tabs defaultValue="diff" className="w-full">
                      <TabsList>
                        <TabsTrigger value="diff">
                          <FileText className="h-4 w-4 mr-1.5" />差分表示
                        </TabsTrigger>
                        <TabsTrigger value="code">
                          <Code className="h-4 w-4 mr-1.5" />コード表示
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="diff" className="mt-2">
                        <div className="overflow-auto">
                          <ReactDiffViewer
                            oldValue={currentText}
                            newValue={response.content}
                            splitView={true}
                            compareMethod={DiffMethod.WORDS}
                            styles={modalStyles}
                            useDarkTheme={isDarkTheme}
                          />
                        </div>
                      </TabsContent>
                      <TabsContent value="code" className="mt-2">
                        <div className="bg-muted/30 p-4 rounded-md overflow-auto">
                          <pre className="whitespace-pre-wrap">{response.content}</pre>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <TabsContent value="diff" className="m-0">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <ReactDiffViewer
                oldValue={currentText}
                newValue={response.content}
                splitView={true}
                compareMethod={DiffMethod.WORDS}
                styles={commonStyles}
                useDarkTheme={isDarkTheme}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="code" className="m-0">
            <div className="bg-muted/30 p-3 max-h-[300px] overflow-auto">
              <pre className="text-sm whitespace-pre-wrap">{response.content}</pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return null;
}
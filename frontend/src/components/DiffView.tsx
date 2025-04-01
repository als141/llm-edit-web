"use client";

import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';
// ↓↓↓ 型定義を lib/types.ts からインポート ↓↓↓
import { type AiResponse, type Edit } from '@/lib/types';
import { useEditorStore } from '@/store/editorStore';

interface DiffViewProps {
  response: AiResponse;
}

export function DiffView({ response }: DiffViewProps) {
  // 個別のセレクタを使用
  const currentText = useEditorStore(state => state.currentText);
  
  // useThemeフックを使ってダークモード判定 (必要なら)
  // import { useTheme } from "next-themes";
  // const { resolvedTheme } = useTheme();
  // const useDark = resolvedTheme === 'dark';

  const commonStyles = {
      diffContainer: { borderRadius: '0.375rem', lineHeight: '1.4' }, // rounded-md相当, 行間調整
      diffRemoved: { backgroundColor: 'hsl(var(--destructive) / 0.1)' },
      diffAdded: { backgroundColor: 'hsl(var(--accent) / 0.5)' }, // 背景色調整
      wordDiff: { padding: '1px' }, // 単語差分のパディング
      line: { padding: '4px 2px' }, // 行のパディング
      gutter: { minWidth: '25px', padding: '4px 4px 4px 0px'} // 行番号部分
  };


  if (response.status === 'success' && response.old_string !== undefined && response.new_string !== undefined) {
    return (
      <div className="overflow-x-auto">
        <ReactDiffViewer
          oldValue={response.old_string}
          newValue={response.new_string}
          splitView={false} // インライン表示
          compareMethod={DiffMethod.WORDS}
          styles={commonStyles}
          // useDarkTheme={useDark} // ダークモード対応
        />
       </div>
    );
  }

  if (response.status === 'multiple_edits' && Array.isArray(response.edits)) {
    return (
      <div className="space-y-4">
        {/* ↓↓↓ edit と index に型注釈を追加 ↓↓↓ */}
        {response.edits.map((edit: Edit, index: number) => (
          <div key={index} className="border rounded-md overflow-hidden">
            {/* ヘッダーを追加して分かりやすく */}
            <p className="text-xs font-medium bg-muted px-2 py-1 border-b">編集 {index + 1}</p>
            <div className="overflow-x-auto">
                <ReactDiffViewer
                  oldValue={edit.old_string}
                  newValue={edit.new_string}
                  splitView={false}
                  compareMethod={DiffMethod.WORDS}
                  styles={{...commonStyles, diffContainer: { borderRadius: '0' }}} // 角丸なし
                  // useDarkTheme={useDark}
                />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (response.status === 'replace_all' && response.content !== undefined) {
       return (
         <div className="overflow-x-auto">
            <ReactDiffViewer
              oldValue={currentText}
              newValue={response.content}
              splitView={true} // 全体置換は左右比較
              compareMethod={DiffMethod.WORDS}
              styles={commonStyles}
              // useDarkTheme={useDark}
            />
         </div>
    );
  }

  return null;
}
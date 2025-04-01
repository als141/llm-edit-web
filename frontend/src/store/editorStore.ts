// frontend/src/store/editorStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
    type AiResponse,
    type ConversationMessage,
    MessageRole,
    MessageType,
    type Edit,
} from '@/lib/types';
import { callEditApi } from '@/lib/api';
import { nanoid } from 'nanoid';
import { toast } from "sonner";

interface EditorState {
  fileContent: string;
  currentText: string;
  history: ConversationMessage[];
  isLoading: boolean;
  error: string | null;
  lastProposal: AiResponse | null;
  isEditing: boolean;
  isFeedbackMode: boolean;  // フィードバックモードかどうかを示すフラグ
  feedbackMessageIds: string[];  // フィードバックとして送信されたメッセージのID

  // 既存の関数
  setFileContent: (content: string) => void;
  sendMessage: (message: string, isFeedback?: boolean) => Promise<void>;
  applyEdit: () => void;
  rejectEdit: () => void;
  startFeedback: (proposal: AiResponse) => void;
  clearError: () => void;
  
  // 新機能: チャット履歴削除
  clearHistory: () => void;
  
  // 新機能: テキスト直接編集
  startEditing: () => void;
  cancelEditing: () => void;
  saveEditing: (newText: string) => void;
  updateCurrentText: (newText: string) => void;
}

export const useEditorStore = create<EditorState>()(
  immer((set, get) => ({
    fileContent: '',
    currentText: '',
    history: [],
    isLoading: false,
    error: null,
    lastProposal: null,
    isEditing: false,
    isFeedbackMode: false,
    feedbackMessageIds: [],

    setFileContent: (content) => {
      set((state) => {
        state.fileContent = content;
        state.currentText = content;
        state.history = [];
        state.lastProposal = null;
        state.error = null;
        state.isEditing = false;
        state.isFeedbackMode = false;
      });
    },

    clearError: () => {
      set({ error: null });
    },

    startFeedback: (proposal) => {
      set((state) => {
        state.lastProposal = proposal;
        state.isFeedbackMode = true;
        console.log("フィードバックモード開始:", proposal);
      });
    },

    // 新機能: チャット履歴の削除
    clearHistory: () => {
      set((state) => {
        state.history = [];
        state.lastProposal = null;
        state.error = null;
        state.isFeedbackMode = false;
        state.feedbackMessageIds = [];
      });
      
      // 履歴削除の成功メッセージを表示
      toast.success("チャット履歴を削除しました", {
        description: "新しい会話を始めることができます",
      });
    },
    
    // 新機能: テキスト直接編集
    startEditing: () => {
      set({ isEditing: true });
    },
    
    cancelEditing: () => {
      set({ isEditing: false });
    },
    
    saveEditing: (newText) => {
      set((state) => {
        state.currentText = newText;
        state.isEditing = false;
        
        // 編集完了のシステムメッセージを追加
        state.history.push({
          id: nanoid(),
          role: MessageRole.System,
          content: "テキストを手動で編集しました。",
          type: MessageType.SystemInfo,
        });
      });
    },
    
    updateCurrentText: (newText) => {
      set({ currentText: newText });
    },

    sendMessage: async (message, isFeedback = false) => {
      const userMessageContent = message.trim();
      if (!userMessageContent) return;

      const messageId = nanoid();
      const currentUserMessage: ConversationMessage = {
        id: messageId,
        role: MessageRole.User,
        content: userMessageContent,
        type: MessageType.Normal,
      };
      
      // フィードバックメッセージの場合、IDを記録する
      if (isFeedback) {
        set(state => {
          state.feedbackMessageIds.push(messageId);
        });
      }

      set((state) => {
        state.history.push(currentUserMessage);
        state.isLoading = true;
        state.error = null;
        
        // ローディングメッセージを追加
        state.history.push({
          id: nanoid(),
          role: MessageRole.Assistant,
          content: '考え中...',
          type: MessageType.Loading,
        });
      });

      // フィードバックモードかどうかを確認し、適切な提案を取得
      const proposalForFeedback = isFeedback ? get().lastProposal : null;
      
      // フィードバックモードでなければ、lastProposalをリセット
      if (!isFeedback) {
        set((state) => {
          state.lastProposal = null;
          state.isFeedbackMode = false;
        });
      }

      try {
        // 履歴からローディングとシステムメッセージを除外
        const apiHistory = get()
          .history
          .filter(
            (msg: ConversationMessage) =>
              msg.type !== MessageType.Loading && msg.type !== MessageType.SystemInfo
          )
          .map((h: ConversationMessage) => ({
            role: h.role,
            content: typeof h.content === 'object' ? JSON.stringify(h.content) : h.content,
          }));

        // APIに送信する履歴（最新のユーザーメッセージを除く）
        const historyForApi = apiHistory.length > 0 ? apiHistory.slice(0, -1) : [];

        console.log("API呼び出し:", {
          is_feedback: isFeedback,
          previous_proposal: proposalForFeedback,
          message: userMessageContent
        });

        // APIを呼び出し
        const response = await callEditApi({
          current_file_content: get().currentText,
          latest_user_content: userMessageContent,
          history: historyForApi,
          is_feedback: isFeedback,
          previous_proposal: proposalForFeedback,
        });

        set((state) => {
          // ローディングメッセージを削除
          state.history = state.history.filter(
              (msg: ConversationMessage) => msg.type !== MessageType.Loading
          );

          // AIの応答メッセージを作成
          const aiResponseMessage: ConversationMessage = {
            id: nanoid(),
            role: MessageRole.Assistant,
            content: response,
            type: MessageType.Normal,
          };

          // レスポンスの種類に応じて処理
          if (response.status === 'success' || response.status === 'multiple_edits' || response.status === 'replace_all') {
             aiResponseMessage.type = MessageType.Proposal;
             state.lastProposal = response;
             state.isFeedbackMode = false; // フィードバックが完了したのでフラグをリセット
          } else if (response.status === 'error') {
             aiResponseMessage.type = MessageType.Error;
             state.error = response.message || 'AIからの応答でエラーが発生しました。';
             state.lastProposal = null;
             state.isFeedbackMode = false;
          } else if (response.status === 'clarification_needed' || response.status === 'conversation' || response.status === 'rejected') {
              aiResponseMessage.type = MessageType.Normal;
              state.lastProposal = null;
              state.isFeedbackMode = false;
          }

          // 履歴に応答を追加
          state.history.push(aiResponseMessage);
          state.isLoading = false;
        });

      } catch (err: any) {
        console.error("sendMessage error:", err);
        const errorMessage = err.message || 'メッセージの送信中にエラーが発生しました。';
        set((state) => {
          // ローディングメッセージを削除
          state.history = state.history.filter(
              (msg: ConversationMessage) => msg.type !== MessageType.Loading
          );
          
          // エラーメッセージを追加
          state.history.push({
             id: nanoid(),
             role: MessageRole.System,
             content: `エラー: ${errorMessage}`,
             type: MessageType.Error,
          });
          
          // 状態をリセット
          state.isLoading = false;
          state.error = errorMessage;
          state.lastProposal = null;
          state.isFeedbackMode = false;
        });
        throw err; // エラーを再スローして呼び出し元で処理できるようにする
      }
    },

    applyEdit: () => {
      const proposal = get().lastProposal;
      if (!proposal) return;

      let newText = get().currentText;
      let appliedMessage = '';
      let success = false;

      try {
        if (proposal.status === 'success') {
          const { old_string, new_string } = proposal;
          if (typeof old_string === 'string' && typeof new_string === 'string') {
            const escapedOldString = escapeRegExp(old_string);
            const regex = new RegExp(escapedOldString, 'g');
            const matches = get().currentText.match(regex);
            const count = matches ? matches.length : 0;

            if (count === 1) {
              newText = get().currentText.replace(regex, new_string);
              appliedMessage = `提案 (単一編集) を適用しました。`;
              success = true;
            } else if (count > 1) {
               throw new Error(`変更元テキストが複数 (${count}箇所) 見つかりました。適用を中止します。\n変更元: ${old_string.substring(0,50)}...`);
            } else {
               throw new Error(`変更元テキストが見つかりませんでした。\n変更元: ${old_string.substring(0,50)}...`);
            }
          } else {
            throw new Error('提案の形式が無効です (success)。');
          }
        } else if (proposal.status === 'multiple_edits') {
          const { edits } = proposal;
          if (Array.isArray(edits)) {
             let currentContent = get().currentText;
             let problems: string[] = [];
             let appliedCount = 0;
             const validatedEdits: (Edit & { startIndex: number; endIndex: number })[] = [];
             const overlappingIndices = new Set<number>();

             for (const edit of edits) {
                 if (typeof edit.old_string !== 'string' || typeof edit.new_string !== 'string' || !edit.old_string) {
                     problems.push(`無効な編集形式: ${JSON.stringify(edit)}`);
                     continue;
                 }
                 const escapedOldString = escapeRegExp(edit.old_string);
                 const regex = new RegExp(escapedOldString, 'g');
                 const indices = [];
                 let match;
                 while ((match = regex.exec(currentContent)) !== null) {
                     indices.push(match.index);
                     if (match.index === regex.lastIndex) {
                         regex.lastIndex++;
                     }
                 }

                 if (indices.length === 0) {
                     problems.push(`変更元が見つかりません: ${edit.old_string.substring(0, 30)}...`);
                 } else if (indices.length > 1) {
                     problems.push(`変更元が複数 (${indices.length}) 見つかりました: ${edit.old_string.substring(0, 30)}...`);
                 } else {
                     const startIndex = indices[0];
                     const endIndex = startIndex + edit.old_string.length;
                     const currentRange = new Set(Array.from({length: endIndex - startIndex}, (_, i) => startIndex + i));
                     if ([...currentRange].some(idx => overlappingIndices.has(idx))) {
                          problems.push(`他の編集と重複します: ${edit.old_string.substring(0, 30)}...`);
                     } else {
                         validatedEdits.push({ ...edit, startIndex, endIndex });
                         currentRange.forEach(idx => overlappingIndices.add(idx));
                     }
                 }
             }

             if (problems.length > 0) {
                  throw new Error(`複数編集の検証エラー:\n- ${problems.join('\n- ')}`);
             }

             validatedEdits.sort((a, b) => b.startIndex - a.startIndex);
             newText = currentContent;
             for (const ve of validatedEdits) {
                  newText = newText.substring(0, ve.startIndex) + ve.new_string + newText.substring(ve.endIndex);
                  appliedCount++;
             }

             if(appliedCount !== edits.length) {
                console.warn(`複数編集の適用数が一致しません。 Expected: ${edits.length}, Applied: ${appliedCount}`);
             }
             appliedMessage = `提案 (${appliedCount}箇所の複数編集) を適用しました。`;
             success = true;

          } else {
            throw new Error('提案の形式が無効です (multiple_edits)。');
          }
        } else if (proposal.status === 'replace_all') {
          const { content } = proposal;
          if (typeof content === 'string') {
            newText = content;
            appliedMessage = `提案 (全体置換) を適用しました。`;
            success = true;
          } else {
            throw new Error('提案の形式が無効です (replace_all)。');
          }
        }

        if (success) {
          set((state) => {
            state.currentText = newText;
            state.lastProposal = null;
            state.error = null;
            state.isFeedbackMode = false;
            state.history.push({
              id: nanoid(),
              role: MessageRole.System,
              content: appliedMessage,
              type: MessageType.SystemInfo,
            });
          });
          
          // 適用成功のトースト通知
          toast.success("編集を適用しました", {
            description: appliedMessage,
          });
        }

      } catch (err: any) {
         console.error("applyEdit error:", err);
         const errorMessage = err.message || '編集の適用中にエラーが発生しました。';
         set((state) => {
           state.error = errorMessage;
           const existingErrorIndex = state.history.findIndex((h: ConversationMessage) =>
               h.type === MessageType.Error && typeof h.content === 'string' && h.content.startsWith('適用エラー:')
           );
            if (existingErrorIndex === -1) {
                state.history.push({
                    id: nanoid(),
                    role: MessageRole.System,
                    content: `適用エラー: ${errorMessage}`,
                    type: MessageType.Error,
                });
            }
         });
         
         // エラーのトースト通知
         toast.error("編集の適用に失敗しました", {
           description: errorMessage,
         });
      }
    },

    rejectEdit: () => {
      const proposal = get().lastProposal;
      if (!proposal) return;
      set((state) => {
        state.lastProposal = null;
        state.error = null;
        state.isFeedbackMode = false;
        state.history.push({
          id: nanoid(),
          role: MessageRole.System,
          content: `提案 (${proposal.status}) を拒否しました。`,
          type: MessageType.SystemInfo,
        });
      });
      
      // 拒否のトースト通知
      toast.info("編集提案を拒否しました", {
        description: "別の指示を入力できます",
      });
    },
  }))
);

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
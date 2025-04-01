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

interface EditorState {
  fileContent: string;
  currentText: string;
  history: ConversationMessage[];
  isLoading: boolean;
  error: string | null;
  lastProposal: AiResponse | null;

  setFileContent: (content: string) => void;
  sendMessage: (message: string, isFeedback?: boolean) => Promise<void>;
  applyEdit: () => void;
  rejectEdit: () => void;
  startFeedback: (proposal: AiResponse) => void;
  clearError: () => void;
}

export const useEditorStore = create<EditorState>()(
  immer((set, get) => ({
    fileContent: '',
    currentText: '',
    history: [],
    isLoading: false,
    error: null,
    lastProposal: null,

    setFileContent: (content) => {
      set((state) => {
        state.fileContent = content;
        state.currentText = content;
        state.history = [];
        state.lastProposal = null;
        state.error = null;
      });
    },

    clearError: () => {
      set({ error: null });
    },

    startFeedback: (proposal) => {
      set({ lastProposal: proposal });
    },

    sendMessage: async (message, isFeedback = false) => {
      const userMessageContent = message.trim();
      if (!userMessageContent) return;

      const currentUserMessage: ConversationMessage = {
        id: nanoid(),
        role: MessageRole.User,
        content: userMessageContent,
        type: MessageType.Normal,
      };

      set((state) => {
        state.history.push(currentUserMessage);
        state.isLoading = true;
        state.error = null;
        state.history.push({
          id: nanoid(),
          role: MessageRole.Assistant,
          content: '考え中...',
          type: MessageType.Loading,
        });
      });

      const proposalForFeedback = isFeedback ? get().lastProposal : null;
      if (!isFeedback) {
          set({ lastProposal: null });
      }


      try {
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

        const historyForApi = apiHistory.length > 0 ? apiHistory.slice(0, -1) : [];

        const response = await callEditApi({
          current_file_content: get().currentText,
          latest_user_content: userMessageContent,
          history: historyForApi,
          is_feedback: isFeedback,
          previous_proposal: proposalForFeedback,
        });

        set((state) => {
          state.history = state.history.filter(
              (msg: ConversationMessage) => msg.type !== MessageType.Loading
          );

          const aiResponseMessage: ConversationMessage = {
            id: nanoid(),
            role: MessageRole.Assistant,
            content: response,
            type: MessageType.Normal,
          };

          if (response.status === 'success' || response.status === 'multiple_edits' || response.status === 'replace_all') {
             aiResponseMessage.type = MessageType.Proposal;
             state.lastProposal = response;
          } else if (response.status === 'error') {
             aiResponseMessage.type = MessageType.Error;
             state.error = response.message || 'AIからの応答でエラーが発生しました。';
             state.lastProposal = null;
          } else if (response.status === 'clarification_needed' || response.status === 'conversation' || response.status === 'rejected') {
              aiResponseMessage.type = MessageType.Normal;
              state.lastProposal = null;
          }

          state.history.push(aiResponseMessage);
          state.isLoading = false;
        });

      } catch (err: any) {
        console.error("sendMessage error:", err);
        const errorMessage = err.message || 'メッセージの送信中にエラーが発生しました。';
        set((state) => {
          state.history = state.history.filter(
              (msg: ConversationMessage) => msg.type !== MessageType.Loading
          );
          state.history.push({
             id: nanoid(),
             role: MessageRole.System,
             content: `エラー: ${errorMessage}`,
             type: MessageType.Error,
          });
          state.isLoading = false;
          state.error = errorMessage;
          state.lastProposal = null;
        });
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
            state.history.push({
              id: nanoid(),
              role: MessageRole.System,
              content: appliedMessage,
              type: MessageType.SystemInfo,
            });
          });
        }

      } catch (err: any) {
         console.error("applyEdit error:", err);
         const errorMessage = err.message || '編集の適用中にエラーが発生しました。';
         set((state) => {
           state.error = errorMessage;
           // ↓↓↓ ここで h に型注釈を追加 ↓↓↓
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
      }
    },

    rejectEdit: () => {
      const proposal = get().lastProposal;
      if (!proposal) return;
      set((state) => {
        state.lastProposal = null;
        state.error = null;
        state.history.push({
          id: nanoid(),
          role: MessageRole.System,
          content: `提案 (${proposal.status}) を拒否しました。`,
          type: MessageType.SystemInfo,
        });
      });
    },
  }))
);

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
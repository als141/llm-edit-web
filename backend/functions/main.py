# -*- coding: utf-8 -*-
import os
import json
from openai import OpenAI, RateLimitError, APIError, APIConnectionError
from typing import List, Dict, Optional, Any
import functions_framework # Firebase Functions v2 (明示的インポートは不要な場合も)
from firebase_functions import options, https_fn
from firebase_admin import initialize_app
import traceback

# --- グローバル設定 ---
# 東京リージョンに設定 (他のリージョンを使用する場合は変更)
options.set_global_options(region=options.SupportedRegion.ASIA_NORTHEAST1)

# Firebase Admin SDK の初期化 (環境変数等で自動初期化されることが多い)
# initialize_app()

# --- OpenAI クライアント初期化 ---
try:
    # Firebase 環境変数から API キーを取得
    # 事前に `firebase functions:config:set openai.key="YOUR_OPENAI_API_KEY"` を実行しておく
    openai_api_key = os.environ.get("OPENAI_API_KEY")
    if not openai_api_key:
        raise ValueError("環境変数 'OPENAI_API_KEY' が設定されていません。")
    client = OpenAI(api_key=openai_api_key)
    MODEL = "gpt-4o-mini" # 使用するモデル
except Exception as e:
    print(f"FATAL: OpenAIクライアントの初期化に失敗しました: {e}")
    # 関数呼び出し時にエラーレスポンスを返すように client を None に設定
    client = None

# --- プロンプトテンプレート ---
# llm-edit.py から SYSTEM_PROMPT_TEMPLATE をコピー
SYSTEM_PROMPT_TEMPLATE = """
あなたはテキストファイルを編集するアシスタントAIです。ユーザーは編集したいファイルの内容と編集指示を与えます。
あなたはこれまでのユーザーとの会話履歴も参照できます。履歴には、過去のあなたの提案（JSON形式の場合あり）やそれに対するユーザーのフィードバックも含まれます。これらを理解し、文脈を踏まえて応答・提案してください。

**特に重要な指示: フィードバックの処理**
ユーザー入力が「前回の提案に対するフィードバック」として与えられた場合、以下のルールに従ってください。
1.  **編集対象の特定:**
    * 前回の提案が `replace_all` または `success` であった場合： **現在のファイル内容ではなく、ユーザーメッセージ内に提示される【前回の提案内容 (編集対象)】を編集対象**としてください。（履歴内の直前の提案JSONも参照してください）
    * 前回の提案が `multiple_edits` であった場合： **ユーザーメッセージ内に提示される【現在のファイル内容】を編集対象**としますが、**会話履歴に含まれる直前のAI提案（JSON形式）の内容を十分に考慮**し、フィードバックを反映させてください。
2.  **フィードバックの反映:** ユーザーのフィードバックを最優先で考慮し、特定した編集対象に対して修正を加えた新しい提案（元の提案と同じ形式、または `clarification_needed` など状況に応じた適切な形式）を生成してください。

あなたの主なタスクは、ユーザーの指示（またはフィードバック）に基づいて、ファイル内のどの部分をどのように変更するかを特定し、編集を実行することです。

以下の手順に従ってください。

1. ユーザーの指示（またはフィードバック）、提供されたファイル内容（または前回の提案内容）、そして会話履歴を注意深く読み取ります。
2. 変更したい箇所や内容を特定します。
    * **曖昧な指示への対応:** 会話履歴や文脈に基づいた具体的な変更案を複数提示することを試みてください。
    * **編集範囲:** 部分編集を基本とします。全体書き換えはユーザーが明確に意図している場合のみ検討します。
3. **編集タイプの判断と応答形式の選択:** ユーザー指示/フィードバックと編集対象、会話履歴から、以下のいずれかの編集タイプに該当するか判断し、指定されたJSON形式で**必ず**応答してください。

    * **A) 単一の部分編集 (`success`):** 特定の一箇所のみを変更する場合。`old_string` (文脈付き) が編集対象内で**正確に1回だけ**出現することを確認してください。
        ```json
        {{{{
          "status": "success",
          "old_string": "{{実際の変更前文字列}}",
          "new_string": "{{実際の変更後文字列}}"
        }}}}
        ```
    * **B) 複数の部分編集 (`multiple_edits`):** 複数の箇所を一度に変更する場合。各編集箇所の `old_string` が編集対象内で**正確に1回だけ**出現し、かつ編集箇所同士が**重複しない**ことを確認してください。
        ```json
        {{{{
          "status": "multiple_edits",
          "edits": [
            {{{{ "old_string": "{{変更箇所1の前}}", "new_string": "{{変更箇所1の後}}" }}}},
            // ... 他の編集箇所
          ]
        }}}}
        ```
    * **C) 全体置換 (`replace_all`):** 文章量の大幅な拡張、全面的な書き換え、全体的なトーン変更など、編集対象全体の内容を新しいものに置き換える場合。**ユーザーが明確に全体変更を意図しており、部分置換が困難な場合、またはフィードバックの結果として全体を修正する場合のみ**使用してください。
        ```json
        {{{{
          "status": "replace_all",
          "content": "{{新しいファイル内容全体}}"
        }}}}
        ```
    * **D) 要確認/情報不足 (`clarification_needed`):** 指示/フィードバックが曖昧、`old_string` が見つからない/一意でない/重複する、どの編集タイプにも当てはまらない、フィードバックに対して更に質問が必要な場合。具体的な質問や提案を含めてください。
        ```json
        {{{{
          "status": "clarification_needed",
          "message": "{{具体的な質問メッセージ}}"
        }}}}
        ```
    * **E) 会話/質問応答 (`conversation`):** ユーザーの入力が編集指示やフィードバックではなく、単なる会話やファイル内容に関する質問の場合。
        ```json
        {{{{
          "status": "conversation",
          "message": "{{会話応答メッセージ}}"
        }}}}
        ```
    * **F) 拒否 (`rejected`):** 指示/フィードバックが危険、不適切、または実行不可能な場合。
        ```json
        {{{{
          "status": "rejected",
          "message": "{{拒否理由メッセージ}}"
        }}}}
        ```

**注意点:**
* `old_string` は、変更箇所を一意に特定できる十分な文脈を含めてください。
* `multiple_edits` の場合、各 `old_string` は一意であり、編集箇所が重ならないようにしてください。
* フィードバックに対しては、その内容を最優先で考慮し、提案を修正または具体化してください。

必ず上記のいずれかのJSON形式で応答してください。
"""

# --- 型定義 ---
Message = Dict[str, str]
ConversationHistory = List[Message]
AiResponse = Dict[str, Any]

# --- OpenAI API 呼び出し関数 ---
def get_openai_response_api(
    current_file_content: str,
    latest_user_content: str,
    history: ConversationHistory,
    is_feedback: bool,
    previous_proposal: Optional[AiResponse]
) -> AiResponse:
    """OpenAI APIを呼び出し、編集指示を解析する (APIバージョン)"""
    if not client:
        print("エラー: OpenAIクライアントが初期化されていません。")
        return {"status": "error", "message": "バックエンド設定エラー: OpenAIクライアント未初期化"}

    messages: ConversationHistory = [
        {"role": "system", "content": SYSTEM_PROMPT_TEMPLATE}
    ]
    # history を追加 (アシスタントの応答が文字列化されたJSONの場合、パースしてdictにする)
    processed_history = []
    for msg in history:
        if msg.get("role") == "assistant" and isinstance(msg.get("content"), str):
            try:
                # 応答がJSON文字列として保存されている場合、辞書に戻す
                content_dict = json.loads(msg["content"])
                processed_history.append({"role": "assistant", "content": json.dumps(content_dict, ensure_ascii=False)}) # APIにはJSON文字列として渡す
            except json.JSONDecodeError:
                # JSONでなければそのまま文字列として扱う（会話メッセージなど）
                 processed_history.append({"role": "assistant", "content": msg["content"]})
        else:
            processed_history.append(msg)
    messages.extend(processed_history)


    last_user_message_combined = ""
    if is_feedback and previous_proposal:
        prev_status = previous_proposal.get("status")
        editable_previous_content = None

        if prev_status == "replace_all":
             editable_previous_content = previous_proposal.get("content")
        elif prev_status == "success":
             # フィードバック対象として、変更前後の情報を与える
             old_str = previous_proposal.get("old_string", "")
             new_str = previous_proposal.get("new_string", "")
             editable_previous_content = f"変更前:\n```\n{old_str}\n```\n変更後:\n```\n{new_str}\n```"
             # さらに会話履歴の参照も促す

        if editable_previous_content is not None and isinstance(editable_previous_content, str):
            last_user_message_combined = f"""
## 【前回の提案内容 (編集対象)】:
---
{editable_previous_content}
---
## 【上記提案に対するフィードバック】: {latest_user_content}

会話履歴（特に直前のassistantメッセージの提案JSON）と上記のフィードバックに基づき、**【前回の提案内容 (編集対象)】を修正**して、新しい提案をJSON形式で応答してください。(元の提案形式: {prev_status})
"""
        else: # multiple_edits や、上記以外の場合 (対象は現在のファイル内容)
            last_user_message_combined = f"""
## 【現在のファイル内容】:
---
{current_file_content}
---
## 【前回の提案 (履歴参照)】: {prev_status} 提案 (詳細は会話履歴の直前のassistantメッセージを確認してください)
## 【上記提案に対するフィードバック】: {latest_user_content}

会話履歴（特に直前のAI提案JSON）と上記のフィードバックに基づき、**【現在のファイル内容】を編集**して、新しい提案をJSON形式で応答してください。
"""
    else: # 通常の指示の場合
        last_user_message_combined = f"""
## 【現在のファイル内容】:
---
{current_file_content}
---
## 【ユーザー指示】: {latest_user_content}

会話履歴も踏まえ、上記の指示に基づいて、JSON形式で応答してください。
"""

    messages.append({"role": "user", "content": last_user_message_combined})

    try:
        # print("--- Sending request to OpenAI ---")
        # print(json.dumps(messages, indent=2, ensure_ascii=False))
        # print("---------------------------------")

        response = client.chat.completions.create(
            model=MODEL,
            messages=messages, # type: ignore
            response_format={"type": "json_object"},
            temperature=0.5, # 少し創造性を抑える
        )
        response_content = response.choices[0].message.content

        # print(f"--- Received response content ---\n{response_content}\n-------------------------------")

        if response_content:
            # 応答が Markdown コードブロックで囲まれている場合があるため除去
            processed_content = response_content.strip()
            if processed_content.startswith("```json"):
                 processed_content = processed_content[7:]
                 if processed_content.endswith("```"):
                     processed_content = processed_content[:-3]
            elif processed_content.startswith("```"):
                 processed_content = processed_content[3:]
                 if processed_content.endswith("```"):
                      processed_content = processed_content[:-3]
            processed_content = processed_content.strip()

            try:
                parsed_json: AiResponse = json.loads(processed_content)
                if isinstance(parsed_json, dict) and parsed_json.get("status"):
                    # 成功: パースされたJSONを返す
                    # print(f"--- Parsed AI Response ---\n{json.dumps(parsed_json, indent=2, ensure_ascii=False)}\n--------------------------")
                    return parsed_json
                else:
                    print(f"エラー: AI応答JSONの形式が不正です。'status' がないか、辞書ではありません。 Content: {processed_content}")
                    # 不正な形式でも、とりあえずそのまま返してフロントで処理させるか検討
                    # return {"status": "error", "message": "AIからの応答形式が不正です (status/dict)"}
                    # 一旦、会話として返すことを試みる
                    return {"status": "conversation", "message": f"AIからの応答を解析できませんでした:\n```\n{processed_content}\n```"}

            except json.JSONDecodeError as e:
                print(f"エラー: OpenAIからの応答JSONの解析に失敗しました: {e}")
                print(f"受信内容(加工後): {processed_content}")
                # 解析失敗の場合も会話として返す
                return {"status": "conversation", "message": f"AIからの応答を解析できませんでした(JSONDecodeError):\n```\n{processed_content}\n```"}
        else:
            print("エラー: OpenAIからの応答が空です。")
            return {"status": "error", "message": "AIからの応答が空です。"}

    except RateLimitError as e:
        print(f"エラー: OpenAI API Rate Limit を超過しました: {e}")
        return {"status": "error", "message": "リクエストが集中しています。しばらくしてから再試行してください。"}
    except APIConnectionError as e:
        print(f"エラー: OpenAI API への接続に失敗しました: {e}")
        return {"status": "error", "message": "AIサービスへの接続に失敗しました。ネットワークを確認するか、時間をおいてください。"}
    except APIError as e:
        print(f"エラー: OpenAI APIエラーが発生しました: Status={e.status_code}, Response={e.response}")
        return {"status": "error", "message": f"AIサービスでエラーが発生しました (Code: {e.status_code})。"}
    except Exception as e:
        print(f"エラー: OpenAI APIの呼び出し中に予期せぬエラーが発生しました: {e}")
        traceback.print_exc()
        return {"status": "error", "message": f"AIの処理中に予期せぬエラーが発生しました: {e}"}


# --- Firebase Functions HTTP Trigger ---
@https_fn.on_request(
    cors=options.CorsOptions(
        cors_origins=["*"], # VercelデプロイURLやローカル開発URLに制限することを推奨
        cors_methods=["post", "options"] # OPTIONSメソッドを許可
    )
)
def edit(req: https_fn.Request) -> https_fn.Response:
    """
    HTTP POSTリクエストを受け取り、LLMによる編集提案を返すAPIエンドポイント。
    """
    # CORS preflight request の処理 (corsオプションで自動処理されるはずだが念のため)
    if req.method == "OPTIONS":
        # CORSヘッダーは options.CorsOptions で設定されたものが自動で付与される
        return https_fn.Response(status=204, headers={"Access-Control-Allow-Origin": "*"}) # 暫定的に*

    # POST以外は拒否
    if req.method != "POST":
        return https_fn.Response("Method Not Allowed", status=405)

    # OpenAIクライアントが初期化失敗している場合はエラー
    if not client:
         return https_fn.Response(
             json.dumps({"status": "error", "message": "バックエンド設定エラー: OpenAIクライアント未初期化"}),
             status=500,
             mimetype="application/json; charset=utf-8"
         )

    try:
        request_json = req.get_json(silent=True)
        if not request_json:
            print("エラー: リクエストボディがJSON形式でないか、空です。")
            return https_fn.Response(
                json.dumps({"status": "error", "message": "リクエストボディがJSON形式でないか、空です。"}),
                status=400,
                mimetype="application/json; charset=utf-8"
             )

        # 必須パラメータのチェックと型の検証
        required_keys = {
            "current_file_content": str,
            "latest_user_content": str,
            "history": list,
            "is_feedback": bool
            # "previous_proposal": dict # is_feedback=trueの場合のみチェック (null許容)
        }
        missing_keys = [key for key in required_keys if key not in request_json]
        if missing_keys:
             print(f"エラー: 必須パラメータ不足: {missing_keys}")
             return https_fn.Response(
                 json.dumps({"status": "error", "message": f"必須パラメータが不足しています: {', '.join(missing_keys)}"}),
                 status=400,
                 mimetype="application/json; charset=utf-8"
             )

        type_errors = []
        for key, expected_type in required_keys.items():
            if not isinstance(request_json[key], expected_type):
                type_errors.append(f"'{key}' は {expected_type.__name__} である必要があります (現在: {type(request_json[key]).__name__})")

        is_feedback = request_json["is_feedback"]
        previous_proposal = request_json.get("previous_proposal") # null も許容

        if is_feedback and previous_proposal is not None and not isinstance(previous_proposal, dict):
             type_errors.append(f"'previous_proposal' は dict または null である必要があります (現在: {type(previous_proposal).__name__})")

        if type_errors:
            print(f"エラー: パラメータ型不正: {type_errors}")
            return https_fn.Response(
                json.dumps({"status": "error", "message": f"リクエストパラメータの型が不正です: {'; '.join(type_errors)}"}),
                status=400,
                mimetype="application/json; charset=utf-8"
            )

        # OpenAI API呼び出し
        ai_response = get_openai_response_api(
            current_file_content=request_json["current_file_content"],
            latest_user_content=request_json["latest_user_content"],
            history=request_json["history"],
            is_feedback=is_feedback,
            previous_proposal=previous_proposal
        )

        # AIからの応答をクライアントに返す
        return https_fn.Response(
            json.dumps(ai_response, ensure_ascii=False),
            status=200,
            mimetype="application/json; charset=utf-8"
        )

    except Exception as e:
        print(f"予期せぬエラーが発生しました: {e}")
        traceback.print_exc()
        # クライアントには一般的なエラーメッセージを返す
        return https_fn.Response(
            json.dumps({"status": "error", "message": "サーバー内部で予期せぬエラーが発生しました。"}),
            status=500,
            mimetype="application/json; charset=utf-8"
        )
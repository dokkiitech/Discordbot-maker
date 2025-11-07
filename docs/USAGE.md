# DiscordBot-Maker 使い方ガイド

このガイドでは、DiscordBot-Makerを使用してDiscord Botを作成する方法を説明します。

## 基本的な流れ

1. GitHubでログイン
2. リポジトリ設定
3. APIプロファイル設定（オプション）
4. スラッシュコマンド定義
5. 生成とデプロイ

---

## ステップ1: GitHubでログイン

1. トップページの「GitHubでログインして始める」ボタンをクリック
2. GitHubの認証画面で「Authorize」をクリック
3. ダッシュボードにリダイレクトされます

---

## ステップ2: リポジトリとBot設定

### リポジトリ設定

- **リポジトリ名**: GitHubに作成するリポジトリの名前（例: `my-discord-bot`）
- **ブランチ名**: コミット先のブランチ（デフォルト: `main`）
- **リポジトリの説明**: リポジトリの説明文（オプション）
- **プライベートリポジトリ**: チェックを入れるとプライベートリポジトリとして作成

### Bot設定

- **Bot名**: Discord Botの名前（例: `天気予報Bot`）
- **Botの説明**: Botの説明文（オプション）
- **Application ID**: Discord Developer Portalから取得（オプション）
- **Public Key**: Discord Developer Portalから取得（オプション）

> **注意**: Application IDとPublic Keyは後から設定することも可能です

---

## ステップ3: APIプロファイル設定

外部APIを利用する場合は、APIプロファイルを追加します。

### APIプロファイルの追加

1. 「APIプロファイルを追加」ボタンをクリック
2. 以下の情報を入力:
   - **プロファイル名**: 識別用の名前（例: `WeatherAPI`）
   - **ベースURL**: APIのルートURL（例: `https://api.openweathermap.org/data/2.5/`）
   - **認証方式**: 以下から選択
     - 認証なし
     - APIキー（クエリパラメータ）
     - APIキー（ヘッダー）
     - Bearer Token
   - **APIキー/トークン**: 実際の認証情報
   - **キー名/ヘッダー名**: パラメータ名またはヘッダー名（例: `api_key` or `X-API-Key`）

### 認証方式の詳細

#### APIキー（クエリパラメータ）
URLのクエリパラメータとしてAPIキーを送信
- 例: `https://api.example.com/weather?api_key=YOUR_KEY`

#### APIキー（ヘッダー）
HTTPヘッダーとしてAPIキーを送信
- 例: `X-API-Key: YOUR_KEY`

#### Bearer Token
Authorization ヘッダーとしてトークンを送信
- 例: `Authorization: Bearer YOUR_TOKEN`

### 環境変数の自動生成

APIプロファイルを追加すると、以下の環境変数が自動的に割り当てられます:
- `BOT_API_KEY_01`, `BOT_API_KEY_02`, ... （APIキー用）
- `BOT_BASE_URL_01`, `BOT_BASE_URL_02`, ... （ベースURL用）

---

## ステップ4: スラッシュコマンド定義

Botが応答するスラッシュコマンドを定義します。

### コマンドの追加

1. 「コマンドを追加」ボタンをクリック
2. 以下の情報を入力:
   - **コマンド名**: スラッシュコマンド名（例: `weather`）
     - 小文字、数字、ハイフン、アンダースコアのみ使用可能
   - **説明**: Discordで表示される説明（100文字以内）
   - **応答タイプ**: 「静的テキスト」または「API利用」

### 静的テキスト応答

固定のテキストを返すコマンド

**例**: `/hello` コマンド
- コマンド名: `hello`
- 説明: `挨拶を返します`
- 応答タイプ: 静的テキスト
- 応答テキスト: `こんにちは！元気ですか？`

### API利用応答

外部APIを呼び出して結果を返すコマンド

**例**: `/weather` コマンド
- コマンド名: `weather`
- 説明: `天気情報を取得します`
- 応答タイプ: API利用
- 使用するAPIプロファイル: `WeatherAPI`
- APIエンドポイント: `weather?q=Tokyo`
- カスタムロジック（オプション）:
  ```javascript
  const data = await apiResponse.json();
  return {
    content: `現在の気温: ${data.main.temp}°C\n天気: ${data.weather[0].description}`
  };
  ```

### カスタムロジックの記述

カスタムロジックでは、以下の変数が利用可能です:
- `apiResponse`: Fetch APIのResponseオブジェクト
- `interaction`: Discord Interactionオブジェクト

戻り値は、Discord応答の`data`フィールドに設定されます。

**基本的な例**:
```javascript
const data = await apiResponse.json();
return {
  content: `結果: ${data.result}`
};
```

**エンベッド（埋め込み）を使った例**:
```javascript
const data = await apiResponse.json();
return {
  embeds: [{
    title: "天気情報",
    description: `気温: ${data.main.temp}°C`,
    color: 0x00ff00
  }]
};
```

---

## ステップ5: 確認と生成

### 設定の確認

最終確認画面で、これまでの設定内容を確認します:
- リポジトリ設定
- Bot設定
- APIプロファイル
- スラッシュコマンド

### コード生成とコミット

1. 「生成してコミット」ボタンをクリック
2. 処理が完了するまで待つ（通常1分以内）
3. 生成完了画面が表示されます

### 環境変数の設定

生成完了後、環境変数設定手順が表示されます。

#### コピーする
「コピー」ボタンをクリックして、環境変数をクリップボードにコピー

#### ダウンロードする
- 「.envダウンロード」: `.env.example` ファイルをダウンロード
- 「.dev.varsダウンロード」: Wrangler用の `.dev.vars` ファイルをダウンロード

---

## Discord Botのデプロイ

生成されたコードをCloudflare Workersにデプロイする手順:

### 1. リポジトリをクローン

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 2. 依存関係をインストール

```bash
npm install
```

### 3. 環境変数を設定

Cloudflare Workers用に環境変数を設定:

```bash
# Discord設定
wrangler secret put DISCORD_PUBLIC_KEY

# APIキー（必要に応じて）
wrangler secret put BOT_API_KEY_01
```

または、`.dev.vars` ファイルを作成（ローカル開発用）:

```
DISCORD_PUBLIC_KEY=your_public_key
BOT_API_KEY_01=your_api_key
```

### 4. ローカルでテスト

```bash
npm run dev
```

### 5. デプロイ

```bash
npm run deploy
```

### 6. Discord Botの設定

1. [Discord Developer Portal](https://discord.com/developers/applications) にアクセス
2. あなたのアプリケーションを選択
3. "Bot" タブに移動
4. "Interactions Endpoint URL" に、デプロイしたWorkerのURLを設定
   - 例: `https://your-bot.your-subdomain.workers.dev`
5. "Save Changes" をクリック

---

## よくある質問

### Q: Application IDとPublic Keyはどこで取得できますか？

A: [Discord Developer Portal](https://discord.com/developers/applications)で、
あなたのアプリケーションを選択し、"General Information" ページで確認できます。

### Q: 生成されたBotにコマンドを追加できますか？

A: はい。生成されたコードを編集してコマンドを追加できます。
`src/index.ts` を編集して、新しいコマンドハンドラーを追加してください。

### Q: 環境変数を間違えて設定しました。修正方法は？

A: `wrangler secret put` コマンドを再度実行して上書きできます。

### Q: 生成されたBotが動作しません

A: 以下を確認してください:
1. 環境変数が正しく設定されているか
2. Discord Developer PortalのInteractions Endpoint URLが正しいか
3. Cloudflare Workersのログを確認（`wrangler tail` コマンド）

---

## サンプルレシピ

### 簡単な挨拶Bot

1. コマンド: `/hello`
2. 応答タイプ: 静的テキスト
3. 応答テキスト: `こんにちは！👋`

### 天気予報Bot（OpenWeatherMap API使用）

1. APIプロファイル:
   - 名前: WeatherAPI
   - ベースURL: `https://api.openweathermap.org/data/2.5/`
   - 認証: APIキー（クエリパラメータ）
   - キー名: `appid`

2. コマンド: `/weather`
   - 応答タイプ: API利用
   - エンドポイント: `weather?q=Tokyo&units=metric`
   - カスタムロジック:
     ```javascript
     const data = await apiResponse.json();
     return {
       embeds: [{
         title: `${data.name}の天気`,
         description: `${data.weather[0].description}`,
         fields: [
           { name: "気温", value: `${data.main.temp}°C`, inline: true },
           { name: "湿度", value: `${data.main.humidity}%`, inline: true }
         ],
         color: 0x3498db
       }]
     };
     ```

### 翻訳Bot（DeepL API使用）

1. APIプロファイル:
   - 名前: DeepLAPI
   - ベースURL: `https://api-free.deepl.com/v2/`
   - 認証: APIキー（ヘッダー）
   - ヘッダー名: `Authorization`
   - 値: `DeepL-Auth-Key YOUR_KEY`

2. コマンド: `/translate`
   - 応答タイプ: API利用
   - エンドポイント: `translate?text=Hello&target_lang=JA`
   - カスタムロジック:
     ```javascript
     const data = await apiResponse.json();
     return {
       content: `翻訳結果: ${data.translations[0].text}`
     };
     ```

---

## 次のステップ

- 生成されたコードをカスタマイズ
- より高度なコマンドを追加
- データベース連携を実装
- エラーハンドリングを強化

サポートが必要な場合は、[GitHubのIssue](https://github.com/yourusername/discordbot-maker/issues)で質問してください！

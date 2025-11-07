# DiscordBot-Maker セットアップガイド

## 前提条件

- Node.js 18.x 以降
- GitHub アカウント
- Firebase プロジェクト
- npm または yarn

## 1. プロジェクトのセットアップ

### リポジトリのクローン

```bash
git clone https://github.com/yourusername/discordbot-maker.git
cd discordbot-maker
```

### 依存関係のインストール

```bash
npm install
```

## 2. GitHub OAuth Appの作成

1. [GitHub Settings](https://github.com/settings/developers) にアクセス
2. "OAuth Apps" → "New OAuth App" をクリック
3. 以下の情報を入力:
   - **Application name**: DiscordBot-Maker (任意)
   - **Homepage URL**: `http://localhost:3000` (開発環境) または本番環境のURL
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback`
4. "Register application" をクリック
5. **Client ID** と **Client Secret** を控えておく

## 3. Firebase プロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. "プロジェクトを追加" をクリック
3. プロジェクト名を入力して作成
4. Firestore Database を有効化:
   - "ビルド" → "Firestore Database" → "データベースを作成"
   - テストモードで開始（後で本番モードに変更可能）
5. プロジェクト設定から以下の情報を取得:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID

## 4. 環境変数の設定

`.env.example` を `.env.local` にコピー:

```bash
cp .env.example .env.local
```

`.env.local` を編集して、以下の値を設定:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/callback

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key_here

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### NEXTAUTH_SECRET の生成

ランダムな文字列を生成:

```bash
openssl rand -base64 32
```

## 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

## 6. 本番環境へのデプロイ (Vercel)

### Vercelへのデプロイ

1. [Vercel](https://vercel.com) にアクセスしてログイン
2. "New Project" をクリック
3. GitHubリポジトリを選択
4. 環境変数を設定:
   - すべての `.env.local` の内容をコピー
   - `NEXTAUTH_URL` を本番環境のURLに変更 (例: `https://your-app.vercel.app`)
   - `GITHUB_REDIRECT_URI` も本番環境のURLに変更
5. "Deploy" をクリック

### GitHub OAuth Appの本番環境設定

1. GitHub OAuth Appの設定に戻る
2. "Authorization callback URL" に本番環境のコールバックURLを追加:
   - `https://your-app.vercel.app/api/auth/callback`

## トラブルシューティング

### GitHub OAuth認証が失敗する

- `GITHUB_CLIENT_ID` と `GITHUB_CLIENT_SECRET` が正しいか確認
- GitHub OAuth AppのコールバックURLが正しいか確認
- ブラウザのクッキーが有効か確認

### Firebase接続エラー

- Firebase設定が正しいか確認
- Firestore Databaseが有効化されているか確認
- Firebase プロジェクトのセキュリティルールを確認

### デプロイ時のエラー

- すべての環境変数が設定されているか確認
- `npm run build` でローカルでビルドが成功するか確認
- Vercelのログを確認

## 次のステップ

セットアップが完了したら、[使い方ガイド](./USAGE.md) を参照してBotの作成を始めましょう！

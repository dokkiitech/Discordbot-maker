# DiscordBot-Maker

[![CI](https://github.com/dokkiitech/Discordbot-maker/actions/workflows/ci.yml/badge.svg)](https://github.com/dokkiitech/Discordbot-maker/actions/workflows/ci.yml)
[![Lint](https://github.com/dokkiitech/Discordbot-maker/actions/workflows/lint.yml/badge.svg)](https://github.com/dokkiitech/Discordbot-maker/actions/workflows/lint.yml)

Discord Botテンプレートメーカー - Webブラウザから簡単にDiscord Botを設計・生成し、GitHubにデプロイ

## 🚀 特徴

- **直感的なWeb UI**: ステップバイステップでBotを設定
- **外部API連携**: 複数のAPIプロファイルを管理
- **スラッシュコマンド**: 簡単にコマンドを定義
- **GitHub連携**: 生成したコードを自動的にリポジトリにコミット
- **Cloudflare Workers対応**: 生成されるBotはCloudflare Workersで動作

## 📋 必要要件

- Node.js 18.x 以降
- GitHub アカウント
- Firebase プロジェクト
- Discord Application (Bot作成時)

## 🛠️ セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/discordbot-maker.git
cd discordbot-maker
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.example` を `.env.local` にコピーして、必要な値を設定してください。

```bash
cp .env.example .env.local
```

#### GitHub OAuth App の作成

1. GitHub Settings > Developer settings > OAuth Apps
2. 新しいOAuth Appを作成
3. Authorization callback URL: `http://localhost:3000/api/auth/callback`
4. Client IDとClient Secretを `.env.local` に設定

#### Firebase プロジェクトの設定

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Firestore Databaseを有効化
3. プロジェクト設定から認証情報を取得し、`.env.local` に設定

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

## 📖 使い方

### ステップ1: GitHub認証

1. 「GitHubでログイン」ボタンをクリック
2. GitHubでアプリケーションを認可

### ステップ2: リポジトリ設定

- リポジトリ名を入力
- ブランチ名を設定（デフォルト: main）

### ステップ3: APIプロファイル設定

外部APIを利用する場合:

1. プロファイル名を入力（例: WeatherAPI）
2. ベースURLを設定
3. 認証方式を選択
4. APIキーを入力

### ステップ4: スラッシュコマンド定義

1. コマンド名と説明を入力
2. 応答タイプを選択（静的テキスト or API利用）
3. API利用の場合、エンドポイントとロジックを設定

### ステップ5: 生成とデプロイ

1. 設定を確認
2. 「生成してコミット」ボタンをクリック
3. 環境変数設定手順をコピー
4. GitHubリポジトリを確認

## 🏗️ プロジェクト構造

```
discordbot-maker/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Reactコンポーネント
│   ├── lib/              # ユーティリティ・ライブラリ
│   └── hooks/            # カスタムフック
├── templates/            # Discord Botテンプレート
└── public/               # 静的ファイル
```

## 🔧 技術スタック

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI Components**: Cloudscape Design System
- **Styling**: Tailwind CSS
- **Form Management**: React Hook Form + Zod
- **Database**: Firebase Firestore
- **Authentication**: GitHub OAuth
- **Deployment**: Vercel
- **Generated Bot**: Cloudflare Workers / discord.js
- **CI/CD**: GitHub Actions

## 🧪 開発

### コマンド一覧

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# ESLint実行
npm run lint

# TypeScript型チェック
npm run type-check
```

### CI/CD

このプロジェクトではGitHub Actionsを使用して、以下の自動チェックを実行しています:

- **ESLint**: コード品質チェック
- **TypeScript型チェック**: 型安全性の確認
- **ビルドテスト**: Next.jsビルドが成功することを確認
- **マルチNode.jsバージョンテスト**: Node.js 18.x, 20.x, 21.xでのテスト

Pull Requestを作成すると、これらのチェックが自動的に実行されます。

## 📝 ライセンス

MIT

## 🤝 コントリビューション

Issue、Pull Requestを歓迎します！

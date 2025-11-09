# DiscordBot-Maker

[![CI](https://github.com/dokkiitech/Discordbot-maker/actions/workflows/ci.yml/badge.svg)](https://github.com/dokkiitech/Discordbot-maker/actions/workflows/ci.yml)
[![Lint](https://github.com/dokkiitech/Discordbot-maker/actions/workflows/lint.yml/badge.svg)](https://github.com/dokkiitech/Discordbot-maker/actions/workflows/lint.yml)
[![Total Commits](https://img.shields.io/github/commit-activity/t/dokkiitech/Discordbot-maker)](https://github.com/dokkiitech/Discordbot-maker/commits)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**コードを書かずにDiscord Botを作成** - ビジュアルプログラミングとステップバイステップのガイドで、誰でも簡単にDiscord Botを設計・生成し、GitHubに即デプロイ

---

## 目次

- [プロジェクト概要](#-プロジェクト概要)
- [主要機能](#-主要機能)
- [クイックスタート](#-クイックスタート)
- [使い方](#-使い方)
- [Botテンプレート](#-botテンプレート)
- [アーキテクチャ](#️-アーキテクチャ)
- [技術スタック](#-技術スタック)
- [開発](#-開発)
- [デプロイ](#-デプロイ)
- [プロジェクト構造](#-プロジェクト構造)
- [コード生成の仕組み](#-コード生成の仕組み)
- [学習リソース](#-学習リソース)
- [コントリビューション](#-コントリビューション)
- [ライセンス](#-ライセンス)

---

## 🎯 プロジェクト概要

DiscordBot-Makerは、プログラミング知識がなくてもDiscord Botを作成できるWebアプリケーションです。ビジュアルエディター（React Flow）でコマンドフローをドラッグ&ドロップで設計し、外部APIと連携した高度なBotを数分で構築できます。

### 特徴

- **完全ノーコード**: プログラミング不要でDiscord Botを作成
- **ビジュアルエディター**: React Flowを使用した直感的なフロー設計
- **即座にデプロイ**: GitHub連携でワンクリックデプロイ
- **テンプレート豊富**: 6種類の即利用可能なBotテンプレート（全てAPIキー不要）
- **外部API連携**: 天気、翻訳、ニュースなど様々なAPIと連携可能
- **Cloudflare Workers対応**: サーバーレス環境で動作するコードを生成

### 主な用途

- **学習**: Discord Bot開発の基礎を学ぶ
- **プロトタイピング**: アイデアを素早く形にする
- **ノーコード開発**: コードを書かずにBotを作成
- **API統合**: 外部サービスとの連携Botを構築

---

## ✨ 主要機能

### 🎨 ビジュアルプログラミングエディター

- **React Flowベース**: ドラッグ&ドロップでコマンドフローを視覚的に設計
- **3種類のノード**:
  - **コマンドノード**: スラッシュコマンドを定義
  - **オプションノード**: コマンドの引数を設定
  - **レスポンスノード**: 静的テキストまたはAPI呼び出しレスポンス
- **リアルタイム同期**: ノード操作が即座にコマンド設定に反映

### ⚙️ 強力なBot設定機能

- **スラッシュコマンド対応**: Discord公式のスラッシュコマンドAPI準拠
- **外部API連携**: 複数のAPIプロファイルを管理
- **柔軟な認証方式**:
  - 認証なし
  - APIキー（クエリパラメータ/ヘッダー）
  - Bearer Token
- **フィールドマッピング**: APIレスポンスのJSONフィールドをDiscord応答に自動マッピング
- **カスタムフォーマット**: `{fieldPath}` 形式でレスポンステキストをカスタマイズ

### 🔗 シームレスなGitHub統合

- **GitHub OAuth認証**: 安全なアクセス権限管理
- **自動リポジトリ作成**: 存在しない場合は新規作成
- **ワンクリックコミット**: 生成したコードを自動的にGitHubにプッシュ
- **Tree API使用**: 複数ファイルを一度にコミット
- **環境変数管理**: `.env` / `.dev.vars` ファイルを自動生成

### 🎨 モダンなUI/UX

- **5ステップのガイド付きフロー**:
  1. テンプレート選択
  2. リポジトリ・Bot設定
  3. APIプロファイル設定
  4. コマンド定義（ビジュアルエディター）
  5. 確認・生成・デプロイ
- **Cloudscape Design System**: AWS公式デザインシステム採用
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応
- **ダークモード対応**: CSS変数による柔軟なテーマ管理

---

## 🚀 クイックスタート

### 必要要件

- **Node.js** 18.x 以降（推奨: 20.x）
- **GitHub アカウント**
- **Firebase プロジェクト**（Firestore有効化）
- **Discord Application**（Bot作成時に必要）

### インストール

```bash
# 1. リポジトリをクローン
git clone https://github.com/dokkiitech/Discordbot-maker.git
cd Discordbot-maker

# 2. 依存関係をインストール
npm install

# 3. 環境変数を設定
cp .env.example .env.local
# .env.local を編集して以下を設定

# 4. 開発サーバーを起動
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

### 環境変数の設定

`.env.local` に以下を設定:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/callback

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

<details>
<summary><strong>GitHub OAuth App の作成手順</strong></summary>

1. [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. 「New OAuth App」をクリック
3. 以下を入力:
   - **Application name**: 任意（例: DiscordBot-Maker Local）
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback`
4. 「Register application」をクリック
5. Client IDとClient Secretを `.env.local` に設定

</details>

<details>
<summary><strong>Firebase プロジェクトの設定手順</strong></summary>

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. 「Firestore Database」を有効化
3. プロジェクト設定（⚙️アイコン）→ 「アプリを追加」→ Web（`</>`）
4. アプリを登録して認証情報を取得
5. `.env.local` に設定

</details>

---

## 📖 使い方

### 基本フロー

#### 1. GitHub認証

トップページで「GitHubでログイン」をクリックし、リポジトリへのアクセス権限を付与します。

#### 2. テンプレート選択（Step 0）

6種類のテンプレートから選択、またはカスタムで一から作成:
- シンプル挨拶ボット
- ゲームボット
- 犬の画像ボット
- ジョークボット
- トリビアクイズボット
- GitHub情報ボット

#### 3. リポジトリ・Bot設定（Step 1）

- **リポジトリ情報**:
  - リポジトリ名（英数字・ハイフン・アンダースコアのみ）
  - ブランチ名（デフォルト: main）
  - 説明（オプション）
  - プライベート/パブリック選択

- **Bot情報**:
  - Bot名
  - 説明
  - Discord Application ID
  - Discord Public Key
  - Discord Bot Token

#### 4. APIプロファイル設定（Step 2）

外部APIを使用する場合に設定:
- API名
- ベースURL
- 認証タイプ（なし/APIキー/Bearer Token）
- 環境変数名の自動生成
- APIテスト機能でレスポンス検証

#### 5. コマンド定義（Step 3）

**ビジュアルエディター**でコマンドフローを設計:

1. コマンドを追加
2. オプション（引数）を定義
3. レスポンスタイプを選択:
   - **静的テキスト**: 固定のメッセージ
   - **API呼び出し**: 外部APIから動的に取得
4. フィールドマッピングを設定（API使用時）
5. フォーマット文字列で応答をカスタマイズ

**例**: GitHub情報ボット
```
コマンド: /githubuser
オプション: username (string, required)
API: https://api.github.com/users/{username}
フィールドマッピング:
  - login → "ユーザー名: {login}"
  - public_repos → "リポジトリ数: {public_repos}個"
```

#### 6. 確認・生成・デプロイ（Step 4）

- 全設定の最終確認
- 生成されるファイル一覧を表示
- 環境変数をコピー・ダウンロード
- 「生成してGitHubにデプロイ」ボタンをクリック

生成されるファイル:
- `src/index.ts` - Bot メインコード
- `wrangler.toml` - Cloudflare Workers設定
- `package.json` - 依存関係
- `README.md` - セットアップ手順
- `.env.example` - 環境変数テンプレート
- `.gitignore`

---

## 🤖 Botテンプレート

### 1. シンプル挨拶ボット
- **難易度**: 初心者
- **カテゴリ**: ユーティリティ
- **API**: 不要
- **コマンド**: `/hello`, `/ping`, `/greet`
- **説明**: Discord Botの基礎を学ぶ最もシンプルなテンプレート

### 2. ゲームボット
- **難易度**: 初心者
- **カテゴリ**: 娯楽
- **API**: 不要
- **コマンド**: `/dice`, `/coinflip`, `/rps`, `/8ball`
- **説明**: サイコロ、コイントス、じゃんけん、マジック8ボール

### 3. 犬の画像ボット
- **難易度**: 初心者
- **カテゴリ**: 娯楽
- **API**: Random Dog API（認証不要）
- **コマンド**: `/randomdog`
- **説明**: かわいい犬の画像をランダムに表示

### 4. ジョークボット
- **難易度**: 初心者
- **カテゴリ**: 娯楽
- **API**: Official Joke API（認証不要）
- **コマンド**: `/joke`, `/progjoke`
- **説明**: 一般的なジョークとプログラミングジョークを表示

### 5. トリビアクイズボット
- **難易度**: 初心者
- **カテゴリ**: 娯楽
- **API**: Open Trivia Database（認証不要）
- **コマンド**: `/trivia`
- **説明**: ランダムなトリビアクイズを出題

### 6. GitHub情報ボット
- **難易度**: 初心者
- **カテゴリ**: 情報
- **API**: GitHub API（認証不要、レート制限あり）
- **コマンド**: `/githubuser`
- **説明**: GitHubユーザー情報を取得

**すべてのテンプレートはAPIキー不要で即利用可能です！**

---

## 🏗️ アーキテクチャ

### システム構成

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   ユーザー    │ ───▶ │  Next.js App  │ ───▶ │   GitHub    │
│  (ブラウザ)   │      │  (Vercel)     │      │    API      │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            │
                            ▼
                     ┌─────────────┐
                     │  Firebase   │
                     │  Firestore  │
                     └─────────────┘

生成されたBot:
┌─────────────┐      ┌──────────────────┐
│   Discord   │ ───▶ │ Cloudflare       │
│   Server    │      │ Workers (Bot)    │
└─────────────┘      └──────────────────┘
```

### データフロー

1. **認証**: GitHub OAuth → クッキーベースセッション
2. **設定**: フォームデータ → React Hook Form + Zod バリデーション
3. **ビジュアルエディター**: React Flow → コマンド定義JSON
4. **コード生成**: テンプレートエンジン → TypeScriptコード
5. **デプロイ**: GitHub Tree API → リポジトリにコミット

---

## 🔧 技術スタック

### フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| [Next.js](https://nextjs.org) | 14.2.18 | React フレームワーク（App Router） |
| [React](https://react.dev) | 18.3.1 | UIライブラリ |
| [TypeScript](https://www.typescriptlang.org) | 5.x | 型安全性 |
| [Tailwind CSS](https://tailwindcss.com) | 3.4.15 | ユーティリティファーストCSS |

### UIコンポーネント・デザイン

| ライブラリ | バージョン | 用途 |
|-----------|-----------|------|
| [@cloudscape-design/components](https://cloudscape.design) | 3.0.1128 | AWS公式デザインシステム |
| [@xyflow/react](https://reactflow.dev) | 12.9.2 | ビジュアルプログラミングエディター |
| [lucide-react](https://lucide.dev) | 0.553.0 | アイコンライブラリ |
| [react-icons](https://react-icons.github.io/react-icons/) | 5.5.0 | 追加アイコン |

### フォーム管理・バリデーション

| ライブラリ | バージョン | 用途 |
|-----------|-----------|------|
| [react-hook-form](https://react-hook-form.com) | 7.53.2 | 効率的なフォーム管理 |
| [zod](https://zod.dev) | 4.1.12 | TypeScript優先スキーマバリデーション |
| @hookform/resolvers | 3.9.1 | Zodとの統合 |

### バックエンド・データベース

| 技術 | バージョン | 用途 |
|------|-----------|------|
| [Firebase](https://firebase.google.com) | 12.5.0 | Firestore（NoSQL DB）、認証 |
| [@octokit/rest](https://octokit.github.io/rest.js/) | 22.0.1 | GitHub API クライアント |
| Next.js API Routes | ビルトイン | バックエンドAPI実装 |

### ファイル処理

| ライブラリ | バージョン | 用途 |
|-----------|-----------|------|
| [jszip](https://stuk.github.io/jszip/) | 3.10.1 | ZIP圧縮・解凍 |
| [file-saver](https://github.com/eligrey/FileSaver.js/) | 2.0.5 | ブラウザからファイルダウンロード |

### ユーティリティ

| ライブラリ | 用途 |
|-----------|------|
| [clsx](https://github.com/lukeed/clsx) | クラス名の条件付き結合 |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | Tailwindクラスの競合解決 |

### 開発ツール

| ツール | バージョン | 用途 |
|--------|-----------|------|
| ESLint | 8.x | コード品質チェック |
| @typescript-eslint/* | 8.46.3 | TypeScript用Lintルール |
| autoprefixer | 10.4.20 | CSSベンダープレフィックス自動付与 |

### デプロイメント・インフラ

| サービス | 用途 |
|---------|------|
| [Vercel](https://vercel.com) | Next.jsアプリケーションホスティング |
| [Cloudflare Workers](https://workers.cloudflare.com) | 生成されるBotの実行環境 |
| [GitHub Actions](https://github.com/features/actions) | CI/CDパイプライン |

---

## 🧪 開発

### 利用可能なコマンド

```bash
# 開発サーバーを起動（ホットリロード有効）
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバーを起動
npm start

# ESLintでコード品質チェック
npm run lint

# TypeScript型チェック
npm run type-check
```

### ディレクトリ構造

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx              # ランディングページ
│   ├── layout.tsx            # ルートレイアウト
│   ├── globals.css           # グローバルスタイル
│   ├── dashboard/
│   │   └── page.tsx          # メインダッシュボード（5ステップフォーム）
│   ├── help/                 # ヘルプページ
│   └── api/                  # APIルート
│       ├── auth/             # GitHub OAuth
│       ├── generate/         # Bot生成・GitHub連携
│       └── test-api/         # API テスト
│
├── components/               # Reactコンポーネント
│   ├── reactflow/            # ビジュアルエディター
│   │   ├── ReactFlowEditor.tsx
│   │   └── nodes/            # カスタムノード
│   ├── steps/                # ステップコンポーネント（Step0-Step4）
│   └── ui/                   # 共通UIコンポーネント
│
├── lib/                      # ビジネスロジック・ユーティリティ
│   ├── types.ts              # 型定義（Zodスキーマ）
│   ├── templates.ts          # Botテンプレート定義
│   ├── template-generator.ts # コード生成エンジン（1308行）
│   ├── code-generator.ts     # カスタムロジック生成
│   ├── reactflow-converter.ts # Commands ⟷ React Flow変換
│   ├── github.ts             # GitHub API ラッパー
│   ├── firebase.ts           # Firebase初期化
│   ├── zip-generator.ts      # ZIP圧縮ダウンロード
│   └── utils.ts              # ユーティリティ関数
│
├── hooks/                    # カスタムフック
│   └── useAuth.ts            # 認証フック
│
└── providers/
    └── ThemeProvider.tsx     # テーマプロバイダー
```

### CI/CD パイプライン

#### ✅ CI ワークフロー（`.github/workflows/ci.yml`）

```yaml
トリガー: push, pull_request
ジョブ:
  - quality: ESLint + TypeScript型チェック
  - build: Next.jsビルドテスト
  - test-matrix: Node.js 18.x, 20.x, 21.x でテスト
```

#### 🎨 Lint ワークフロー（`.github/workflows/lint.yml`）

```yaml
トリガー: push, pull_request
ジョブ:
  - lint: ESLintによるコード品質チェック
```

すべてのPull Requestで自動実行され、マージ前にコード品質を保証します。

### コーディング規約

- **TypeScript**: `strict` モード有効、`any` 型は最小限に
- **React**: 関数コンポーネント、カスタムフックで状態管理を分離
- **ファイル命名**: PascalCase（コンポーネント）、kebab-case（ユーティリティ）
- **コミットメッセージ**: `type: description` 形式（feat/fix/docs/refactor/test/chore）

---

## 🚢 デプロイ

### Vercel へのデプロイ（推奨）

#### 方法1: Vercel Dashboard

1. [Vercel](https://vercel.com) にログイン
2. 「New Project」→ GitHubリポジトリを選択
3. 環境変数を設定（`.env.local` の内容）
4. 「Deploy」をクリック

#### 方法2: Vercel CLI

```bash
# Vercel CLI をインストール
npm i -g vercel

# デプロイ
vercel

# 環境変数を設定
vercel env add GITHUB_CLIENT_ID
vercel env add GITHUB_CLIENT_SECRET
# ... その他の環境変数

# プロダクションデプロイ
vercel --prod
```

### 生成されたBotのデプロイ

生成されたBotコードは **Cloudflare Workers** で動作するように設計されています。

```bash
# 生成されたリポジトリで実行

# 1. 依存関係をインストール
npm install

# 2. 環境変数を設定
# .dev.vars ファイルをダウンロードして配置

# 3. ローカルでテスト
npm run dev

# 4. Cloudflare Workersにデプロイ
npm run deploy
# または
wrangler publish
```

---

## 📦 プロジェクト構造

### 主要ファイル

| ファイル | 行数 | 説明 |
|---------|------|------|
| `src/lib/template-generator.ts` | 1308 | Botコード生成エンジン（メイン） |
| `src/components/steps/Step3Commands.tsx` | 909 | ビジュアルエディターコンポーネント |
| `src/components/steps/Step4Review.tsx` | 472 | 確認・生成・デプロイ画面 |
| `src/lib/templates.ts` | 442 | 6種類のBotテンプレート定義 |
| `src/components/steps/Step1Repository.tsx` | 17KB | リポジトリ・Bot設定フォーム |
| `src/components/steps/Step2ApiProfiles.tsx` | 15KB | APIプロファイル管理 |

### 設定ファイル

```
プロジェクトルート/
├── package.json           # 依存関係・スクリプト
├── tsconfig.json          # TypeScript設定（strict mode）
├── tailwind.config.ts     # Tailwind CSS設定（カスタムカラー）
├── next.config.js         # Next.js設定（画像最適化等）
├── .eslintrc.json         # ESLint設定
├── .env.example           # 環境変数テンプレート
└── .gitignore
```

---

## 🔍 コード生成の仕組み

### テンプレートエンジン（`template-generator.ts`）

#### 1. デプロイメントタイプ分岐

```typescript
generateBotCode(botConfig, apiProfiles, commands)
├─ INTERACTIONS_ENDPOINT → Cloudflare Workers対応コード
└─ GATEWAY → discord.js Gateway対応コード（実験的）
```

#### 2. 生成されるファイル

| ファイル | 内容 |
|---------|------|
| `src/index.ts` | Bot メインコード（コマンドハンドラー、API呼び出しロジック） |
| `wrangler.toml` | Cloudflare Workers設定（環境変数、ルーティング） |
| `package.json` | 依存関係（discord.js, hono等） |
| `README.md` | セットアップ手順、コマンド一覧 |
| `.env.example` | 環境変数テンプレート |
| `.gitignore` | Git除外設定 |

#### 3. 環境変数の自動抽出

```typescript
環境変数:
├─ DISCORD_APPLICATION_ID
├─ DISCORD_PUBLIC_KEY
├─ DISCORD_BOT_TOKEN
├─ REGISTER_SECRET （コマンド登録用）
└─ {API_PROFILE_NAME}_API_KEY （APIごと）
```

#### 4. フィールドマッピング処理

```typescript
// 例: GitHub API
fieldMappings: [
  { fieldPath: 'login', formatString: 'ユーザー名: {login}' },
  { fieldPath: 'public_repos', formatString: 'リポジトリ: {public_repos}個' }
]

// 生成されるコード:
const login = response.login;
const public_repos = response.public_repos;
content += `ユーザー名: ${login}\n`;
content += `リポジトリ: ${public_repos}個\n`;
```

### React Flow ⟷ Commands 変換（`reactflow-converter.ts`）

```typescript
// Commands → React Flow ノード
commandsToReactFlow(commands)
├─ CommandNode (x=50)
├─ OptionNode (x=300, y += 100)
├─ ResponseNode (x=550)
└─ Edges (command → option → response)

// React Flow → Commands
reactFlowToCommands(nodes, edges)
├─ ノードからコマンド情報抽出
├─ エッジから依存関係抽出
└─ JSON形式に変換
```

---

## 🎓 学習リソース

このプロジェクトで学べる技術:

### フロントエンド
- **Next.js 14 App Router**: 最新のReactフレームワーク
- **React Flow**: ビジュアルエディターの実装
- **TypeScript**: 大規模アプリケーションの型安全性
- **Tailwind CSS**: ユーティリティファーストCSS
- **React Hook Form + Zod**: 効率的なフォーム管理とバリデーション

### バックエンド・API
- **GitHub OAuth 2.0**: 認証フロー実装
- **GitHub API**: リポジトリ操作、ファイルコミット
- **Next.js API Routes**: サーバーサイドAPI実装
- **Firebase Firestore**: NoSQLデータベース連携

### DevOps・CI/CD
- **GitHub Actions**: 自動テスト、Lint、ビルド
- **Vercel**: Next.jsアプリケーションのデプロイ
- **環境変数管理**: セキュアな認証情報管理

### アーキテクチャ・設計
- **コード生成**: テンプレートエンジンの設計
- **モジュール化**: 責務分離とコンポーネント設計
- **状態管理**: React Hooksによる効率的な状態管理

### 関連ドキュメント

- [Next.js Documentation](https://nextjs.org/docs)
- [React Flow Documentation](https://reactflow.dev)
- [Cloudscape Design System](https://cloudscape.design)
- [Discord.js Guide](https://discordjs.guide)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [GitHub API Reference](https://docs.github.com/en/rest)

---

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

### 貢献方法

1. このリポジトリをフォーク
2. 新しいブランチを作成
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. 変更をコミット
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
4. ブランチにプッシュ
   ```bash
   git push origin feature/amazing-feature
   ```
5. Pull Requestを作成

### コミットメッセージ規約

```
type: description

types:
  - feat: 新機能
  - fix: バグ修正
  - docs: ドキュメント変更
  - refactor: リファクタリング
  - test: テスト追加・修正
  - chore: ビルド・設定変更
```

### 開発ガイドライン

- TypeScript型定義を明示的に記述
- ESLintルールに従う（`npm run lint`）
- 型チェックを通す（`npm run type-check`）
- コンポーネントは関数コンポーネントで実装
- カスタムフックで状態管理を分離

### 報告・提案

- **バグ報告**: [Issues](https://github.com/dokkiitech/Discordbot-maker/issues)
- **機能提案**: [Discussions](https://github.com/dokkiitech/Discordbot-maker/discussions)
- **セキュリティ報告**: security@dokkiitech.com（非公開）

---

## 📊 プロジェクト統計

| 項目 | 数値 |
|------|------|
| TypeScript/TSXファイル数 | 41 |
| ソースコード総サイズ | 363KB |
| パッケージ依存関係 | 17個 |
| 開発依存関係 | 12個 |
| Reactコンポーネント | 17個 |
| APIエンドポイント | 6個 |
| Botテンプレート | 6種類 |
| CI/CDワークフロー | 2個 |

---

## 📝 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

```
MIT License

Copyright (c) 2024 dokkiitech

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 🔗 関連リンク

### プロジェクト

- **リポジトリ**: [github.com/dokkiitech/Discordbot-maker](https://github.com/dokkiitech/Discordbot-maker)
- **Issue Tracker**: [Issues](https://github.com/dokkiitech/Discordbot-maker/issues)
- **Discussions**: [Discussions](https://github.com/dokkiitech/Discordbot-maker/discussions)

### 技術ドキュメント

- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [React Flow](https://reactflow.dev)
- [Cloudscape Design](https://cloudscape.design)
- [Discord Developer Portal](https://discord.com/developers/docs)
- [Cloudflare Workers](https://workers.cloudflare.com)

---

## 🙏 謝辞

このプロジェクトは以下のOSS技術に支えられています:

- [Next.js](https://nextjs.org) - Vercel
- [React Flow](https://reactflow.dev) - webkid
- [Cloudscape Design](https://cloudscape.design) - AWS
- [Firebase](https://firebase.google.com) - Google
- そして多くの素晴らしいOSSコントリビューター

---

## 📮 お問い合わせ

質問・フィードバック・サポートが必要な場合:

- **GitHub Issues**: [新しいIssueを作成](https://github.com/dokkiitech/Discordbot-maker/issues/new)
- **Discussions**: [ディスカッションに参加](https://github.com/dokkiitech/Discordbot-maker/discussions)
- **Email**: support@dokkiitech.com

---

<p align="center">
  <strong>DiscordBot-Maker</strong> - コードを書かずにDiscord Botを作成<br>
  Made with ❤️ by <a href="https://github.com/dokkiitech">dokkiitech</a>
</p>

<p align="center">
  <a href="#-プロジェクト概要">トップに戻る ↑</a>
</p>

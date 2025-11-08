# DiscordBot-Maker

[![CI](https://github.com/dokkiitech/Discordbot-maker/actions/workflows/ci.yml/badge.svg)](https://github.com/dokkiitech/Discordbot-maker/actions/workflows/ci.yml)
[![Lint](https://github.com/dokkiitech/Discordbot-maker/actions/workflows/lint.yml/badge.svg)](https://github.com/dokkiitech/Discordbot-maker/actions/workflows/lint.yml)
[![Total Commits](https://img.shields.io/github/commit-activity/t/dokkiitech/Discordbot-maker)](https://github.com/dokkiitech/Discordbot-maker/commits)

**コードを書かずにDiscord Botを作成** - ビジュアルプログラミングとステップバイステップのガイドで、誰でも簡単にDiscord Botを設計・生成し、GitHubに即デプロイ

---

## 🎯 プロジェクト概要

DiscordBot-Makerは、プログラミング知識がなくてもDiscord Botを作成できるWebアプリケーションです。ビジュアルエディターでコマンドフローを設計し、外部APIと連携した高度なBotを数分で構築できます。

### 主な用途
- Discord Bot開発の学習ツール
- プロトタイピング・MVP作成
- ノーコード/ローコードBot開発
- API連携Botの迅速な構築

---

## ✨ 主要機能

### 🎨 ビジュアルプログラミング
- **React Flowベースのエディター**: ドラッグ&ドロップでコマンドフローを視覚的に設計
- **ノードベース設計**: コマンド、オプション、レスポンスをノードで表現
- **リアルタイムプレビュー**: フローの変更を即座に確認

### ⚙️ 強力なBot設定機能
- **スラッシュコマンド対応**: Discord公式のスラッシュコマンドを簡単に定義
- **外部API連携**: 複数のAPIプロファイルを管理し、動的なレスポンスを実現
- **柔軟な認証**: Bearer Token、API Key、カスタムヘッダーに対応

### 🔗 シームレスなGitHub統合
- **ワンクリックデプロイ**: 生成したBotコードを自動的にGitHubリポジトリにコミット
- **GitHub OAuth認証**: 安全なアクセスとリポジトリ管理
- **即座に実行可能**: Cloudflare Workers対応のコードを生成

### 🎨 モダンなUI/UX
- **ステップバイステップUI**: 初心者でも迷わない設定フロー
- **Cloudscape Design System**: AWSのデザインシステムを採用した洗練されたUI
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップに対応

---

## 🚀 クイックスタート

### 必要要件
- Node.js 18.x 以降
- GitHub アカウント
- Firebase プロジェクト（データベース用）
- Discord Application（Bot作成時）

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/dokkiitech/Discordbot-maker.git
cd discordbot-maker

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env.local
# .env.local を編集してGitHub OAuth、Firebase認証情報を設定

# 開発サーバーを起動
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

### 初期設定

<details>
<summary>GitHub OAuth App の作成</summary>

1. [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. 新しいOAuth Appを作成
3. Authorization callback URL: `http://localhost:3000/api/auth/callback`
4. Client IDとClient Secretを `.env.local` に設定
</details>

<details>
<summary>Firebase プロジェクトの設定</summary>

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Firestore Databaseを有効化
3. プロジェクト設定から認証情報を取得し、`.env.local` に設定
</details>

---

## 📖 使い方

### 1. GitHub認証
GitHubアカウントでログインし、リポジトリへのアクセス権限を付与

### 2. リポジトリ設定
Botコードをコミットするリポジトリとブランチを指定

### 3. APIプロファイル設定（オプション）
外部API（天気API、翻訳APIなど）を利用する場合、認証情報を登録

### 4. ビジュアルエディターでコマンド設計
- ドラッグ&ドロップでコマンドノードを配置
- オプション（引数）を定義
- レスポンス（返答）を設定
- APIエンドポイントと連携

### 5. 生成とデプロイ
ワンクリックでBotコードを生成し、GitHubリポジトリにコミット

---

## 🏗️ アーキテクチャ

```
discordbot-maker/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # APIルート（GitHub OAuth等）
│   │   ├── dashboard/            # ダッシュボードページ
│   │   └── page.tsx              # ホームページ
│   ├── components/
│   │   ├── reactflow/            # ビジュアルエディター
│   │   │   ├── ReactFlowEditor.tsx
│   │   │   └── nodes/            # カスタムノード
│   │   ├── steps/                # ステップコンポーネント
│   │   └── ui/                   # 共通UIコンポーネント
│   ├── lib/                      # ユーティリティ・ヘルパー
│   └── hooks/                    # カスタムフック
├── templates/                    # 生成されるBotテンプレート
└── public/                       # 静的アセット
```

---

## 🔧 技術スタック

### フロントエンド
| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Next.js** | 14.x | React フレームワーク（App Router） |
| **React** | 18.x | UIライブラリ |
| **TypeScript** | 5.x | 型安全性 |
| **Tailwind CSS** | 3.x | スタイリング |

### UIコンポーネント
| 技術 | 用途 |
|------|------|
| **Cloudscape Design** | メインUIコンポーネント（AWS公式） |
| **React Flow** | ビジュアルプログラミングエディター |
| **Lucide React** | アイコンライブラリ |

### フォーム管理・バリデーション
| 技術 | 用途 |
|------|------|
| **React Hook Form** | フォーム状態管理 |
| **Zod** | スキーマバリデーション |

### バックエンド・インフラ
| 技術 | 用途 |
|------|------|
| **Firebase Firestore** | NoSQLデータベース |
| **GitHub OAuth** | 認証 |
| **Octokit** | GitHub API連携 |
| **Vercel** | ホスティング |

### 生成されるBot
| 技術 | 用途 |
|------|------|
| **Cloudflare Workers** | サーバーレス実行環境 |
| **discord.js** | Discord Bot API |

### 開発ツール
| 技術 | 用途 |
|------|------|
| **ESLint** | コード品質チェック |
| **TypeScript** | 型チェック |
| **GitHub Actions** | CI/CD |

---

## 🧪 開発

### 利用可能なコマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバーを起動（localhost:3000） |
| `npm run build` | プロダクションビルド |
| `npm start` | プロダクションサーバーを起動 |
| `npm run lint` | ESLintでコード品質チェック |
| `npm run type-check` | TypeScriptの型チェック |

### CI/CD パイプライン

GitHub Actionsで以下のワークフローを自動実行:

#### ✅ CI ワークフロー
- **ビルドテスト**: Next.jsビルドの成功を検証
- **型チェック**: TypeScriptの型安全性を確認
- **マルチバージョンテスト**: Node.js 18.x, 20.x, 21.x で動作確認

#### 🎨 Lint ワークフロー
- **ESLint**: コード品質とスタイルガイドの遵守をチェック
- **自動修正**: 可能な問題は自動的に修正提案

すべてのPull Requestで自動的にチェックが実行され、マージ前に品質を保証します。

---

## 🎓 学習リソース

このプロジェクトで学べる技術:
- Next.js App Routerの実践的な使い方
- React Flowを使ったビジュアルエディターの実装
- GitHub OAuth認証の実装
- Firebaseとの連携
- TypeScriptでの大規模アプリケーション開発
- CI/CDパイプラインの構築

---

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

### 貢献方法
1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

### 報告・提案
- バグ報告: [Issues](https://github.com/dokkiitech/Discordbot-maker/issues)
- 機能提案: [Discussions](https://github.com/dokkiitech/Discordbot-maker/discussions)

---

## 📝 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

---

## 🔗 リンク

- **リポジトリ**: [github.com/dokkiitech/Discordbot-maker](https://github.com/dokkiitech/Discordbot-maker)
- **Issue Tracker**: [Issues](https://github.com/dokkiitech/Discordbot-maker/issues)
- **Discord.js Documentation**: [discord.js.org](https://discord.js.org)
- **Cloudflare Workers**: [workers.cloudflare.com](https://workers.cloudflare.com)

---

<p align="center">Made with ❤️ by dokkiitech</p>

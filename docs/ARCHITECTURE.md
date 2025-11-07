# アーキテクチャドキュメント

## システム概要

DiscordBot-Makerは、Webブラウザから Discord Botを設計・生成し、GitHubリポジトリに自動デプロイするためのテンプレートメーカーです。

## アーキテクチャ図

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Next.js Application (Vercel)       │
│  ┌───────────────────────────────┐  │
│  │  Frontend (React)             │  │
│  │  - Landing Page               │  │
│  │  - Dashboard                  │  │
│  │  - Step Components            │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  API Routes                   │  │
│  │  - /api/auth/*                │  │
│  │  - /api/generate              │  │
│  └───────────────────────────────┘  │
└─────────┬───────────────┬───────────┘
          │               │
          ▼               ▼
  ┌───────────────┐  ┌──────────────┐
  │  GitHub API   │  │  Firebase    │
  │  - OAuth      │  │  - Firestore │
  │  - Repos      │  │              │
  └───────────────┘  └──────────────┘
```

## 主要コンポーネント

### 1. Frontend Layer

**責務**: ユーザーインターフェースと状態管理

#### コンポーネント構成

```
src/
├── app/
│   ├── page.tsx              # ランディングページ
│   ├── dashboard/
│   │   └── page.tsx          # メインダッシュボード
│   └── api/                  # API Routes
│
├── components/
│   ├── ui/                   # 共通UIコンポーネント
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Textarea.tsx
│   │   └── Card.tsx
│   └── steps/                # ステップ別コンポーネント
│       ├── StepIndicator.tsx
│       ├── Step1Repository.tsx
│       ├── Step2ApiProfiles.tsx
│       ├── Step3Commands.tsx
│       └── Step4Review.tsx
│
└── hooks/
    └── useAuth.ts            # 認証フック
```

#### 状態管理

各ステップのフォームデータは、`dashboard/page.tsx`でReactのuseStateを使用して管理:

- `repositoryConfig`: リポジトリ設定
- `botConfig`: Bot設定
- `apiProfiles`: APIプロファイル配列
- `commands`: スラッシュコマンド配列

### 2. Backend Layer (API Routes)

**責務**: ビジネスロジック、外部API連携

#### API エンドポイント

| エンドポイント | メソッド | 説明 |
|-------------|---------|------|
| `/api/auth/github` | GET | GitHub OAuth開始 |
| `/api/auth/callback` | GET | OAuth コールバック |
| `/api/auth/logout` | POST | ログアウト |
| `/api/auth/me` | GET | 現在のユーザー情報取得 |
| `/api/generate` | POST | コード生成とGitHubコミット |

#### 処理フロー: コード生成

```
1. クライアントから設定データを受信
   └→ リポジトリ、Bot、APIプロファイル、コマンド

2. 認証チェック
   └→ クッキーからGitHubトークンを検証

3. バリデーション
   └→ 必須フィールドのチェック

4. コード生成 (template-generator.ts)
   └→ index.ts, wrangler.toml, package.json等

5. GitHubリポジトリ作成
   └→ Octokit API使用

6. ファイル一括コミット
   └→ Git Tree API使用

7. 環境変数情報を返却
   └→ クライアントに表示
```

### 3. Template Generator

**責務**: Discord Botコードの生成

#### 生成されるファイル

| ファイル | 説明 |
|---------|------|
| `src/index.ts` | メインエントリーポイント、コマンドハンドラー |
| `wrangler.toml` | Cloudflare Workers設定 |
| `package.json` | 依存関係とスクリプト |
| `tsconfig.json` | TypeScript設定 |
| `README.md` | セットアップ手順 |
| `.gitignore` | Git無視ファイル |

#### コード生成ロジック

```typescript
generateBotCode(botConfig, apiProfiles, commands)
  │
  ├─→ generateIndexTs()
  │    ├─ コマンドハンドラー生成
  │    ├─ APIコール処理生成
  │    └─ カスタムロジック埋め込み
  │
  ├─→ generateWranglerToml()
  │    └─ 環境変数設定
  │
  ├─→ generatePackageJson()
  │    └─ 依存関係定義
  │
  └─→ extractEnvVariables()
       └─ 環境変数一覧を抽出
```

### 4. Authentication Layer

**責務**: GitHub OAuth認証

#### 認証フロー

```
1. ユーザーが「GitHubでログイン」をクリック
   └→ /api/auth/github にリクエスト

2. GitHub OAuth画面にリダイレクト
   └→ スコープ: repo, user:email

3. ユーザーが認可
   └→ /api/auth/callback にコールバック

4. アクセストークン取得
   └→ GitHub Token Exchange API

5. ユーザー情報取得
   └→ GitHub Users API

6. クッキーに保存
   └→ github_token (httpOnly)
   └→ github_user (JSON)

7. ダッシュボードにリダイレクト
```

### 5. Data Layer

**責務**: データ永続化（Firebase Firestore）

#### データモデル

```typescript
// ユーザー
users/{userId}
  - id: string
  - githubId: number
  - login: string
  - name: string
  - email: string
  - createdAt: timestamp

// プロジェクト
projects/{projectId}
  - id: string
  - userId: string
  - repository: RepositoryConfig
  - botConfig: BotConfig
  - apiProfiles: ApiProfile[]
  - commands: SlashCommand[]
  - createdAt: timestamp
  - updatedAt: timestamp
```

## データフロー

### ユーザー設定の流れ

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Step 1  │ → │ Step 2  │ → │ Step 3  │ → │ Step 4  │
│ リポジ  │    │ API     │    │ コマンド │    │ 確認・  │
│ トリ    │    │ 設定    │    │ 定義    │    │ 生成    │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
     ↓              ↓              ↓              ↓
  ┌─────────────────────────────────────────────────┐
  │         Dashboard State (React)                 │
  └─────────────────────────────────────────────────┘
                          ↓
                  ┌──────────────┐
                  │ /api/generate │
                  └──────────────┘
                          ↓
          ┌──────────────────────────────┐
          │   Template Generator         │
          │   - コード生成                │
          │   - 環境変数抽出              │
          └──────────────────────────────┘
                          ↓
          ┌──────────────────────────────┐
          │   GitHub API                 │
          │   - リポジトリ作成            │
          │   - ファイルコミット          │
          └──────────────────────────────┘
                          ↓
          ┌──────────────────────────────┐
          │   Response                   │
          │   - repoUrl                  │
          │   - envVariables             │
          │   - setupInstructions        │
          └──────────────────────────────┘
```

## セキュリティ

### 1. 認証・認可

- **GitHub OAuth**: OAuth 2.0フロー使用
- **クッキー**: httpOnly, secure, sameSite設定
- **トークン管理**: サーバーサイドでのみアクセス可能

### 2. 機密情報の取り扱い

- **APIキー**:
  - ユーザー入力時のみメモリ内に存在
  - GitHubリポジトリには含めない
  - 環境変数設定手順としてユーザーに提示

- **環境変数**:
  - `.env.example` として出力
  - 実際の値は含まない

### 3. バリデーション

- **クライアントサイド**: React Hook Form + Zod
- **サーバーサイド**: Zodスキーマでバリデーション

## パフォーマンス最適化

### 1. コード分割

- Next.js App Routerの動的インポート
- コンポーネント単位での遅延読み込み

### 2. APIリクエスト最適化

- GitHub API: 一括コミット（Tree API使用）
- 並列処理: Blob作成を並列化

### 3. キャッシング

- 静的アセット: Vercel Edge Network
- APIレスポンス: 必要に応じてキャッシュ

## 拡張性

### 将来の拡張ポイント

1. **テンプレートエンジン**
   - Cloudflare Workers以外のプラットフォーム対応
   - Discord.js（Node.js）テンプレート
   - Deno Deploy テンプレート

2. **コマンドオプション**
   - スラッシュコマンドのオプション（引数）対応
   - サブコマンド対応

3. **高度な機能**
   - データベース連携テンプレート
   - ミドルウェア機能
   - イベントハンドラー（メッセージ、リアクション等）

4. **プロジェクト管理**
   - プロジェクトの保存・読み込み
   - テンプレートの共有
   - バージョン管理

5. **テスト機能**
   - コマンドのプレビュー
   - APIエンドポイントのテスト
   - シミュレーション機能

## デプロイメント

### 開発環境

```bash
npm run dev
# http://localhost:3000
```

### 本番環境 (Vercel)

```bash
# Vercel CLIでデプロイ
vercel deploy --prod

# または GitHub連携で自動デプロイ
git push origin main
```

### 環境変数設定

Vercel Dashboardで以下を設定:
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_REDIRECT_URI`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- Firebase関連の環境変数

## モニタリング

### ログ

- **Vercel Analytics**: ページビュー、パフォーマンス
- **Console.log**: エラートラッキング
- **GitHub Actions**: CI/CDログ

### エラートラッキング

今後の実装候補:
- Sentry
- LogRocket
- DataDog

## まとめ

DiscordBot-Makerは、モダンなWebテクノロジーを活用した、シンプルで拡張可能なアーキテクチャを採用しています。Next.js App Routerによる統一されたフルスタック構成により、開発効率と保守性を両立しています。

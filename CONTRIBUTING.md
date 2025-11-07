# コントリビューションガイド

DiscordBot-Makerへのコントリビューションに興味を持っていただき、ありがとうございます！

## 開発環境のセットアップ

1. リポジトリをフォーク
2. クローンしてセットアップ:

```bash
git clone https://github.com/YOUR_USERNAME/discordbot-maker.git
cd discordbot-maker
npm install
cp .env.example .env.local
# .env.localを編集して環境変数を設定
npm run dev
```

## コーディング規約

### TypeScript

- 型定義を明示的に記述
- `any`型の使用は最小限に
- インターフェースや型エイリアスを活用

### React コンポーネント

- 関数コンポーネントを使用
- カスタムフックで状態管理ロジックを分離
- propsの型定義を明示

### ファイル構成

```
src/
├── app/           # Next.js App Router
├── components/    # Reactコンポーネント
├── lib/           # ユーティリティ・ライブラリ
└── hooks/         # カスタムフック
```

## コミットメッセージ

コミットメッセージは以下の形式で:

```
<type>: <subject>

<body>
```

### Type

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント更新
- `style`: コードフォーマット
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: その他の変更

### 例

```
feat: APIプロファイル編集機能を追加

- 既存のプロファイルを編集できる機能を実装
- 編集フォームのバリデーションを追加
```

## プルリクエスト

1. フィーチャーブランチを作成:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. 変更をコミット:
   ```bash
   git commit -m "feat: your feature description"
   ```

3. プッシュ:
   ```bash
   git push origin feature/your-feature-name
   ```

4. GitHubでプルリクエストを作成

### プルリクエストのガイドライン

- 変更内容を明確に説明
- 関連するIssueがあれば参照
- スクリーンショットがあれば添付
- テストが通ることを確認

## バグ報告

バグを見つけた場合は、GitHubのIssueで報告してください。

### バグ報告に含める情報

- 問題の説明
- 再現手順
- 期待される動作
- 実際の動作
- 環境情報（OS、ブラウザ、Node.jsバージョン等）
- スクリーンショット（該当する場合）

## 機能リクエスト

新機能のアイデアがある場合も、Issueで提案してください。

### 機能リクエストに含める情報

- 機能の説明
- ユースケース
- 期待される動作
- 可能であれば実装案

## 質問

質問がある場合は、GitHubのDiscussionsまたはIssueで気軽に聞いてください。

## ライセンス

コントリビューションはMITライセンスの下で公開されます。

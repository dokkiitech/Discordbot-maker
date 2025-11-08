# コントリビューションガイドライン

DiscordBot-Makerへのコントリビューションに興味を持っていただきありがとうございます!

## 開発環境のセットアップ

1. リポジトリをフォーク
2. フォークしたリポジトリをクローン
   ```bash
   git clone https://github.com/YOUR_USERNAME/Discordbot-maker.git
   cd Discordbot-maker
   ```
3. 依存関係をインストール
   ```bash
   npm install
   ```
4. `.env.local`ファイルを作成して環境変数を設定
5. 開発サーバーを起動
   ```bash
   npm run dev
   ```

## コントリビューションの流れ

### 1. Issueを作成または確認

- 新機能やバグ修正の前に、既存のIssueを確認してください
- 該当するIssueがなければ、新しいIssueを作成してください
- 大きな変更の場合は、事前にIssueでディスカッションすることをお勧めします

### 2. ブランチを作成

メインブランチから新しいブランチを作成してください:

```bash
git checkout -b feature/your-feature-name
# または
git checkout -b fix/your-bug-fix
```

ブランチ命名規則:
- 新機能: `feature/機能名`
- バグ修正: `fix/バグ内容`
- ドキュメント: `docs/内容`
- リファクタリング: `refactor/内容`

### 3. 変更を加える

#### コーディングスタイル

- TypeScriptを使用してください
- ESLintとPrettierの設定に従ってください
- 意味のある変数名・関数名を使用してください
- 必要に応じてコメントを追加してください

#### コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/)の形式に従ってください:

```
<type>(<scope>): <subject>

<body>

<footer>
```

タイプ:
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: コードの意味に影響しない変更(空白、フォーマットなど)
- `refactor`: バグ修正も機能追加もしないコード変更
- `perf`: パフォーマンス改善
- `test`: テストの追加や修正
- `chore`: ビルドプロセスやツールの変更

例:
```
feat(commands): Add support for custom command prefixes

Added the ability to define custom prefixes for slash commands
to improve flexibility in bot configuration.

Closes #123
```

### 4. テストとチェック

変更をコミットする前に、以下を実行してください:

```bash
# ESLintチェック
npm run lint

# TypeScript型チェック
npm run type-check

# ビルドテスト
npm run build
```

すべてのチェックが通ることを確認してください。

### 5. Pull Requestを作成

1. フォークしたリポジトリに変更をプッシュ
   ```bash
   git push origin feature/your-feature-name
   ```

2. GitHubでPull Requestを作成
   - 適切なタイトルと説明を記載
   - 関連するIssueをリンク
   - PRテンプレートの項目を埋める

3. CIチェックが通ることを確認

4. レビューを待つ

## コードレビュー

- すべてのPull Requestはレビューが必要です
- レビュアーからのフィードバックに迅速に対応してください
- 建設的な議論を歓迎します

## 質問やサポート

- 質問がある場合は、Issueを作成してください
- バグを発見した場合は、詳細な再現手順とともにIssueを作成してください

## 行動規範

- 尊重と礼儀を持って他の貢献者と接してください
- 建設的なフィードバックを提供してください
- オープンで包括的なコミュニティを維持しましょう

## ライセンス

コントリビューションを行うことで、あなたの貢献がプロジェクトと同じMITライセンスの下でライセンスされることに同意したものとみなされます。

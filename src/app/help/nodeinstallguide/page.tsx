import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Alert from '@cloudscape-design/components/alert';
import Link from '@cloudscape-design/components/link';

export default function NodeInstallGuidePage() {
  return (
    <div className="min-h-screen p-8">
      <SpaceBetween size="l">
        <Container
          header={
            <Header
              variant="h1"
              description="Discord Botを動かすために必要なソフトウェアをインストールしましょう"
            >
              Node.jsのインストール方法
            </Header>
          }
        >
          <SpaceBetween size="m">
            <Alert type="info">
              <Box variant="h4">Node.jsとは？</Box>
              <Box>
                JavaScriptという言語でプログラムを動かすためのソフトウェアです。
                Discord Botを作成・実行するために必要なツールです。
              </Box>
            </Alert>

            <Box variant="h3">Windows の場合</Box>
            <ol className="space-y-3">
              <li>
                <Link href="https://nodejs.org/" external>
                  Node.js公式サイト
                </Link>
                を開きます
              </li>
              <li>「LTS（推奨版）」と書かれた緑色のボタンをクリックしてダウンロード</li>
              <li>ダウンロードしたファイル（.msi）をダブルクリック</li>
              <li>画面の指示に従って「次へ」を何回かクリックしてインストール</li>
              <li>
                インストールが完了したら、コマンドプロンプトを開いて以下を入力：
                <pre className="p-2 rounded mt-2 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--card-background)' }}>
node --version
                </pre>
                バージョン番号（例: v20.10.0）が表示されれば成功です！
              </li>
            </ol>

            <Box variant="h3">Mac の場合</Box>
            <ol className="space-y-3">
              <li>
                <Link href="https://nodejs.org/" external>
                  Node.js公式サイト
                </Link>
                を開きます
              </li>
              <li>「LTS（推奨版）」と書かれたボタンをクリックしてダウンロード</li>
              <li>ダウンロードしたファイル（.pkg）をダブルクリック</li>
              <li>画面の指示に従って「続ける」をクリックしてインストール</li>
              <li>
                インストールが完了したら、ターミナルを開いて以下を入力：
                <pre className="p-2 rounded mt-2 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--card-background)' }}>
node --version
                </pre>
                バージョン番号（例: v20.10.0）が表示されれば成功です！
              </li>
            </ol>

            <Box variant="h3">Linux の場合</Box>
            <ol className="space-y-3">
              <li>
                ターミナルを開きます
              </li>
              <li>
                以下のコマンドを順番に実行します：
                <pre className="p-2 rounded mt-2 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--card-background)' }}>
{`# Node.jsのバージョン管理ツール（nvm）をインストール
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# ターミナルを再起動するか、以下を実行
source ~/.bashrc

# Node.js LTS（推奨版）をインストール
nvm install --lts

# インストール確認
node --version`}
                </pre>
              </li>
            </ol>

            <Alert type="success">
              <Box variant="h4">インストール完了後</Box>
              <Box>
                Node.jsのインストールが完了したら、Discord Bot作成画面に戻って次のステップに進みましょう！
              </Box>
            </Alert>

            <Box variant="h3">よくある質問</Box>
            <SpaceBetween size="s">
              <Box>
                <Box variant="strong">Q: LTSとは何ですか？</Box>
                <Box>
                  A: 「Long Term Support（長期サポート）」の略で、安定して長く使えるバージョンという意味です。
                  特別な理由がない限り、LTS版を選んでください。
                </Box>
              </Box>

              <Box>
                <Box variant="strong">Q: すでにNode.jsがインストールされているか確認するには？</Box>
                <Box>
                  A: コマンドプロンプト（Windows）またはターミナル（Mac/Linux）で
                  <code>node --version</code>と入力してください。
                  バージョン番号が表示されればインストール済みです。
                </Box>
              </Box>

              <Box>
                <Box variant="strong">Q: 古いバージョンがインストールされている場合は？</Box>
                <Box>
                  A: 最新のLTS版をインストールすることで、自動的に新しいバージョンが使われるようになります。
                </Box>
              </Box>
            </SpaceBetween>
          </SpaceBetween>
        </Container>

        <Container>
          <SpaceBetween direction="horizontal" size="xs">
            <Link href="/dashboard" variant="primary">
              Bot作成画面に戻る
            </Link>
            <Link href="/help/gitinstallguide">
              Gitのインストール方法を見る
            </Link>
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </div>
  );
}

import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Alert from '@cloudscape-design/components/alert';
import Link from '@cloudscape-design/components/link';

export default function GitInstallGuidePage() {
  return (
    <div className="min-h-screen p-8">
      <SpaceBetween size="l">
        <Container
          header={
            <Header
              variant="h1"
              description="Discord Botのコードをダウンロードするために必要なツールをインストールしましょう"
            >
              Gitのインストール方法
            </Header>
          }
        >
          <SpaceBetween size="m">
            <Alert type="info">
              <Box variant="h4">Gitとは？</Box>
              <Box>
                プログラムのコードを保存・管理するためのツールです。
                GitHubからBotのコードをダウンロード（クローン）したり、コードの変更を記録したりするために使います。
              </Box>
            </Alert>

            <Box variant="h3">Windows の場合</Box>
            <ol className="space-y-3">
              <li>
                <Link href="https://git-scm.com/download/win" external>
                  Git for Windows
                </Link>
                を開きます
              </li>
              <li>「Download for Windows」ボタンをクリック</li>
              <li>ダウンロードが自動で始まります（始まらない場合は「Click here to download manually」をクリック）</li>
              <li>ダウンロードしたファイル（.exe）をダブルクリック</li>
              <li>
                インストール画面が表示されたら、基本的に「Next」を何回かクリックすればOKです
                <Alert type="warning">
                  途中で「Adjusting your PATH environment」という画面が出たら、
                  「Git from the command line and also from 3rd-party software」を選択してください
                </Alert>
              </li>
              <li>
                インストールが完了したら、コマンドプロンプトを開いて以下を入力：
                <pre className="p-2 rounded mt-2 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--card-background)' }}>
git --version
                </pre>
                バージョン番号（例: git version 2.42.0）が表示されれば成功です！
              </li>
            </ol>

            <Box variant="h3">Mac の場合</Box>
            <Alert type="info">
              Macには最初からGitが入っていることがありますが、最新版をインストールすることをおすすめします。
            </Alert>
            <ol className="space-y-3">
              <li>
                <Link href="https://git-scm.com/download/mac" external>
                  Git for Mac
                </Link>
                を開きます
              </li>
              <li>
                おすすめの方法: Homebrewを使う
                <ul className="mt-2 space-y-2">
                  <li>
                    まず、ターミナルを開きます
                  </li>
                  <li>
                    以下のコマンドを入力してHomebrewをインストール：
                    <pre className="p-2 rounded mt-2 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--card-background)' }}>
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
                    </pre>
                  </li>
                  <li>
                    Homebrewのインストール後、Gitをインストール：
                    <pre className="p-2 rounded mt-2 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--card-background)' }}>
brew install git
                    </pre>
                  </li>
                </ul>
              </li>
              <li>
                インストールが完了したら、ターミナルで以下を入力：
                <pre className="p-2 rounded mt-2 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--card-background)' }}>
git --version
                </pre>
                バージョン番号が表示されれば成功です！
              </li>
            </ol>

            <Box variant="h3">Linux の場合</Box>
            <ol className="space-y-3">
              <li>
                ターミナルを開きます
              </li>
              <li>
                お使いのLinuxディストリビューションに応じて、以下のコマンドを実行：
                <SpaceBetween size="s">
                  <Box>
                    <Box variant="strong">Ubuntu / Debian</Box>
                    <pre className="p-2 rounded mt-1 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--card-background)' }}>
sudo apt update
sudo apt install git
                    </pre>
                  </Box>
                  <Box>
                    <Box variant="strong">Fedora</Box>
                    <pre className="p-2 rounded mt-1 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--card-background)' }}>
sudo dnf install git
                    </pre>
                  </Box>
                  <Box>
                    <Box variant="strong">Arch Linux</Box>
                    <pre className="p-2 rounded mt-1 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--card-background)' }}>
sudo pacman -S git
                    </pre>
                  </Box>
                </SpaceBetween>
              </li>
              <li>
                インストール確認：
                <pre className="p-2 rounded mt-2 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--card-background)' }}>
git --version
                </pre>
              </li>
            </ol>

            <Box variant="h3">初期設定（すべてのOS共通）</Box>
            <Alert>
              Gitを初めて使う場合、名前とメールアドレスを設定する必要があります。
            </Alert>
            <ol className="space-y-3">
              <li>
                ターミナル（またはコマンドプロンプト）を開きます
              </li>
              <li>
                以下のコマンドを実行（「あなたの名前」と「your.email@example.com」を自分の情報に置き換えてください）：
                <pre className="p-2 rounded mt-2 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--card-background)' }}>
{`git config --global user.name "あなたの名前"
git config --global user.email "your.email@example.com"`}
                </pre>
              </li>
            </ol>

            <Alert type="success">
              <Box variant="h4">インストール完了後</Box>
              <Box>
                Gitのインストールと設定が完了したら、Discord Bot作成画面に戻って次のステップに進みましょう！
              </Box>
            </Alert>

            <Box variant="h3">よくある質問</Box>
            <SpaceBetween size="s">
              <Box>
                <Box variant="strong">Q: Gitとは何に使うのですか？</Box>
                <Box>
                  A: GitHubからBotのコードをダウンロード（git clone）したり、
                  コードの変更を記録・管理したりするために使います。
                  プログラミングをする上で必須のツールです。
                </Box>
              </Box>

              <Box>
                <Box variant="strong">Q: GitHubとは違うのですか？</Box>
                <Box>
                  A: Gitはツール（ソフトウェア）で、GitHubはコードを保存・共有するためのウェブサイトです。
                  Gitを使ってGitHubにコードをアップロードしたり、ダウンロードしたりします。
                </Box>
              </Box>

              <Box>
                <Box variant="strong">Q: すでにGitがインストールされているか確認するには？</Box>
                <Box>
                  A: ターミナル（またはコマンドプロンプト）で
                  <code>git --version</code>と入力してください。
                  バージョン番号が表示されればインストール済みです。
                </Box>
              </Box>

              <Box>
                <Box variant="strong">Q: コマンドプロンプトやターミナルとは？</Box>
                <Box>
                  A: コンピューターに文字で命令を出すためのツールです。
                  <ul className="mt-1 space-y-1">
                    <li>Windows: 「スタートメニュー」から「cmd」または「コマンドプロンプト」で検索</li>
                    <li>Mac: 「アプリケーション」→「ユーティリティ」→「ターミナル」</li>
                    <li>Linux: 通常は Ctrl+Alt+T で開きます</li>
                  </ul>
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
            <Link href="/help/nodeinstallguide">
              Node.jsのインストール方法を見る
            </Link>
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import Form from '@cloudscape-design/components/form';
import Box from '@cloudscape-design/components/box';
import Alert from '@cloudscape-design/components/alert';
import Table from '@cloudscape-design/components/table';
import Link from '@cloudscape-design/components/link';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import { Download, Copy, ExternalLink, Loader2 } from 'lucide-react';
import type { RepositoryConfig, BotConfig, ApiProfile, SlashCommand } from '@/lib/types';
import { BotDeploymentType } from '@/lib/types';
import { downloadFile, generateEnvFile } from '@/lib/utils';
import { downloadAsZip, type GeneratedFile } from '@/lib/zip-generator';

interface Step4ReviewProps {
  repositoryConfig: RepositoryConfig;
  botConfig: BotConfig;
  apiProfiles: ApiProfile[];
  commands: SlashCommand[];
  onPrev: () => void;
  onSubmit: () => Promise<void>;
}

export function Step4Review({
  repositoryConfig,
  botConfig,
  apiProfiles,
  commands,
  onPrev,
  onSubmit,
}: Step4ReviewProps) {
  const [generating, setGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);

  const envVariables: Record<string, string> = {};
  if (botConfig.deploymentType === BotDeploymentType.INTERACTIONS_ENDPOINT) {
    envVariables['DISCORD_APPLICATION_ID'] = botConfig.applicationId || 'your_discord_application_id';
    envVariables['DISCORD_PUBLIC_KEY'] = botConfig.publicKey || 'your_discord_public_key';
    envVariables['DISCORD_BOT_TOKEN'] = botConfig.botToken || 'your_discord_bot_token';
  } else {
    envVariables['DISCORD_BOT_TOKEN'] = botConfig.botToken || 'your_discord_bot_token';
    envVariables['DISCORD_APPLICATION_ID'] = botConfig.applicationId || 'your_discord_application_id';
  }

  apiProfiles.forEach((profile) => {
    envVariables[profile.envVarKey] = profile.apiKey || 'your_api_key';
    if (profile.envVarUrl) envVariables[profile.envVarUrl] = profile.baseUrl;
  });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await onSubmit();
      setGenerationComplete(true);
      setRepoUrl((result as any)?.repoUrl || '');
      setGeneratedFiles((result as any)?.files || []);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleZipDownload = async () => {
    if (generatedFiles.length === 0) {
      console.error('No files to download');
      return;
    }

    try {
      await downloadAsZip(generatedFiles, botConfig.name);
    } catch (error) {
      console.error('Failed to download ZIP:', error);
    }
  };

  const handleCopyEnvVar = (key: string, value: string) => {
    navigator.clipboard.writeText(`${key}=${value}`);
    setCopiedVar(key);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const handleDownloadEnv = () => {
    const envContent = generateEnvFile(envVariables);
    downloadFile(envContent, '.env', 'text/plain');
  };

  const handleDownloadWranglerEnv = () => {
    const wranglerContent = Object.entries(envVariables)
      .map(([key, _]) => `${key} = ""`)
      .join('\n');
    downloadFile(wranglerContent, '.dev.vars', 'text/plain');
  };

  if (generationComplete) {
    const isGateway = botConfig.deploymentType === BotDeploymentType.GATEWAY;

    return (
      <Form>
        <SpaceBetween size="l">
          <Container>
            <SpaceBetween size="m">
              <StatusIndicator type="success">
                <Box variant="h2">生成完了!</Box>
              </StatusIndicator>
              <Box>
                GitHubリポジトリが正常に作成されました
                {repoUrl && (
                  <>
                    :{' '}
                    <Link href={repoUrl} external>
                      {repoUrl}
                    </Link>
                  </>
                )}
              </Box>
            </SpaceBetween>
          </Container>

          <Container
            header={
              <Header variant="h2">次のステップ: 環境変数の設定</Header>
            }
          >
            <SpaceBetween size="m">
              <Alert type="warning">
                {isGateway
                  ? 'Botをデプロイする前に、以下の環境変数を設定してください。'
                  : 'Botをデプロイする前に、以下の環境変数をCloudflare Workersに設定してください。'}
              </Alert>

              {!isGateway && (
                <Box>
                  <Box variant="h4">設定方法:</Box>
                  <ol>
                    <li>Cloudflare Dashboardにログイン</li>
                    <li>Workers & Pages → あなたのWorkerを選択</li>
                    <li>Settings → Variables → Edit variables</li>
                    <li>以下の変数を追加</li>
                  </ol>
                </Box>
              )}

              {isGateway && (
                <Box>
                  <Box variant="h4">設定方法:</Box>
                  <ol>
                    <li>リポジトリをクローン</li>
                    <li>プロジェクトルートに<code>.env</code>ファイルを作成</li>
                    <li>以下の環境変数を記載</li>
                    <li>デプロイ先（Railway/Render等）で同じ環境変数を設定</li>
                  </ol>
                </Box>
              )}

              <Container
                header={
                  <Header
                    variant="h3"
                    actions={
                      <SpaceBetween direction="horizontal" size="xs">
                        <Button
                          iconName="download"
                          onClick={handleDownloadEnv}
                        >
                          .envダウンロード
                        </Button>
                        {!isGateway && (
                          <Button
                            iconName="download"
                            onClick={handleDownloadWranglerEnv}
                          >
                            .dev.varsダウンロード
                          </Button>
                        )}
                      </SpaceBetween>
                    }
                  >
                    環境変数一覧
                  </Header>
                }
              >
                <Table
                  columnDefinitions={[
                    {
                      id: 'key',
                      header: '変数名',
                      cell: (item: [string, string]) => item[0],
                    },
                    {
                      id: 'value',
                      header: '値',
                      cell: (item: [string, string]) => (
                        <code className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--border)' }}>{item[1]}</code>
                      ),
                    },
                    {
                      id: 'actions',
                      header: 'コピー',
                      cell: (item: [string, string]) => (
                        <Button
                          variant="icon"
                          iconName={copiedVar === item[0] ? 'check' : 'copy'}
                          onClick={() => handleCopyEnvVar(item[0], item[1])}
                        >
                          {copiedVar === item[0] ? 'コピー完了!' : ''}
                        </Button>
                      ),
                    },
                  ]}
                  items={Object.entries(envVariables)}
                  variant="embedded"
                />
              </Container>

              <Alert type="info">
                <Box variant="h4">デプロイ手順</Box>
                {!isGateway ? (
                  <>
                    <ol>
                      <li>
                        コードを保存する場所を決めて、そのフォルダに移動します
                        <pre className="p-2 rounded mt-1 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--card-background)' }}>
{`# 例: Documentsフォルダに移動
cd ~/Documents

# または、任意の場所に移動
cd 保存したいフォルダのパス`}
                        </pre>
                      </li>
                      <li>
                        GitHubからコードをダウンロード（クローン）します
                        <pre className="p-2 rounded mt-1 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--card-background)' }}>
git clone {repoUrl}
                        </pre>
                      </li>
                      <li>
                        ダウンロードしたフォルダに移動します
                        <pre className="p-2 rounded mt-1 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--card-background)' }}>
cd {repositoryConfig.name}
                        </pre>
                      </li>
                      <li>
                        必要なファイルをインストールします
                        <pre className="p-2 rounded mt-1 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--card-background)' }}>
npm install
                        </pre>
                      </li>
                      <li>環境変数を設定（上記の表を参照してCloudflare Dashboardで設定）</li>
                      <li>
                        デプロイします
                        <pre className="p-2 rounded mt-1 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--card-background)' }}>
npx wrangler deploy
                        </pre>
                      </li>
                      <li>Discord Developer Portal で Interactions Endpoint URL を設定</li>
                      <li>デプロイしたURLの<code>/register?token=</code>エンドポイントにアクセスしてコマンド登録</li>
                    </ol>
                    <Box color="text-status-warning" margin={{ top: 's' }}>
                      注意: Botは「オフライン」と表示されますが、スラッシュコマンドは正常に動作します。
                    </Box>
                  </>
                ) : (
                  <>
                    <Box variant="h5">基本的な手順:</Box>
                    <ol>
                      <li>
                        コードを保存する場所を決めて、そのフォルダに移動します
                        <pre className="p-2 rounded mt-1 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--card-background)' }}>
{`# 例: Documentsフォルダに移動
cd ~/Documents

# または、任意の場所に移動
cd 保存したいフォルダのパス`}
                        </pre>
                      </li>
                      <li>
                        GitHubからコードをダウンロード（クローン）します
                        <pre className="p-2 rounded mt-1 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--card-background)' }}>
git clone {repoUrl}
                        </pre>
                      </li>
                      <li>
                        ダウンロードしたフォルダに移動します
                        <pre className="p-2 rounded mt-1 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--card-background)' }}>
cd {repositoryConfig.name}
                        </pre>
                      </li>
                      <li>
                        必要なファイルをインストールします
                        <pre className="p-2 rounded mt-1 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--card-background)' }}>
npm install
                        </pre>
                      </li>
                      <li>
                        <code>.env</code>ファイルを作成して環境変数を設定（上記の表を参照）
                      </li>
                      <li>
                        プログラムをビルドします
                        <pre className="p-2 rounded mt-1 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--card-background)' }}>
npm run build
                        </pre>
                      </li>
                      <li>
                        ローカルでテスト実行します
                        <pre className="p-2 rounded mt-1 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--card-background)' }}>
npm run dev
                        </pre>
                      </li>
                    </ol>

                    <Box variant="h5" margin={{ top: 'm' }}>デプロイ方法:</Box>
                    <Box>
                      <Box variant="strong">Railway / Render (推奨)</Box>
                      <ul>
                        <li>GitHubリポジトリをインポート</li>
                        <li>環境変数を設定</li>
                        <li>自動デプロイ完了</li>
                      </ul>
                    </Box>

                    <Box margin={{ top: 's' }}>
                      <Box variant="strong">VPS/EC2 + PM2</Box>
                      <pre className="p-2 rounded mt-1 overflow-x-auto text-xs" style={{ backgroundColor: 'var(--card-background)' }}>
{`# PM2をインストール
npm install -g pm2

# Bot起動（プロセス名: ${botConfig.name.toLowerCase().replace(/\s+/g, '-')}）
pm2 start npm --name "${botConfig.name.toLowerCase().replace(/\s+/g, '-')}" -- start

# 自動起動設定
pm2 startup
pm2 save

# 管理コマンド
pm2 status              # ステータス確認
pm2 logs ${botConfig.name.toLowerCase().replace(/\s+/g, '-')}  # ログ確認
pm2 restart ${botConfig.name.toLowerCase().replace(/\s+/g, '-')}  # 再起動`}
                      </pre>
                    </Box>

                    <Box color="text-status-success" margin={{ top: 's' }}>
                      起動すると、Botが「オンライン」として表示され、スラッシュコマンドが自動登録されます。
                    </Box>
                  </>
                )}
              </Alert>
            </SpaceBetween>
          </Container>

          <Container>
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => window.location.href = '/dashboard'}>
                新しいBotを作成
              </Button>
              <Button
                iconName="download"
                onClick={handleZipDownload}
                disabled={generatedFiles.length === 0}
              >
                ZIPでダウンロード
              </Button>
              {repoUrl && (
                <Button
                  variant="primary"
                  iconName="external"
                  iconAlign="right"
                  onClick={() => window.open(repoUrl, '_blank')}
                >
                  リポジトリを開く
                </Button>
              )}
            </SpaceBetween>
          </Container>
        </SpaceBetween>
      </Form>
    );
  }

  return (
    <Form
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          <Button variant="link" onClick={onPrev} disabled={generating}>
            戻る
          </Button>
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={generating}
            loading={generating}
          >
            {generating ? '生成中...' : '生成してコミット'}
          </Button>
        </SpaceBetween>
      }
    >
      <SpaceBetween size="l">
        <Container
          header={
            <Header
              variant="h2"
              description="設定内容を確認して、問題なければ生成してください"
            >
              ステップ 4: 確認と生成
            </Header>
          }
        >
          <SpaceBetween size="m">
            <Container header={<Header variant="h3">リポジトリ設定</Header>}>
              <SpaceBetween size="xs">
                <Box><Box variant="strong">名前:</Box> {repositoryConfig.name}</Box>
                <Box><Box variant="strong">ブランチ:</Box> {repositoryConfig.branch}</Box>
                <Box><Box variant="strong">説明:</Box> {repositoryConfig.description || '(なし)'}</Box>
                <Box><Box variant="strong">プライベート:</Box> {repositoryConfig.isPrivate ? 'はい' : 'いいえ'}</Box>
              </SpaceBetween>
            </Container>

            <Container header={<Header variant="h3">Bot設定</Header>}>
              <SpaceBetween size="xs">
                <Box><Box variant="strong">Bot名:</Box> {botConfig.name}</Box>
                <Box><Box variant="strong">説明:</Box> {botConfig.description || '(なし)'}</Box>
                <Box>
                  <Box variant="strong">デプロイメントタイプ:</Box>{' '}
                  {botConfig.deploymentType === BotDeploymentType.INTERACTIONS_ENDPOINT
                    ? 'Interactions Endpoint (Cloudflare Workers)'
                    : 'Gateway (discord.js)'}
                </Box>
              </SpaceBetween>
            </Container>

            <Container header={<Header variant="h3">APIプロファイル ({apiProfiles.length})</Header>}>
              {apiProfiles.length > 0 ? (
                <SpaceBetween size="xs">
                  {apiProfiles.map((profile) => (
                    <Box key={profile.id}>
                      • <Box variant="strong">{profile.name}</Box> - {profile.baseUrl}
                    </Box>
                  ))}
                </SpaceBetween>
              ) : (
                <Box color="text-status-inactive">APIプロファイルが設定されていません</Box>
              )}
            </Container>

            <Container header={<Header variant="h3">スラッシュコマンド ({commands.length})</Header>}>
              {commands.length > 0 ? (
                <SpaceBetween size="xs">
                  {commands.map((cmd) => (
                    <Box key={cmd.id}>
                      • <Box variant="strong">/{cmd.name}</Box> - {cmd.description}
                    </Box>
                  ))}
                </SpaceBetween>
              ) : (
                <Box color="text-status-inactive">コマンドが設定されていません</Box>
              )}
            </Container>
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </Form>
  );
}

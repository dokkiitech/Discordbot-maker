'use client';

import { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, Copy, Check, ExternalLink, Loader2 } from 'lucide-react';
import type { RepositoryConfig, BotConfig, ApiProfile, SlashCommand } from '@/lib/types';
import { downloadFile, generateEnvFile } from '@/lib/utils';

interface Step4ReviewProps {
  repositoryConfig: RepositoryConfig;
  botConfig: BotConfig;
  apiProfiles: ApiProfile[];
  commands: SlashCommand[];
  onPrev: () => void;
}

export function Step4Review({
  repositoryConfig,
  botConfig,
  apiProfiles,
  commands,
  onPrev,
}: Step4ReviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [envVariables, setEnvVariables] = useState<Record<string, string>>({});
  const [copiedEnv, setCopiedEnv] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      // コード生成APIを呼び出し
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repository: repositoryConfig,
          botConfig,
          apiProfiles,
          commands,
        }),
      });

      if (!response.ok) {
        throw new Error('コード生成に失敗しました');
      }

      const result = await response.json();

      setRepoUrl(result.repoUrl);
      setEnvVariables(result.envVariables);
      setGenerationComplete(true);
    } catch (error) {
      console.error('Generation error:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyEnv = () => {
    const envContent = generateEnvFile(envVariables);
    navigator.clipboard.writeText(envContent);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const handleDownloadEnv = () => {
    const envContent = generateEnvFile(envVariables);
    downloadFile(envContent, '.env.example', 'text/plain');
  };

  const handleDownloadWranglerEnv = () => {
    const wranglerContent = Object.entries(envVariables)
      .map(([key, _]) => `${key} = ""`)
      .join('\n');
    downloadFile(wranglerContent, '.dev.vars', 'text/plain');
  };

  if (generationComplete) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Check className="w-8 h-8 text-green-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">生成完了！</h2>
              <p className="text-gray-600 mt-1">
                GitHubリポジトリにコードがコミットされました
              </p>
            </div>
          </div>
        </CardHeader>

        <CardBody className="space-y-6">
          {/* リポジトリリンク */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">GitHubリポジトリ</h3>
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              {repoUrl}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* 環境変数設定手順 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              次のステップ: 環境変数の設定
            </h3>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-3">
                Botをデプロイする前に、以下の環境変数をCloudflare Workersに設定してください。
              </p>

              <div className="space-y-2 text-sm">
                <p className="font-semibold">設定方法:</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Cloudflare Dashboardにログイン</li>
                  <li>Workers & Pages → あなたのWorkerを選択</li>
                  <li>Settings → Variables → Edit variables</li>
                  <li>以下の変数を追加</li>
                </ol>
              </div>
            </div>

            {/* 環境変数テーブル */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">環境変数一覧</h4>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleCopyEnv}
                  >
                    {copiedEnv ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        コピー済み
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        コピー
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleDownloadEnv}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    .envダウンロード
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleDownloadWranglerEnv}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    .dev.varsダウンロード
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">
                        変数名
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">
                        値
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(envVariables).map(([key, value]) => (
                      <tr key={key}>
                        <td className="px-4 py-2 text-sm font-mono text-gray-900">
                          {key}
                        </td>
                        <td className="px-4 py-2 text-sm font-mono text-gray-600">
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* デプロイ手順 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">デプロイ手順</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                <li>リポジトリをクローン: <code className="bg-white px-1 rounded">git clone {repoUrl}</code></li>
                <li>依存関係をインストール: <code className="bg-white px-1 rounded">npm install</code></li>
                <li>環境変数を設定（上記参照）</li>
                <li>デプロイ: <code className="bg-white px-1 rounded">npx wrangler deploy</code></li>
              </ol>
            </div>
          </div>
        </CardBody>

        <CardFooter>
          <div className="flex justify-between w-full">
            <Button variant="secondary" onClick={() => window.location.href = '/dashboard'}>
              新しいBotを作成
            </Button>
            <a href={repoUrl} target="_blank" rel="noopener noreferrer">
              <Button>
                <ExternalLink className="w-4 h-4 mr-2" />
                GitHubで確認
              </Button>
            </a>
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold text-gray-900">
          ステップ 4: 確認と生成
        </h2>
        <p className="text-gray-600 mt-1">
          設定内容を確認して、コードを生成してください
        </p>
      </CardHeader>

      <CardBody className="space-y-6">
        {/* リポジトリ設定 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">リポジトリ設定</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">リポジトリ名:</span>
              <span className="font-mono">{repositoryConfig.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ブランチ:</span>
              <span className="font-mono">{repositoryConfig.branch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">公開設定:</span>
              <span>{repositoryConfig.isPrivate ? 'プライベート' : 'パブリック'}</span>
            </div>
          </div>
        </div>

        {/* Bot設定 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Bot設定</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Bot名:</span>
              <span>{botConfig.name}</span>
            </div>
            {botConfig.description && (
              <div className="flex justify-between">
                <span className="text-gray-600">説明:</span>
                <span className="text-right">{botConfig.description}</span>
              </div>
            )}
          </div>
        </div>

        {/* APIプロファイル */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            APIプロファイル ({apiProfiles.length})
          </h3>
          {apiProfiles.length > 0 ? (
            <div className="space-y-2">
              {apiProfiles.map((profile) => (
                <div key={profile.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="font-semibold">{profile.name}</div>
                  <div className="text-gray-600 text-xs">{profile.baseUrl}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">設定なし</p>
          )}
        </div>

        {/* コマンド */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            スラッシュコマンド ({commands.length})
          </h3>
          <div className="space-y-2">
            {commands.map((command) => (
              <div key={command.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="font-semibold">/{command.name}</div>
                <div className="text-gray-600 text-xs">{command.description}</div>
              </div>
            ))}
          </div>
        </div>
      </CardBody>

      <CardFooter>
        <div className="flex justify-between w-full">
          <Button variant="secondary" onClick={onPrev} disabled={isGenerating}>
            戻る
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              <>生成してコミット</>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

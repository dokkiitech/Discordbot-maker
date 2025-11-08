'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Textarea from '@cloudscape-design/components/textarea';
import Checkbox from '@cloudscape-design/components/checkbox';
import Button from '@cloudscape-design/components/button';
import Form from '@cloudscape-design/components/form';
import type { RepositoryConfig, BotConfig } from '@/lib/types';
import { RepositoryConfigSchema, BotConfigSchema, BotDeploymentType } from '@/lib/types';

const Step1Schema = z.object({
  repository: RepositoryConfigSchema,
  botConfig: BotConfigSchema,
});

type Step1FormData = z.infer<typeof Step1Schema>;

interface Step1RepositoryProps {
  repositoryConfig: RepositoryConfig;
  botConfig: BotConfig;
  onRepositoryChange: (config: RepositoryConfig) => void;
  onBotConfigChange: (config: BotConfig) => void;
  onNext: () => void;
}

export function Step1Repository({
  repositoryConfig,
  botConfig,
  onRepositoryChange,
  onBotConfigChange,
  onNext,
}: Step1RepositoryProps) {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Step1FormData>({
    resolver: zodResolver(Step1Schema),
    defaultValues: {
      repository: repositoryConfig,
      botConfig: botConfig,
    },
  });

  const onSubmit = (data: Step1FormData) => {
    onRepositoryChange(data.repository);
    onBotConfigChange(data.botConfig);
    onNext();
  };

  const handleFormSubmit = handleSubmit((data) => {
    onSubmit(data);
  }, () => {
    // エラーがある場合、フォームの上部にスクロール
    setTimeout(() => {
      const formElement = document.querySelector('form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  });

  return (
    <form onSubmit={handleFormSubmit}>
      <Form
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="primary" formAction="submit">
              次へ
            </Button>
          </SpaceBetween>
        }
      >
        <SpaceBetween size="l">
          <Container
            header={
              <Header
                variant="h2"
                description="GitHubリポジトリとDiscord Botの基本情報を設定してください"
              >
                ステップ 1: リポジトリとBot設定
              </Header>
            }
          >
            <SpaceBetween size="l">
              {/* GitHubリポジトリ設定 */}
              <SpaceBetween size="m">
                <Header variant="h3">GitHubリポジトリ設定</Header>

                <Controller
                  name="repository.name"
                  control={control}
                  render={({ field }) => (
                    <FormField
                      label="リポジトリ名"
                      description="英数字、ハイフン、アンダースコアのみ使用可能"
                      errorText={errors.repository?.name?.message}
                    >
                      <Input
                        value={field.value}
                        onChange={({ detail }) => field.onChange(detail.value)}
                        placeholder="my-discord-bot"
                        type="text"
                      />
                    </FormField>
                  )}
                />

                <Controller
                  name="repository.branch"
                  control={control}
                  render={({ field }) => (
                    <FormField
                      label="ブランチ名"
                      errorText={errors.repository?.branch?.message}
                    >
                      <Input
                        value={field.value}
                        onChange={({ detail }) => field.onChange(detail.value)}
                        placeholder="main"
                        type="text"
                      />
                    </FormField>
                  )}
                />

                <Controller
                  name="repository.description"
                  control={control}
                  render={({ field }) => (
                    <FormField
                      label="リポジトリの説明"
                      errorText={errors.repository?.description?.message}
                    >
                      <Textarea
                        value={field.value || ''}
                        onChange={({ detail }) => field.onChange(detail.value)}
                        placeholder="このリポジトリの説明を入力してください"
                        rows={3}
                      />
                    </FormField>
                  )}
                />

                <Controller
                  name="repository.isPrivate"
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <Checkbox
                      {...field}
                      checked={value}
                      onChange={({ detail }) => onChange(detail.checked)}
                    >
                      プライベートリポジトリとして作成
                    </Checkbox>
                  )}
                />
              </SpaceBetween>

              {/* Bot設定 */}
              <SpaceBetween size="m">
                <Header variant="h3">Discord Bot設定</Header>

                <Controller
                  name="botConfig.name"
                  control={control}
                  render={({ field }) => (
                    <FormField
                      label="Bot名"
                      errorText={errors.botConfig?.name?.message}
                    >
                      <Input
                        value={field.value}
                        onChange={({ detail }) => field.onChange(detail.value)}
                        placeholder="My Discord Bot"
                        type="text"
                      />
                    </FormField>
                  )}
                />

                <Controller
                  name="botConfig.description"
                  control={control}
                  render={({ field }) => (
                    <FormField
                      label="Botの説明"
                      errorText={errors.botConfig?.description?.message}
                    >
                      <Textarea
                        value={field.value || ''}
                        onChange={({ detail }) => field.onChange(detail.value)}
                        placeholder="このBotの機能や目的を説明してください"
                        rows={3}
                      />
                    </FormField>
                  )}
                />

                <Controller
                  name="botConfig.applicationId"
                  control={control}
                  render={({ field }) => (
                    <FormField
                      label="Application ID（オプション）"
                      description={
                        <>
                          <a
                            href="https://discord.com/developers/applications"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline cursor-pointer"
                          >
                            ここをクリックして
                          </a>
                          general informationから取得できます
                        </>
                      }
                      errorText={errors.botConfig?.applicationId?.message}
                    >
                      <Input
                        value={field.value || ''}
                        onChange={({ detail }) => field.onChange(detail.value)}
                        placeholder="123456789012345678"
                        type="text"
                      />
                    </FormField>
                  )}
                />

                <Controller
                  name="botConfig.publicKey"
                  control={control}
                  render={({ field }) => (
                    <FormField
                      label="Public Key（オプション）"
                      description={
                        <>
                          <a
                            href="https://discord.com/developers/applications"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline cursor-pointer"
                          >
                            ここをクリックして
                          </a>
                          general informationから取得できます
                        </>
                      }
                      errorText={errors.botConfig?.publicKey?.message}
                    >
                      <Input
                        value={field.value || ''}
                        onChange={({ detail }) => field.onChange(detail.value)}
                        placeholder="abcdef0123456789..."
                        type="text"
                      />
                    </FormField>
                  )}
                />

                <Controller
                  name="botConfig.botToken"
                  control={control}
                  render={({ field }) => (
                    <FormField
                      label="Bot Token（オプション）"
                      description={
                        <>
                          <a
                            href="https://discord.com/developers/applications"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline cursor-pointer"
                          >
                            ここをクリックして
                          </a>
                          Botから取得できます
                        </>
                      }
                      errorText={errors.botConfig?.botToken?.message}
                    >
                      <Input
                        value={field.value || ''}
                        onChange={({ detail }) => field.onChange(detail.value)}
                        placeholder="MTk4NjIyNDgzNDcxOTI1MjQ4..."
                        type="password"
                      />
                    </FormField>
                  )}
                />

                <Controller
                  name="botConfig.deploymentType"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <FormField
                      label="デプロイメントタイプ"
                      errorText={errors.botConfig?.deploymentType?.message}
                    >
                      <div className="space-y-3">
                        {[
                          {
                            value: BotDeploymentType.INTERACTIONS_ENDPOINT,
                            label: 'Interactions Endpoint (Cloudflare Workers)',
                            description: (
                              <>
                                ✅ サーバーレス（無料枠が大きい）<br />
                                ✅ スラッシュコマンド対応<br />
                                ⚠️ Botは「オフライン」表示（機能は正常）<br />
                                📦 デプロイ先: Cloudflare Workers
                              </>
                            ),
                          },
                          {
                            value: BotDeploymentType.GATEWAY,
                            label: 'Gateway (discord.js)',
                            description: (
                              <>
                                ✅ Botが「オンライン」表示<br />
                                ✅ リアルタイムイベント取得可能<br />
                                ⚠️ 常時稼働サーバーが必要<br />
                                📦 デプロイ先: Railway / Render / VPS
                              </>
                            ),
                          },
                        ].map((item) => {
                          const isSelected = (value || BotDeploymentType.INTERACTIONS_ENDPOINT) === item.value;
                          return (
                            <div
                              key={item.value}
                              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                isSelected
                                  ? 'border-primary bg-primary bg-opacity-10'
                                  : 'border-border hover:opacity-80'
                              }`}
                              onClick={() => onChange(item.value)}
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="radio"
                                  checked={isSelected}
                                  onChange={() => onChange(item.value)}
                                  className="mt-1 w-4 h-4 text-primary border-border focus:ring-primary"
                                />
                                <div className="flex-1">
                                  <div className={`font-semibold ${isSelected ? 'text-white' : 'text-foreground'}`}>{item.label}</div>
                                  <div className={`text-sm ${isSelected ? 'text-white' : 'text-muted'} mt-1`}>{item.description}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </FormField>
                  )}
                />
              </SpaceBetween>
            </SpaceBetween>
          </Container>
        </SpaceBetween>
      </Form>
    </form>
  );
}

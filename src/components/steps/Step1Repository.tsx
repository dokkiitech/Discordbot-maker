'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import type { RepositoryConfig, BotConfig } from '@/lib/types';
import { RepositoryConfigSchema, BotConfigSchema } from '@/lib/types';

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
    register,
    handleSubmit,
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900">
            ステップ 1: リポジトリとBot設定
          </h2>
          <p className="text-gray-600 mt-1">
            GitHubリポジトリとDiscord Botの基本情報を設定してください
          </p>
        </CardHeader>

        <CardBody className="space-y-6">
          {/* リポジトリ設定 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              GitHubリポジトリ設定
            </h3>
            <div className="space-y-4">
              <Input
                label="リポジトリ名"
                placeholder="my-discord-bot"
                required
                {...register('repository.name')}
                error={errors.repository?.name?.message}
                helperText="英数字、ハイフン、アンダースコアのみ使用可能"
              />

              <Input
                label="ブランチ名"
                placeholder="main"
                required
                {...register('repository.branch')}
                error={errors.repository?.branch?.message}
              />

              <Textarea
                label="リポジトリの説明"
                placeholder="このリポジトリの説明を入力してください"
                rows={3}
                {...register('repository.description')}
                error={errors.repository?.description?.message}
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  {...register('repository.isPrivate')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isPrivate" className="text-sm text-gray-700">
                  プライベートリポジトリとして作成
                </label>
              </div>
            </div>
          </div>

          {/* Bot設定 */}
          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Discord Bot設定
            </h3>
            <div className="space-y-4">
              <Input
                label="Bot名"
                placeholder="My Discord Bot"
                required
                {...register('botConfig.name')}
                error={errors.botConfig?.name?.message}
              />

              <Textarea
                label="Botの説明"
                placeholder="このBotの機能や目的を説明してください"
                rows={3}
                {...register('botConfig.description')}
                error={errors.botConfig?.description?.message}
              />

              <Input
                label="Application ID（オプション）"
                placeholder="123456789012345678"
                {...register('botConfig.applicationId')}
                error={errors.botConfig?.applicationId?.message}
                helperText="Discord Developer Portalから取得できます"
              />

              <Input
                label="Public Key（オプション）"
                placeholder="abcdef0123456789..."
                {...register('botConfig.publicKey')}
                error={errors.botConfig?.publicKey?.message}
                helperText="Discord Developer Portalから取得できます"
              />
            </div>
          </div>
        </CardBody>

        <CardFooter>
          <div className="flex justify-end">
            <Button type="submit" size="lg">
              次へ
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}

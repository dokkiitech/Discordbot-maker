'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Bot, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StepIndicator } from '@/components/steps/StepIndicator';
import { Step0TemplateSelection } from '@/components/steps/Step0TemplateSelection';
import { Step1Repository } from '@/components/steps/Step1Repository';
import { Step2ApiProfiles } from '@/components/steps/Step2ApiProfiles';
import { Step3Commands } from '@/components/steps/Step3Commands';
import { Step4Review } from '@/components/steps/Step4Review';
import type {
  RepositoryConfig,
  BotConfig,
  ApiProfile,
  SlashCommand,
} from '@/lib/types';
import { BotDeploymentType } from '@/lib/types';
import { BotTemplate, createProjectConfigFromTemplate } from '@/lib/templates';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0); // 0: テンプレート選択, 1-4: 既存のステップ

  // フォームデータ
  const [repositoryConfig, setRepositoryConfig] = useState<RepositoryConfig>({
    name: '',
    branch: 'main',
    description: '',
    isPrivate: false,
  });

  const [botConfig, setBotConfig] = useState<BotConfig>({
    name: '',
    description: '',
    applicationId: '',
    publicKey: '',
    botToken: '',
    deploymentType: BotDeploymentType.INTERACTIONS_ENDPOINT,
  });

  const [apiProfiles, setApiProfiles] = useState<ApiProfile[]>([]);
  const [commands, setCommands] = useState<SlashCommand[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // テンプレート選択時の処理
  const handleTemplateSelect = (template: BotTemplate) => {
    if (!user) return;

    // テンプレートから設定を生成（リポジトリ名とボット名はユーザーが後で入力）
    const config = createProjectConfigFromTemplate(template, {
      repositoryName: '',
      botName: template.name,
      userId: user.id.toString(),
      repositoryDescription: template.description,
      isPrivate: true,
    });

    // 設定を適用
    setRepositoryConfig(config.repository);
    setBotConfig(config.botConfig as BotConfig);
    setApiProfiles(config.apiProfiles);
    setCommands(config.commands as SlashCommand[]);

    // Step1に進む
    setCurrentStep(1);
  };

  // テンプレート選択をスキップ（空のプロジェクト）
  const handleSkipTemplate = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repository: repositoryConfig,
        botConfig,
        apiProfiles,
        commands,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate bot');
    }

    const result = await response.json();
    return result;
  };

  return (
    <div className="min-h-screen text-foreground" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <header className="border-b border-border liquid-blur-md header-depth-shadow" style={{ backgroundColor: 'var(--card-background)' }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">DiscordBot-Maker</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Image
                src={user.avatar_url}
                alt={user.login}
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-sm text-foreground">{user.login}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Step Indicator - テンプレート選択画面では非表示 */}
          {currentStep > 0 && <StepIndicator currentStep={currentStep} />}

          {/* Step Content */}
          <div className="mt-8">
            {/* Step 0: テンプレート選択 */}
            {currentStep === 0 && (
              <Step0TemplateSelection
                onTemplateSelect={handleTemplateSelect}
                onSkip={handleSkipTemplate}
              />
            )}

            {currentStep === 1 && (
              <Step1Repository
                repositoryConfig={repositoryConfig}
                botConfig={botConfig}
                onRepositoryChange={setRepositoryConfig}
                onBotConfigChange={setBotConfig}
                onNext={handleNext}
              />
            )}

            {currentStep === 2 && (
              <Step2ApiProfiles
                apiProfiles={apiProfiles}
                onChange={setApiProfiles}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            )}

            {currentStep === 3 && (
              <Step3Commands
                commands={commands}
                apiProfiles={apiProfiles}
                onChange={setCommands}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            )}

            {currentStep === 4 && (
              <Step4Review
                repositoryConfig={repositoryConfig}
                botConfig={botConfig}
                apiProfiles={apiProfiles}
                commands={commands}
                onPrev={handlePrev}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

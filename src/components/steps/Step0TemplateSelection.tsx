'use client';

import { useState } from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import Box from '@cloudscape-design/components/box';
import Cards from '@cloudscape-design/components/cards';
import Badge from '@cloudscape-design/components/badge';
import { BiSolidDog } from 'react-icons/bi';
import { MdSentimentVerySatisfied } from 'react-icons/md';
import { MdHelpOutline } from 'react-icons/md';
import { FaGithub } from 'react-icons/fa';
import { IoGameController } from 'react-icons/io5';
import { MdWavingHand } from 'react-icons/md';
import { MdStar } from 'react-icons/md';
import { BOT_TEMPLATES, BotTemplate } from '@/lib/templates';

interface Step0TemplateSelectionProps {
  onTemplateSelect: (template: BotTemplate) => void;
  onSkip: () => void;
}

const getIconComponent = (iconName?: string): React.ComponentType<any> | null => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    'Dog': BiSolidDog,
    'Laugh': MdSentimentVerySatisfied,
    'HelpCircle': MdHelpOutline,
    'Github': FaGithub,
    'Gamepad2': IoGameController,
    'HandOpen': MdWavingHand,
  };
  return iconName ? iconMap[iconName] || null : null;
};

const getDifficultyStars = (difficulty: BotTemplate['difficulty']): number => {
  switch (difficulty) {
    case 'beginner':
      return 1;
    case 'intermediate':
      return 2;
    case 'advanced':
      return 3;
    default:
      return 1;
  }
};

export function Step0TemplateSelection({ onTemplateSelect, onSkip }: Step0TemplateSelectionProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<BotTemplate | null>(null);


  return (
    <Container
      header={
        <Header
          variant="h2"
          description="ボットテンプレートから始めることで、素早くボットを作成できます。テンプレートをカスタマイズして、あなたのニーズに合わせたボットを作りましょう。"
        >
          テンプレートを選択
        </Header>
      }
    >
      <SpaceBetween size="l">
        {/* テンプレートカード */}
        <Cards
          cardDefinition={{
            header: (template) => {
              const IconComponent = getIconComponent(template.icon);
              return (
                <div className="flex items-center gap-2">
                  {IconComponent && <IconComponent className="w-8 h-8" style={{ color: 'var(--primary)' }} />}
                  <span className="font-bold text-lg">{template.name}</span>
                </div>
              );
            },
            sections: [
              {
                id: 'description',
                content: (template) => <Box variant="p">{template.description}</Box>,
              },
              {
                id: 'details',
                content: (template) => (
                  <div className="flex flex-col gap-3 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">難易度:</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 3 }).map((_, i) => {
                          const isFilled = i < getDifficultyStars(template.difficulty);
                          return (
                            <MdStar
                              key={i}
                              className="w-5 h-5 transition-all"
                              style={{
                                color: isFilled ? 'var(--primary)' : 'rgba(0, 0, 0, 0.15)',
                                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {template.commands.length > 0 && (
                        <Badge color="blue">{template.commands.length} コマンド</Badge>
                      )}
                      {template.apiProfiles.length > 0 && (
                        <Badge color="green">{template.apiProfiles.length} API</Badge>
                      )}
                    </div>
                  </div>
                ),
              },
            ],
          }}
          items={BOT_TEMPLATES}
          selectionType="single"
          selectedItems={selectedTemplate ? [selectedTemplate] : []}
          onSelectionChange={({ detail }) => {
            setSelectedTemplate(detail.selectedItems[0] || null);
          }}
          cardsPerRow={[{ cards: 1 }, { minWidth: 500, cards: 2 }, { minWidth: 800, cards: 3 }]}
          empty={
            <Box textAlign="center" color="inherit">
              <Box padding={{ bottom: 's' }} variant="p" color="inherit">
                <b>テンプレートが見つかりません</b>
              </Box>
              <Box variant="p" color="inherit">
                別のカテゴリを選択してください。
              </Box>
            </Box>
          }
        />

        {/* アクションボタン */}
        <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: 'var(--color-border-divider-default)' }}>
          <Button variant="link" onClick={onSkip}>
            スキップ（空のプロジェクト）
          </Button>

          <Button
            variant="primary"
            disabled={!selectedTemplate}
            onClick={() => {
              if (selectedTemplate) {
                onTemplateSelect(selectedTemplate);
              }
            }}
          >
            このテンプレートを使用
          </Button>
        </div>
      </SpaceBetween>
    </Container>
  );
}

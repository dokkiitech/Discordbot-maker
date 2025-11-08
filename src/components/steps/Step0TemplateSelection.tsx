'use client';

import { useState } from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import Box from '@cloudscape-design/components/box';
import Grid from '@cloudscape-design/components/grid';
import Cards from '@cloudscape-design/components/cards';
import Badge from '@cloudscape-design/components/badge';
import { BOT_TEMPLATES, BotTemplate } from '@/lib/templates';

interface Step0TemplateSelectionProps {
  onTemplateSelect: (template: BotTemplate) => void;
  onSkip: () => void;
}

export function Step0TemplateSelection({ onTemplateSelect, onSkip }: Step0TemplateSelectionProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<BotTemplate | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredTemplates =
    filterCategory === 'all'
      ? BOT_TEMPLATES
      : BOT_TEMPLATES.filter((t) => t.category === filterCategory);

  const getDifficultyColor = (difficulty: BotTemplate['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'green';
      case 'intermediate':
        return 'blue';
      case 'advanced':
        return 'red';
      default:
        return 'grey';
    }
  };

  const getCategoryLabel = (category: BotTemplate['category']) => {
    switch (category) {
      case 'utility':
        return 'ユーティリティ';
      case 'fun':
        return '娯楽';
      case 'info':
        return '情報';
      case 'custom':
        return 'カスタム';
      default:
        return category;
    }
  };

  const getDifficultyLabel = (difficulty: BotTemplate['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return '初心者';
      case 'intermediate':
        return '中級';
      case 'advanced':
        return '上級';
      default:
        return difficulty;
    }
  };

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
        {/* カテゴリフィルター */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterCategory === 'all' ? 'primary' : 'normal'}
            onClick={() => setFilterCategory('all')}
          >
            すべて
          </Button>
          <Button
            variant={filterCategory === 'fun' ? 'primary' : 'normal'}
            onClick={() => setFilterCategory('fun')}
          >
            🎮 娯楽
          </Button>
          <Button
            variant={filterCategory === 'info' ? 'primary' : 'normal'}
            onClick={() => setFilterCategory('info')}
          >
            📚 情報
          </Button>
          <Button
            variant={filterCategory === 'utility' ? 'primary' : 'normal'}
            onClick={() => setFilterCategory('utility')}
          >
            🔧 ユーティリティ
          </Button>
          <Button
            variant={filterCategory === 'custom' ? 'primary' : 'normal'}
            onClick={() => setFilterCategory('custom')}
          >
            📝 カスタム
          </Button>
        </div>

        {/* テンプレートカード */}
        <Cards
          cardDefinition={{
            header: (template) => (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{template.icon}</span>
                <span className="font-bold text-lg">{template.name}</span>
              </div>
            ),
            sections: [
              {
                id: 'description',
                content: (template) => <Box variant="p">{template.description}</Box>,
              },
              {
                id: 'details',
                content: (template) => (
                  <div className="flex gap-2 flex-wrap mt-2">
                    <Badge color={getDifficultyColor(template.difficulty)}>
                      {getDifficultyLabel(template.difficulty)}
                    </Badge>
                    <Badge>{getCategoryLabel(template.category)}</Badge>
                    {template.commands.length > 0 && (
                      <Badge color="blue">{template.commands.length} コマンド</Badge>
                    )}
                    {template.apiProfiles.length > 0 && (
                      <Badge color="green">{template.apiProfiles.length} API</Badge>
                    )}
                  </div>
                ),
              },
              {
                id: 'tags',
                content: (template) => (
                  <div className="flex gap-1 flex-wrap mt-2">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: 'var(--color-background-control-disabled)',
                          color: 'var(--color-text-body-secondary)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ),
              },
            ],
          }}
          items={filteredTemplates}
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

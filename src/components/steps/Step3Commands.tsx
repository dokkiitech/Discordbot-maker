'use client';

import { useState } from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import Textarea from '@cloudscape-design/components/textarea';
import Button from '@cloudscape-design/components/button';
import Form from '@cloudscape-design/components/form';
import Box from '@cloudscape-design/components/box';
import Alert from '@cloudscape-design/components/alert';
import type { SlashCommand, ApiProfile } from '@/lib/types';
import { ResponseType } from '@/lib/types';

interface Step3CommandsProps {
  commands: SlashCommand[];
  apiProfiles: ApiProfile[];
  onChange: (commands: SlashCommand[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step3Commands({
  commands,
  apiProfiles,
  onChange,
  onNext,
  onPrev,
}: Step3CommandsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SlashCommand>>({
    name: '',
    description: '',
    responseType: ResponseType.STATIC_TEXT,
    staticText: '',
    apiProfileId: '',
    apiEndpoint: '',
    codeSnippet: '',
    options: [],
  });

  // コマンドオプション編集用の状態
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
  const [optionFormData, setOptionFormData] = useState<{
    name: string;
    description: string;
    type: 'string' | 'integer' | 'boolean' | 'user' | 'channel' | 'role';
    required: boolean;
  }>({
    name: '',
    description: '',
    type: 'string',
    required: false,
  });

  const handleAdd = () => {
    const newCommand: SlashCommand = {
      id: Date.now().toString(),
      name: formData.name!,
      description: formData.description!,
      responseType: formData.responseType!,
      staticText: formData.staticText,
      apiProfileId: formData.apiProfileId,
      apiEndpoint: formData.apiEndpoint,
      codeSnippet: formData.codeSnippet,
      options: formData.options || [],
    };

    onChange([...commands, newCommand]);
    setIsAdding(false);
    resetForm();
  };

  const handleUpdate = (id: string) => {
    onChange(
      commands.map((cmd) =>
        cmd.id === id ? { ...cmd, ...formData } : cmd
      )
    );
    setEditingId(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    onChange(commands.filter((cmd) => cmd.id !== id));
  };

  const startEdit = (command: SlashCommand) => {
    setEditingId(command.id);
    setFormData(command);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      responseType: ResponseType.STATIC_TEXT,
      staticText: '',
      apiProfileId: '',
      apiEndpoint: '',
      codeSnippet: '',
      options: [],
    });
  };

  // コマンドオプション関連の関数
  const handleAddOption = () => {
    const currentOptions = formData.options || [];
    setFormData({
      ...formData,
      options: [...currentOptions, optionFormData],
    });
    setIsAddingOption(false);
    resetOptionForm();
  };

  const handleUpdateOption = (index: number) => {
    const currentOptions = formData.options || [];
    const updatedOptions = currentOptions.map((opt, i) =>
      i === index ? optionFormData : opt
    );
    setFormData({
      ...formData,
      options: updatedOptions,
    });
    setEditingOptionIndex(null);
    resetOptionForm();
  };

  const handleDeleteOption = (index: number) => {
    const currentOptions = formData.options || [];
    setFormData({
      ...formData,
      options: currentOptions.filter((_, i) => i !== index),
    });
  };

  const startEditOption = (index: number) => {
    const option = formData.options?.[index];
    if (option) {
      setEditingOptionIndex(index);
      setOptionFormData(option);
    }
  };

  const cancelEditOption = () => {
    setEditingOptionIndex(null);
    setIsAddingOption(false);
    resetOptionForm();
  };

  const resetOptionForm = () => {
    setOptionFormData({
      name: '',
      description: '',
      type: 'string',
      required: false,
    });
  };

  const responseTypeOptions = [
    { value: ResponseType.STATIC_TEXT, label: '静的テキスト' },
    { value: ResponseType.API_CALL, label: 'API利用' },
  ];

  const optionTypeOptions = [
    { value: 'string' as const, label: '文字列' },
    { value: 'integer' as const, label: '整数' },
    { value: 'boolean' as const, label: '真偽値' },
    { value: 'user' as const, label: 'ユーザー' },
    { value: 'channel' as const, label: 'チャンネル' },
    { value: 'role' as const, label: 'ロール' },
  ];

  const renderOptionForm = (isEdit: boolean, optionIndex?: number) => (
    <SpaceBetween size="m">
      <FormField
        label="オプション名"
        description="小文字、数字、ハイフン、アンダースコアのみ"
      >
        <Input
          value={optionFormData.name || ''}
          onChange={({ detail }) => setOptionFormData({ ...optionFormData, name: detail.value })}
          placeholder="zipcode"
        />
      </FormField>

      <FormField label="説明">
        <Input
          value={optionFormData.description || ''}
          onChange={({ detail }) => setOptionFormData({ ...optionFormData, description: detail.value })}
          placeholder="郵便番号を入力してください"
        />
      </FormField>

      <FormField label="型">
        <Select
          selectedOption={optionTypeOptions.find(o => o.value === optionFormData.type) || optionTypeOptions[0]}
          onChange={({ detail }) => setOptionFormData({ ...optionFormData, type: detail.selectedOption.value as 'string' | 'integer' | 'boolean' | 'user' | 'channel' | 'role' })}
          options={optionTypeOptions}
        />
      </FormField>

      <FormField label="必須">
        <Select
          selectedOption={
            optionFormData.required
              ? { value: 'true', label: '必須' }
              : { value: 'false', label: '任意' }
          }
          onChange={({ detail }) => setOptionFormData({ ...optionFormData, required: detail.selectedOption.value === 'true' })}
          options={[
            { value: 'true', label: '必須' },
            { value: 'false', label: '任意' },
          ]}
        />
      </FormField>

      <SpaceBetween direction="horizontal" size="xs">
        <Button
          onClick={() => (isEdit && optionIndex !== undefined ? handleUpdateOption(optionIndex) : handleAddOption())}
          disabled={!optionFormData.name || !optionFormData.description}
        >
          {isEdit ? '保存' : '追加'}
        </Button>
        <Button variant="link" onClick={cancelEditOption}>
          キャンセル
        </Button>
      </SpaceBetween>
    </SpaceBetween>
  );

  const renderCommandForm = (isEdit: boolean, commandId?: string) => (
    <SpaceBetween size="m">
      <FormField
        label="コマンド名"
        description="小文字、数字、ハイフン、アンダースコアのみ"
      >
        <Input
          value={formData.name || ''}
          onChange={({ detail }) => setFormData({ ...formData, name: detail.value })}
          placeholder="weather"
        />
      </FormField>

      <FormField label="説明">
        <Input
          value={formData.description || ''}
          onChange={({ detail }) => setFormData({ ...formData, description: detail.value })}
          placeholder="天気情報を取得します"
        />
      </FormField>

      {/* コマンドオプション一覧 */}
      <FormField
        label="コマンドオプション（引数）"
        description="スラッシュコマンドに渡すパラメータを定義します。例: /weather zipcode:1000001"
      >
        <SpaceBetween size="s">
          {/* 既存のオプション一覧 */}
          {formData.options && formData.options.length > 0 && (
            <SpaceBetween size="xs">
              {formData.options.map((option, index) => (
                <Container key={index}>
                  {editingOptionIndex === index ? (
                    renderOptionForm(true, index)
                  ) : (
                    <div className="flex items-start justify-between">
                      <SpaceBetween size="xs">
                        <Box variant="h4">{option.name}</Box>
                        <Box variant="p" color="text-body-secondary">{option.description}</Box>
                        <Box fontSize="body-s" color="text-status-inactive">
                          型: {optionTypeOptions.find(o => o.value === option.type)?.label} | {option.required ? '必須' : '任意'}
                        </Box>
                      </SpaceBetween>
                      <SpaceBetween direction="horizontal" size="xs">
                        <Button
                          variant="icon"
                          iconName="edit"
                          onClick={() => startEditOption(index)}
                        />
                        <Button
                          variant="icon"
                          iconName="remove"
                          onClick={() => handleDeleteOption(index)}
                        />
                      </SpaceBetween>
                    </div>
                  )}
                </Container>
              ))}
            </SpaceBetween>
          )}

          {/* オプション新規追加フォーム */}
          {isAddingOption && (
            <Container>
              <SpaceBetween size="m">
                <Header variant="h3">新しいオプション</Header>
                {renderOptionForm(false)}
              </SpaceBetween>
            </Container>
          )}

          {/* オプション追加ボタン */}
          {!isAddingOption && editingOptionIndex === null && (
            <Button
              variant="normal"
              iconName="add-plus"
              onClick={() => setIsAddingOption(true)}
            >
              オプションを追加
            </Button>
          )}
        </SpaceBetween>
      </FormField>

      <FormField label="応答タイプ">
        <Select
          selectedOption={responseTypeOptions.find(o => o.value === formData.responseType) || responseTypeOptions[0]}
          onChange={({ detail }) => setFormData({ ...formData, responseType: detail.selectedOption.value as ResponseType })}
          options={responseTypeOptions}
        />
      </FormField>

      {formData.responseType === ResponseType.STATIC_TEXT && (
        <FormField label="応答テキスト">
          <Textarea
            value={formData.staticText || ''}
            onChange={({ detail }) => setFormData({ ...formData, staticText: detail.value })}
            placeholder="こんにちは！これは静的な応答です。"
            rows={3}
          />
        </FormField>
      )}

      {formData.responseType === ResponseType.API_CALL && (
        <>
          <FormField label="使用するAPIプロファイル">
            <Select
              selectedOption={
                formData.apiProfileId
                  ? { value: formData.apiProfileId, label: apiProfiles.find(p => p.id === formData.apiProfileId)?.name || '' }
                  : { value: '', label: 'APIプロファイルを選択' }
              }
              onChange={({ detail }) => setFormData({ ...formData, apiProfileId: detail.selectedOption.value! })}
              options={[
                { value: '', label: 'APIプロファイルを選択' },
                ...apiProfiles.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
          </FormField>

          <FormField
            label="APIエンドポイント"
            description="ベースURLからの相対パス。変数は{変数名}で指定。例: weather?zip={zipcode}"
          >
            <Input
              value={formData.apiEndpoint || ''}
              onChange={({ detail }) => setFormData({ ...formData, apiEndpoint: detail.value })}
              placeholder="weather?zip={zipcode}"
            />
          </FormField>

          <FormField
            label="カスタムロジック（オプション）"
            description="JavaScriptコード。apiResponseオブジェクトとinteraction.options（コマンドオプションの値）が利用可能"
          >
            <Textarea
              value={formData.codeSnippet || ''}
              onChange={({ detail }) => setFormData({ ...formData, codeSnippet: detail.value })}
              placeholder={`// API応答を処理してDiscord応答を返す
// コマンドオプションの値: interaction.options.getString('zipcode')
const data = await apiResponse.json();
return {
  content: \`現在の気温: \${data.main.temp}°C\`
};`}
              rows={8}
            />
          </FormField>
        </>
      )}

      <SpaceBetween direction="horizontal" size="xs">
        <Button
          onClick={() => (isEdit && commandId ? handleUpdate(commandId) : handleAdd())}
          disabled={!formData.name || !formData.description}
        >
          {isEdit ? '保存' : '追加'}
        </Button>
        <Button variant="link" onClick={cancelEdit}>
          キャンセル
        </Button>
      </SpaceBetween>
    </SpaceBetween>
  );

  return (
    <Form
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          <Button variant="link" onClick={onPrev}>
            戻る
          </Button>
          <Button variant="primary" onClick={onNext} disabled={commands.length === 0}>
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
              description="Botが応答するスラッシュコマンドを追加してください"
            >
              ステップ 3: スラッシュコマンド定義
            </Header>
          }
        >
          <SpaceBetween size="l">
            {/* 既存のコマンド一覧 */}
            {commands.map((command) => (
              <Container key={command.id}>
                {editingId === command.id ? (
                  renderCommandForm(true, command.id)
                ) : (
                  <div className="flex items-start justify-between">
                    <SpaceBetween size="xs">
                      <Box variant="h3">/{command.name}</Box>
                      <Box variant="p" color="text-body-secondary">{command.description}</Box>
                      {command.options && command.options.length > 0 && (
                        <Box fontSize="body-s" color="text-status-info">
                          オプション: {command.options.map(o => `${o.name} (${o.type})`).join(', ')}
                        </Box>
                      )}
                      <Box fontSize="body-s" color="text-status-inactive">
                        応答: {responseTypeOptions.find(o => o.value === command.responseType)?.label}
                      </Box>
                      {command.responseType === ResponseType.API_CALL && command.apiProfileId && (
                        <Box fontSize="body-s" color="text-status-info">
                          API: {apiProfiles.find(p => p.id === command.apiProfileId)?.name}
                        </Box>
                      )}
                    </SpaceBetween>
                    <SpaceBetween direction="horizontal" size="xs">
                      <Button
                        variant="icon"
                        iconName="edit"
                        onClick={() => startEdit(command)}
                      />
                      <Button
                        variant="icon"
                        iconName="remove"
                        onClick={() => handleDelete(command.id)}
                      />
                    </SpaceBetween>
                  </div>
                )}
              </Container>
            ))}

            {/* 新規追加フォーム */}
            {isAdding && (
              <Container>
                <SpaceBetween size="m">
                  <Header variant="h3">新しいコマンド</Header>
                  {renderCommandForm(false)}
                </SpaceBetween>
              </Container>
            )}

            {/* 追加ボタン */}
            {!isAdding && !editingId && (
              <Button
                variant="normal"
                iconName="add-plus"
                onClick={() => setIsAdding(true)}
                fullWidth
              >
                コマンドを追加
              </Button>
            )}

            {commands.length === 0 && !isAdding && (
              <Alert type="info">
                まだコマンドが追加されていません。上のボタンから追加してください。
              </Alert>
            )}
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </Form>
  );
}

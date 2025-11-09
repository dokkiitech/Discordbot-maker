'use client';

import { useState, Suspense, lazy } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import SegmentedControl from '@cloudscape-design/components/segmented-control';
import Modal from '@cloudscape-design/components/modal';
import type { SlashCommand, ApiProfile, ApiTestResult, FieldMapping, CommandOption } from '@/lib/types';
import { ResponseType } from '@/lib/types';
import { ResponseTemplate, generateCustomLogic } from '@/lib/code-generator';
import { getSelectableFields } from '@/lib/api-response-parser';
import { GlossaryTerm } from '@/components/ui/GlossaryTooltip';

// コマンドフォーム用スキーマ（条件付きバリデーション）
const CommandFormSchema = z.object({
  name: z.string()
    .min(1, '⚠️ これは必須の項目です')
    .regex(/^[a-z0-9_-]+$/, 'コマンド名は小文字、数字、ハイフン、アンダースコアのみ使用できます'),
  description: z.string()
    .min(1, '⚠️ これは必須の項目です')
    .max(100, '説明は100文字以内にしてください'),
  responseType: z.nativeEnum(ResponseType),
  staticText: z.string().optional(),
  apiProfileId: z.string().optional(),
  apiEndpoint: z.string().optional(),
  codeSnippet: z.string().optional(),
  options: z.array(z.custom<CommandOption>()).optional(),
}).superRefine((data, ctx) => {
  // STATIC_TEXTの場合、staticTextが必須
  if (data.responseType === ResponseType.STATIC_TEXT) {
    if (!data.staticText || data.staticText.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '応答テキストを入力してください',
        path: ['staticText'],
      });
    }
  }

  // API_CALLの場合、apiProfileIdとapiEndpointが必須
  if (data.responseType === ResponseType.API_CALL) {
    if (!data.apiProfileId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'APIプロファイルを選択してください',
        path: ['apiProfileId'],
      });
    }
    if (!data.apiEndpoint || data.apiEndpoint.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'APIエンドポイントを入力してください',
        path: ['apiEndpoint'],
      });
    }
  }
});

type CommandFormData = z.infer<typeof CommandFormSchema>;

// コマンドオプションフォーム用スキーマ
const CommandOptionFormSchema = z.object({
  name: z.string().min(1, '⚠️ これは必須の項目です'),
  description: z.string().min(1, '⚠️ これは必須の項目です'),
  type: z.enum(['string', 'integer', 'boolean', 'user', 'channel', 'role']),
  required: z.boolean(),
});

type CommandOptionFormData = z.infer<typeof CommandOptionFormSchema>;

// ReactFlowEditorを動的にインポート（クライアントサイドのみ）
const ReactFlowEditor = lazy(() => import('@/components/reactflow/ReactFlowEditor').then(mod => ({ default: mod.ReactFlowEditor })));

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
  const [editorMode, setEditorMode] = useState<'form' | 'visual'>('form');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // コマンドフォーム用のreact-hook-form
  const {
    handleSubmit: handleCommandSubmit,
    control: commandControl,
    reset: resetCommand,
    formState: { errors: commandErrors },
    watch: watchCommand,
    setValue: setCommandValue,
    getValues: getCommandValues,
  } = useForm<CommandFormData>({
    resolver: zodResolver(CommandFormSchema),
    defaultValues: {
      name: '',
      description: '',
      responseType: ResponseType.STATIC_TEXT,
      staticText: '',
      apiProfileId: '',
      apiEndpoint: '',
      codeSnippet: '',
      options: [],
    },
  });

  const responseType = watchCommand('responseType');
  const currentOptions = watchCommand('options');

  // コマンドオプションフォーム用のreact-hook-form
  const {
    handleSubmit: handleOptionSubmit,
    control: optionControl,
    reset: resetOption,
    formState: { errors: optionErrors },
  } = useForm<CommandOptionFormData>({
    resolver: zodResolver(CommandOptionFormSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'string',
      required: false,
    },
  });

  // APIテスト用のstate
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ApiTestResult | null>(null);
  const [showFieldSelector, setShowFieldSelector] = useState(false);
  const [selectedFields, setSelectedFields] = useState<FieldMapping[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ResponseTemplate>(ResponseTemplate.SIMPLE_TEXT);

  // コマンドオプション編集用の状態
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);

  const onSubmitAdd = (data: CommandFormData) => {
    const newCommand: SlashCommand = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
      responseType: data.responseType,
      staticText: data.staticText,
      apiProfileId: data.apiProfileId,
      apiEndpoint: data.apiEndpoint,
      codeSnippet: data.codeSnippet,
      options: data.options || [],
      autoGeneratedCode: false,
    };

    onChange([...commands, newCommand]);
    setIsAdding(false);
    resetCommand();
  };

  const onSubmitUpdate = (id: string) => (data: CommandFormData) => {
    onChange(
      commands.map((cmd) =>
        cmd.id === id
          ? {
              ...cmd,
              name: data.name,
              description: data.description,
              responseType: data.responseType,
              staticText: data.staticText,
              apiProfileId: data.apiProfileId,
              apiEndpoint: data.apiEndpoint,
              codeSnippet: data.codeSnippet,
              options: data.options || [],
            }
          : cmd
      )
    );
    setEditingId(null);
    resetCommand();
  };

  const handleDelete = (id: string) => {
    onChange(commands.filter((cmd) => cmd.id !== id));
  };

  const startEdit = (command: SlashCommand) => {
    setEditingId(command.id);
    resetCommand({
      name: command.name,
      description: command.description,
      responseType: command.responseType,
      staticText: command.staticText,
      apiProfileId: command.apiProfileId,
      apiEndpoint: command.apiEndpoint,
      codeSnippet: command.codeSnippet,
      options: command.options || [],
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    resetCommand();
  };

  const handleCommandFormSubmitWithScroll = handleCommandSubmit(
    (data) => {
      if (editingId) {
        onSubmitUpdate(editingId)(data);
      } else {
        onSubmitAdd(data);
      }
    },
    () => {
      // エラーがある場合、フォームにスクロール
      setTimeout(() => {
        const formElement = document.querySelector('form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 0);
    }
  );

  // コマンドオプション関連の関数
  const onSubmitAddOption = (data: CommandOptionFormData) => {
    const opts = currentOptions || [];
    setCommandValue('options', [...opts, data]);
    setIsAddingOption(false);
    resetOption();
  };

  const onSubmitUpdateOption = (index: number) => (data: CommandOptionFormData) => {
    const opts = currentOptions || [];
    const updatedOptions = opts.map((opt, i) =>
      i === index ? data : opt
    );
    setCommandValue('options', updatedOptions);
    setEditingOptionIndex(null);
    resetOption();
  };

  const handleDeleteOption = (index: number) => {
    const opts = currentOptions || [];
    setCommandValue('options', opts.filter((_, i) => i !== index));
  };

  const startEditOption = (index: number) => {
    const option = currentOptions?.[index];
    if (option) {
      setEditingOptionIndex(index);
      resetOption({
        name: option.name,
        description: option.description,
        type: option.type,
        required: option.required,
      });
    }
  };

  const cancelEditOption = () => {
    setEditingOptionIndex(null);
    setIsAddingOption(false);
    resetOption();
  };

  const handleOptionFormSubmitWithScroll = handleOptionSubmit(
    (data) => {
      if (editingOptionIndex !== null) {
        onSubmitUpdateOption(editingOptionIndex)(data);
      } else {
        onSubmitAddOption(data);
      }
    },
    () => {
      // エラーがある場合、フォームにスクロール
      setTimeout(() => {
        const formElement = document.querySelector('form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 0);
    }
  );

  // APIテストハンドラー
  const handleTestApi = async () => {
    const formValues = getCommandValues();
    if (!formValues.apiProfileId || !formValues.apiEndpoint) {
      alert('APIプロファイルとエンドポイントを入力してください');
      return;
    }

    const selectedProfile = apiProfiles.find(p => p.id === formValues.apiProfileId);
    if (!selectedProfile) {
      alert('選択されたAPIプロファイルが見つかりません');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/test-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiProfile: selectedProfile,
          endpoint: formValues.apiEndpoint,
          testParams: {},
        }),
      });

      const result: ApiTestResult = await response.json();
      setTestResult(result);

      if (result.success && result.fields) {
        // 自動的にフィールドマッピングを作成（すべてのプリミティブ型フィールドをデフォルト選択）
        const selectableFields = getSelectableFields(result.fields);
        const defaultMappings: FieldMapping[] = selectableFields.map(field => ({
          fieldPath: field.path,
          displayLabel: field.path.split('.').pop() || field.path,
          formatString: '{value}',
        }));
        setSelectedFields(defaultMappings);
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        timestamp: new Date(),
        error: error.message || 'APIテストに失敗しました',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // コード自動生成ハンドラー
  const handleGenerateCode = () => {
    if (selectedFields.length === 0) {
      alert('フィールドを選択してください');
      return;
    }

    const generatedCode = generateCustomLogic(selectedFields, selectedTemplate);
    setCommandValue('codeSnippet', generatedCode);
    setShowFieldSelector(false);
  };

  // フィールド選択のトグル
  const toggleFieldSelection = (fieldPath: string) => {
    setSelectedFields(prev => {
      const exists = prev.find(f => f.fieldPath === fieldPath);
      if (exists) {
        return prev.filter(f => f.fieldPath !== fieldPath);
      } else {
        return [...prev, {
          fieldPath,
          displayLabel: fieldPath.split('.').pop() || fieldPath,
          formatString: '{value}',
        }];
      }
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
      <Controller
        name="name"
        control={optionControl}
        render={({ field }) => (
          <FormField
            label="オプション名"
            description="小文字、数字、ハイフン、アンダースコアのみ"
            errorText={optionErrors.name?.message}
          >
            <Input
              value={field.value}
              onChange={({ detail }) => field.onChange(detail.value)}
              placeholder="zipcode"
            />
          </FormField>
        )}
      />

      <Controller
        name="description"
        control={optionControl}
        render={({ field }) => (
          <FormField label="説明" errorText={optionErrors.description?.message}>
            <Input
              value={field.value}
              onChange={({ detail }) => field.onChange(detail.value)}
              placeholder="郵便番号を入力してください"
            />
          </FormField>
        )}
      />

      <Controller
        name="type"
        control={optionControl}
        render={({ field }) => (
          <FormField label="型">
            <Select
              selectedOption={optionTypeOptions.find(o => o.value === field.value) || optionTypeOptions[0]}
              onChange={({ detail }) => field.onChange(detail.selectedOption.value as 'string' | 'integer' | 'boolean' | 'user' | 'channel' | 'role')}
              options={optionTypeOptions}
            />
          </FormField>
        )}
      />

      <Controller
        name="required"
        control={optionControl}
        render={({ field }) => (
          <FormField label="必須">
            <Select
              selectedOption={
                field.value
                  ? { value: 'true', label: '必須' }
                  : { value: 'false', label: '任意' }
              }
              onChange={({ detail }) => field.onChange(detail.selectedOption.value === 'true')}
              options={[
                { value: 'true', label: '必須' },
                { value: 'false', label: '任意' },
              ]}
            />
          </FormField>
        )}
      />

      <SpaceBetween direction="horizontal" size="xs">
        <Button onClick={() => handleOptionFormSubmitWithScroll()}>
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
      <Controller
        name="name"
        control={commandControl}
        render={({ field }) => (
          <FormField
            label="コマンド名"
            description="小文字、数字、ハイフン、アンダースコアのみ"
            errorText={commandErrors.name?.message}
          >
            <Input
              value={field.value}
              onChange={({ detail }) => field.onChange(detail.value)}
              placeholder="weather"
            />
          </FormField>
        )}
      />

      <Controller
        name="description"
        control={commandControl}
        render={({ field }) => (
          <FormField label="説明" errorText={commandErrors.description?.message}>
            <Input
              value={field.value}
              onChange={({ detail }) => field.onChange(detail.value)}
              placeholder="天気情報を取得します"
            />
          </FormField>
        )}
      />

      {/* コマンドオプション一覧 */}
      <FormField
        label="コマンドオプション（引数）"
        description="スラッシュコマンドに渡すパラメータを定義します。例: /weather zipcode:1000001"
      >
        <SpaceBetween size="s">
          {/* 既存のオプション一覧 */}
          {currentOptions && currentOptions.length > 0 && (
            <SpaceBetween size="xs">
              {currentOptions.map((option, index) => (
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

      <Controller
        name="responseType"
        control={commandControl}
        render={({ field }) => (
          <FormField label="応答タイプ">
            <Select
              selectedOption={responseTypeOptions.find(o => o.value === field.value) || responseTypeOptions[0]}
              onChange={({ detail }) => field.onChange(detail.selectedOption.value as ResponseType)}
              options={responseTypeOptions}
            />
          </FormField>
        )}
      />

      {responseType === ResponseType.STATIC_TEXT && (
        <Controller
          name="staticText"
          control={commandControl}
          render={({ field }) => (
            <FormField label="応答テキスト" errorText={commandErrors.staticText?.message}>
              <Textarea
                value={field.value || ''}
                onChange={({ detail }) => field.onChange(detail.value)}
                placeholder="こんにちは！これは静的な応答です。"
                rows={3}
              />
            </FormField>
          )}
        />
      )}

      {responseType === ResponseType.API_CALL && (
        <>
          <Controller
            name="apiProfileId"
            control={commandControl}
            render={({ field }) => (
              <FormField
                label={
                  <>
                    使用する<GlossaryTerm termKey="apiProfile">APIプロファイル</GlossaryTerm>
                  </>
                }
                errorText={commandErrors.apiProfileId?.message}
              >
                <Select
                  selectedOption={
                    field.value
                      ? { value: field.value, label: apiProfiles.find(p => p.id === field.value)?.name || '' }
                      : { value: '', label: 'APIプロファイルを選択' }
                  }
                  onChange={({ detail }) => field.onChange(detail.selectedOption.value)}
                  options={[
                    { value: '', label: 'APIプロファイルを選択' },
                    ...apiProfiles.map((p) => ({ value: p.id, label: p.name })),
                  ]}
                />
              </FormField>
            )}
          />

          <Controller
            name="apiEndpoint"
            control={commandControl}
            render={({ field }) => (
              <FormField
                label={
                  <>
                    <GlossaryTerm termKey="apiEndpoint">APIエンドポイント</GlossaryTerm>
                  </>
                }
                description="ベースURLからの相対パス。変数は{変数名}で指定。例: weather?zip={zipcode}"
                errorText={commandErrors.apiEndpoint?.message}
              >
                <Input
                  value={field.value || ''}
                  onChange={({ detail }) => field.onChange(detail.value)}
                  placeholder="weather?zip={zipcode}"
                />
              </FormField>
            )}
          />

          {/* APIテストボタン */}
          <FormField>
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                onClick={handleTestApi}
                disabled={isTesting || !getCommandValues().apiProfileId || !getCommandValues().apiEndpoint}
                loading={isTesting}
              >
                {isTesting ? 'テスト中...' : 'APIをテスト'}
              </Button>
              {testResult && testResult.success && (
                <Button
                  onClick={() => setShowFieldSelector(true)}
                  variant="primary"
                >
                  コードを自動生成
                </Button>
              )}
            </SpaceBetween>
          </FormField>

          {/* テスト結果の表示 */}
          {testResult && (
            <Alert
              type={testResult.success ? 'success' : 'error'}
              header={testResult.success ? 'APIテスト成功' : 'APIテストエラー'}
            >
              {testResult.success ? (
                <div>
                  <div>ステータスコード: {testResult.statusCode}</div>
                  {testResult.fields && (
                    <div>{testResult.fields.length}個のフィールドを検出しました</div>
                  )}
                </div>
              ) : (
                <div>{testResult.error}</div>
              )}
            </Alert>
          )}

          <Controller
            name="codeSnippet"
            control={commandControl}
            render={({ field }) => (
              <FormField
                label="カスタムロジック（オプション）"
                description="JavaScriptコード。apiResponseオブジェクトとinteraction.options（コマンドオプションの値）が利用可能"
              >
                <Textarea
                  value={field.value || ''}
                  onChange={({ detail }) => field.onChange(detail.value)}
                  placeholder={`// API応答を処理してDiscord応答を返す
// コマンドオプションの値: interaction.options.getString('zipcode')
const data = await apiResponse.json();
return {
  content: \`現在の気温: \${data.main.temp}°C\`
};`}
                  rows={8}
                />
              </FormField>
            )}
          />
        </>
      )}

      {/* フィールド選択モーダル */}
      <Modal
        visible={showFieldSelector}
        onDismiss={() => setShowFieldSelector(false)}
        header="フィールドを選択してコードを生成"
        size="large"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowFieldSelector(false)}>
                キャンセル
              </Button>
              <Button
                variant="primary"
                onClick={handleGenerateCode}
                disabled={selectedFields.length === 0}
              >
                コードを生成 ({selectedFields.length}個選択)
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        {testResult && testResult.fields && (
          <SpaceBetween size="m">
            <FormField label="テンプレート">
              <Select
                selectedOption={{ value: selectedTemplate, label: selectedTemplate }}
                onChange={({ detail }) => setSelectedTemplate(detail.selectedOption.value as ResponseTemplate)}
                options={[
                  { value: ResponseTemplate.SIMPLE_TEXT, label: 'シンプルテキスト - 1行表示' },
                  { value: ResponseTemplate.MULTI_LINE, label: '複数行 - 改行して見やすく' },
                  { value: ResponseTemplate.EMBED, label: 'Embed - リッチな見た目' },
                  { value: ResponseTemplate.JSON_FORMATTED, label: 'JSON - 開発者向け' },
                ]}
              />
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                {selectedTemplate === ResponseTemplate.SIMPLE_TEXT && '💡 1行で複数項目を表示。簡潔な情報向け'}
                {selectedTemplate === ResponseTemplate.MULTI_LINE && '💡 各項目を改行表示。バランスが良く読みやすい ⭐おすすめ'}
                {selectedTemplate === ResponseTemplate.EMBED && '💡 色付きボックスで表示。見た目重視'}
                {selectedTemplate === ResponseTemplate.JSON_FORMATTED && '💡 JSON形式で表示。技術用途向け'}
              </div>
            </FormField>

            <FormField label="フィールドを選択">
              <SpaceBetween size="xs">
                {getSelectableFields(testResult.fields).map((field) => (
                  <div key={field.path} style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                    <label style={{ display: 'flex', alignItems: 'start', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedFields.some(f => f.fieldPath === field.path)}
                        onChange={() => toggleFieldSelection(field.path)}
                        style={{ marginTop: '2px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{field.path}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          型: {field.type} {field.sampleValue !== undefined && `| サンプル: ${JSON.stringify(field.sampleValue).slice(0, 50)}...`}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </SpaceBetween>
            </FormField>
          </SpaceBetween>
        )}
      </Modal>

      <SpaceBetween direction="horizontal" size="xs">
        <Button onClick={() => handleCommandFormSubmitWithScroll()}>
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
              actions={
                <SegmentedControl
                  selectedId={editorMode}
                  onChange={({ detail }) => setEditorMode(detail.selectedId as 'form' | 'visual')}
                  options={[
                    { text: 'フォーム', id: 'form' },
                    { text: 'ビジュアル', id: 'visual' },
                  ]}
                />
              }
            >
              ステップ 3: <GlossaryTerm termKey="slashCommand">スラッシュコマンド</GlossaryTerm>定義
            </Header>
          }
        >
          <SpaceBetween size="l">{editorMode === 'visual' ? (
            <Suspense fallback={<Box>ビジュアルエディタを読み込み中...</Box>}>
              <ReactFlowEditor commands={commands} onChange={onChange} apiProfiles={apiProfiles} />
            </Suspense>
          ) : (
            <>
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
            </>
          )}
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </Form>
  );
}

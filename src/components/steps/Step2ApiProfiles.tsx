'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import Button from '@cloudscape-design/components/button';
import Form from '@cloudscape-design/components/form';
import Box from '@cloudscape-design/components/box';
import type { ApiProfile } from '@/lib/types';
import { AuthType } from '@/lib/types';
import { generateEnvVarName } from '@/lib/utils';
import { GlossaryTerm } from '@/components/ui/GlossaryTooltip';

// APIプロファイルのフォーム入力用スキーマ
const ApiProfileFormSchema = z.object({
  name: z.string().min(1, '⚠️ これは必須の項目です'),
  baseUrl: z.string().url('有効なURLを入力してください'),
  authType: z.nativeEnum(AuthType),
  apiKey: z.string().optional(),
  apiKeyName: z.string().optional(),
}).refine((data) => {
  // authTypeがNONE以外の場合、apiKeyNameが必須
  if (data.authType !== AuthType.NONE) {
    return !!data.apiKeyName && data.apiKeyName.length > 0;
  }
  return true;
}, {
  message: '認証方式を選択した場合、キー名/ヘッダー名は必須です',
  path: ['apiKeyName'],
});

type ApiProfileFormData = z.infer<typeof ApiProfileFormSchema>;

interface Step2ApiProfilesProps {
  apiProfiles: ApiProfile[];
  onChange: (profiles: ApiProfile[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step2ApiProfiles({
  apiProfiles,
  onChange,
  onNext,
  onPrev,
}: Step2ApiProfilesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
  } = useForm<ApiProfileFormData>({
    resolver: zodResolver(ApiProfileFormSchema),
    defaultValues: {
      name: '',
      baseUrl: '',
      authType: AuthType.NONE,
      apiKey: '',
      apiKeyName: '',
    },
  });

  const authType = watch('authType');

  const onSubmitAdd = (data: ApiProfileFormData) => {
    const newProfile: ApiProfile = {
      id: Date.now().toString(),
      name: data.name,
      baseUrl: data.baseUrl,
      authType: data.authType,
      apiKey: data.apiKey,
      apiKeyName: data.apiKeyName,
      envVarKey: generateEnvVarName('BOT_API_KEY', apiProfiles.length),
      envVarUrl: generateEnvVarName('BOT_BASE_URL', apiProfiles.length),
    };

    onChange([...apiProfiles, newProfile]);
    setIsAdding(false);
    reset();
  };

  const onSubmitUpdate = (id: string) => (data: ApiProfileFormData) => {
    onChange(
      apiProfiles.map((profile) =>
        profile.id === id
          ? {
              ...profile,
              name: data.name,
              baseUrl: data.baseUrl,
              authType: data.authType,
              apiKey: data.apiKey,
              apiKeyName: data.apiKeyName,
            }
          : profile
      )
    );
    setEditingId(null);
    reset();
  };

  const handleDelete = (id: string) => {
    onChange(apiProfiles.filter((profile) => profile.id !== id));
  };

  const startEdit = (profile: ApiProfile) => {
    setEditingId(profile.id);
    reset({
      name: profile.name,
      baseUrl: profile.baseUrl,
      authType: profile.authType,
      apiKey: profile.apiKey,
      apiKeyName: profile.apiKeyName,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    reset();
  };

  const handleFormSubmitWithScroll = handleSubmit(
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

  const authTypeOptions = [
    { value: AuthType.NONE, label: '認証なし' },
    { value: AuthType.API_KEY_QUERY, label: 'APIキー（クエリパラメータ）' },
    { value: AuthType.API_KEY_HEADER, label: 'APIキー（ヘッダー）' },
    { value: AuthType.BEARER_TOKEN, label: 'Bearer Token' },
  ];

  return (
    <Form
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          <Button variant="link" onClick={onPrev}>
            戻る
          </Button>
          <Button variant="primary" onClick={onNext}>
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
              description={
                <>
                  外部<GlossaryTerm termKey="api">API</GlossaryTerm>連携を使用する場合は、
                  <GlossaryTerm termKey="apiProfile">APIプロファイル</GlossaryTerm>
                  を追加してください
                </>
              }
            >
              ステップ 2: <GlossaryTerm termKey="apiProfile">APIプロファイル</GlossaryTerm>設定
            </Header>
          }
        >
          <SpaceBetween size="l">
            {/* 既存のプロファイル一覧 */}
            {apiProfiles.map((profile) => (
              <Container key={profile.id}>
                {editingId === profile.id ? (
                  <SpaceBetween size="m">
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <FormField
                          label={
                            <>
                              <GlossaryTerm termKey="apiProfile">プロファイル</GlossaryTerm>名
                            </>
                          }
                          errorText={errors.name?.message}
                        >
                          <Input
                            value={field.value}
                            onChange={({ detail }) => field.onChange(detail.value)}
                            placeholder="WeatherAPI"
                          />
                        </FormField>
                      )}
                    />

                    <Controller
                      name="baseUrl"
                      control={control}
                      render={({ field }) => (
                        <FormField label="ベースURL" errorText={errors.baseUrl?.message}>
                          <Input
                            value={field.value}
                            onChange={({ detail }) => field.onChange(detail.value)}
                            placeholder="https://api.example.com"
                          />
                        </FormField>
                      )}
                    />

                    <Controller
                      name="authType"
                      control={control}
                      render={({ field }) => (
                        <FormField label="認証方式">
                          <Select
                            selectedOption={authTypeOptions.find(o => o.value === field.value) || authTypeOptions[0]}
                            onChange={({ detail }) => field.onChange(detail.selectedOption.value as AuthType)}
                            options={authTypeOptions}
                          />
                        </FormField>
                      )}
                    />

                    {authType !== AuthType.NONE && (
                      <>
                        <Controller
                          name="apiKey"
                          control={control}
                          render={({ field }) => (
                            <FormField
                              label={
                                <>
                                  <GlossaryTerm termKey="apiKey">APIキー</GlossaryTerm>/
                                  <GlossaryTerm termKey="bearerToken">トークン</GlossaryTerm>
                                </>
                              }
                            >
                              <Input
                                value={field.value || ''}
                                onChange={({ detail }) => field.onChange(detail.value)}
                                placeholder="your_api_key_here"
                                type="password"
                              />
                            </FormField>
                          )}
                        />

                        <Controller
                          name="apiKeyName"
                          control={control}
                          render={({ field }) => (
                            <FormField
                              label="キー名/ヘッダー名"
                              description="クエリパラメータ名またはHTTPヘッダー名"
                              errorText={errors.apiKeyName?.message}
                            >
                              <Input
                                value={field.value || ''}
                                onChange={({ detail }) => field.onChange(detail.value)}
                                placeholder="api_key or X-API-Key"
                              />
                            </FormField>
                          )}
                        />
                      </>
                    )}

                    <SpaceBetween direction="horizontal" size="xs">
                      <Button onClick={() => handleFormSubmitWithScroll()}>
                        保存
                      </Button>
                      <Button variant="link" onClick={cancelEdit}>
                        キャンセル
                      </Button>
                    </SpaceBetween>
                  </SpaceBetween>
                ) : (
                  <div className="flex items-start justify-between">
                    <SpaceBetween size="xs">
                      <Box variant="h3">{profile.name}</Box>
                      <Box variant="p" color="text-body-secondary">{profile.baseUrl}</Box>
                      <Box fontSize="body-s" color="text-status-inactive">
                        認証: {authTypeOptions.find(o => o.value === profile.authType)?.label}
                      </Box>
                      <Box fontSize="body-s" color="text-status-info">
                        <GlossaryTerm termKey="environmentVariable">環境変数</GlossaryTerm>:{' '}
                        {profile.envVarKey}
                      </Box>
                    </SpaceBetween>
                    <SpaceBetween direction="horizontal" size="xs">
                      <Button
                        variant="icon"
                        iconName="edit"
                        onClick={() => startEdit(profile)}
                      />
                      <Button
                        variant="icon"
                        iconName="remove"
                        onClick={() => handleDelete(profile.id)}
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
                  <Header variant="h3">
                    新しい<GlossaryTerm termKey="apiProfile">APIプロファイル</GlossaryTerm>
                  </Header>

                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <FormField
                        label={
                          <>
                            <GlossaryTerm termKey="apiProfile">プロファイル</GlossaryTerm>名
                          </>
                        }
                        errorText={errors.name?.message}
                      >
                        <Input
                          value={field.value}
                          onChange={({ detail }) => field.onChange(detail.value)}
                          placeholder="WeatherAPI"
                        />
                      </FormField>
                    )}
                  />

                  <Controller
                    name="baseUrl"
                    control={control}
                    render={({ field }) => (
                      <FormField label="ベースURL" errorText={errors.baseUrl?.message}>
                        <Input
                          value={field.value}
                          onChange={({ detail }) => field.onChange(detail.value)}
                          placeholder="https://api.example.com"
                        />
                      </FormField>
                    )}
                  />

                  <Controller
                    name="authType"
                    control={control}
                    render={({ field }) => (
                      <FormField label="認証方式">
                        <Select
                          selectedOption={authTypeOptions.find(o => o.value === field.value) || authTypeOptions[0]}
                          onChange={({ detail }) => field.onChange(detail.selectedOption.value as AuthType)}
                          options={authTypeOptions}
                        />
                      </FormField>
                    )}
                  />

                  {authType !== AuthType.NONE && (
                    <>
                      <Controller
                        name="apiKey"
                        control={control}
                        render={({ field }) => (
                          <FormField
                            label={
                              <>
                                <GlossaryTerm termKey="apiKey">APIキー</GlossaryTerm>/
                                <GlossaryTerm termKey="bearerToken">トークン</GlossaryTerm>
                              </>
                            }
                          >
                            <Input
                              value={field.value || ''}
                              onChange={({ detail }) => field.onChange(detail.value)}
                              placeholder="your_api_key_here"
                              type="password"
                            />
                          </FormField>
                        )}
                      />

                      <Controller
                        name="apiKeyName"
                        control={control}
                        render={({ field }) => (
                          <FormField
                            label="キー名/ヘッダー名"
                            description="クエリパラメータ名またはHTTPヘッダー名"
                            errorText={errors.apiKeyName?.message}
                          >
                            <Input
                              value={field.value || ''}
                              onChange={({ detail }) => field.onChange(detail.value)}
                              placeholder="api_key or X-API-Key"
                            />
                          </FormField>
                        )}
                      />
                    </>
                  )}

                  <SpaceBetween direction="horizontal" size="xs">
                    <Button onClick={() => handleFormSubmitWithScroll()}>
                      追加
                    </Button>
                    <Button variant="link" onClick={cancelEdit}>
                      キャンセル
                    </Button>
                  </SpaceBetween>
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
                <GlossaryTerm termKey="apiProfile">APIプロファイル</GlossaryTerm>を追加
              </Button>
            )}
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </Form>
  );
}

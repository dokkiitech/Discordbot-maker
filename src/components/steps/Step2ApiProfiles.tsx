'use client';

import { useState } from 'react';
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
  const [formData, setFormData] = useState<Partial<ApiProfile>>({
    name: '',
    baseUrl: '',
    authType: AuthType.NONE,
    apiKey: '',
    apiKeyName: '',
  });

  const handleAdd = () => {
    const newProfile: ApiProfile = {
      id: Date.now().toString(),
      name: formData.name!,
      baseUrl: formData.baseUrl!,
      authType: formData.authType!,
      apiKey: formData.apiKey,
      apiKeyName: formData.apiKeyName,
      envVarKey: generateEnvVarName('BOT_API_KEY', apiProfiles.length),
      envVarUrl: generateEnvVarName('BOT_BASE_URL', apiProfiles.length),
    };

    onChange([...apiProfiles, newProfile]);
    setIsAdding(false);
    setFormData({ name: '', baseUrl: '', authType: AuthType.NONE, apiKey: '', apiKeyName: '' });
  };

  const handleUpdate = (id: string) => {
    onChange(
      apiProfiles.map((profile) =>
        profile.id === id ? { ...profile, ...formData } : profile
      )
    );
    setEditingId(null);
    setFormData({ name: '', baseUrl: '', authType: AuthType.NONE, apiKey: '', apiKeyName: '' });
  };

  const handleDelete = (id: string) => {
    onChange(apiProfiles.filter((profile) => profile.id !== id));
  };

  const startEdit = (profile: ApiProfile) => {
    setEditingId(profile.id);
    setFormData(profile);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ name: '', baseUrl: '', authType: AuthType.NONE, apiKey: '', apiKeyName: '' });
  };

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
              description="外部API連携を使用する場合は、APIプロファイルを追加してください"
            >
              ステップ 2: APIプロファイル設定
            </Header>
          }
        >
          <SpaceBetween size="l">
            {/* 既存のプロファイル一覧 */}
            {apiProfiles.map((profile) => (
              <Container key={profile.id}>
                {editingId === profile.id ? (
                  <SpaceBetween size="m">
                    <FormField label="プロファイル名">
                      <Input
                        value={formData.name || ''}
                        onChange={({ detail }) => setFormData({ ...formData, name: detail.value })}
                        placeholder="WeatherAPI"
                      />
                    </FormField>

                    <FormField label="ベースURL">
                      <Input
                        value={formData.baseUrl || ''}
                        onChange={({ detail }) => setFormData({ ...formData, baseUrl: detail.value })}
                        placeholder="https://api.example.com"
                      />
                    </FormField>

                    <FormField label="認証方式">
                      <Select
                        selectedOption={authTypeOptions.find(o => o.value === formData.authType) || authTypeOptions[0]}
                        onChange={({ detail }) => setFormData({ ...formData, authType: detail.selectedOption.value as AuthType })}
                        options={authTypeOptions}
                      />
                    </FormField>

                    {formData.authType !== AuthType.NONE && (
                      <>
                        <FormField label="APIキー/トークン">
                          <Input
                            value={formData.apiKey || ''}
                            onChange={({ detail }) => setFormData({ ...formData, apiKey: detail.value })}
                            placeholder="your_api_key_here"
                            type="password"
                          />
                        </FormField>

                        <FormField
                          label="キー名/ヘッダー名"
                          description="クエリパラメータ名またはHTTPヘッダー名"
                        >
                          <Input
                            value={formData.apiKeyName || ''}
                            onChange={({ detail }) => setFormData({ ...formData, apiKeyName: detail.value })}
                            placeholder="api_key or X-API-Key"
                          />
                        </FormField>
                      </>
                    )}

                    <SpaceBetween direction="horizontal" size="xs">
                      <Button onClick={() => handleUpdate(profile.id)}>
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
                        環境変数: {profile.envVarKey}
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
                  <Header variant="h3">新しいAPIプロファイル</Header>

                  <FormField label="プロファイル名">
                    <Input
                      value={formData.name || ''}
                      onChange={({ detail }) => setFormData({ ...formData, name: detail.value })}
                      placeholder="WeatherAPI"
                    />
                  </FormField>

                  <FormField label="ベースURL">
                    <Input
                      value={formData.baseUrl || ''}
                      onChange={({ detail }) => setFormData({ ...formData, baseUrl: detail.value })}
                      placeholder="https://api.example.com"
                    />
                  </FormField>

                  <FormField label="認証方式">
                    <Select
                      selectedOption={authTypeOptions.find(o => o.value === formData.authType) || authTypeOptions[0]}
                      onChange={({ detail }) => setFormData({ ...formData, authType: detail.selectedOption.value as AuthType })}
                      options={authTypeOptions}
                    />
                  </FormField>

                  {formData.authType !== AuthType.NONE && (
                    <>
                      <FormField label="APIキー/トークン">
                        <Input
                          value={formData.apiKey || ''}
                          onChange={({ detail }) => setFormData({ ...formData, apiKey: detail.value })}
                          placeholder="your_api_key_here"
                          type="password"
                        />
                      </FormField>

                      <FormField
                        label="キー名/ヘッダー名"
                        description="クエリパラメータ名またはHTTPヘッダー名"
                      >
                        <Input
                          value={formData.apiKeyName || ''}
                          onChange={({ detail }) => setFormData({ ...formData, apiKeyName: detail.value })}
                          placeholder="api_key or X-API-Key"
                        />
                      </FormField>
                    </>
                  )}

                  <SpaceBetween direction="horizontal" size="xs">
                    <Button
                      onClick={handleAdd}
                      disabled={!formData.name || !formData.baseUrl}
                    >
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
                APIプロファイルを追加
              </Button>
            )}
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </Form>
  );
}

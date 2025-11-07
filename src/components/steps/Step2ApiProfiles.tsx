'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
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
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold text-gray-900">
          ステップ 2: APIプロファイル設定
        </h2>
        <p className="text-gray-600 mt-1">
          外部API連携を使用する場合は、APIプロファイルを追加してください
        </p>
      </CardHeader>

      <CardBody className="space-y-4">
        {/* 既存のプロファイル一覧 */}
        {apiProfiles.map((profile) => (
          <div
            key={profile.id}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            {editingId === profile.id ? (
              <div className="space-y-3">
                <Input
                  label="プロファイル名"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="WeatherAPI"
                />
                <Input
                  label="ベースURL"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  placeholder="https://api.example.com"
                />
                <Select
                  label="認証方式"
                  value={formData.authType}
                  onChange={(e) => setFormData({ ...formData, authType: e.target.value as AuthType })}
                  options={authTypeOptions}
                />
                {formData.authType !== AuthType.NONE && (
                  <>
                    <Input
                      label="APIキー/トークン"
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      placeholder="your_api_key_here"
                    />
                    <Input
                      label="キー名/ヘッダー名"
                      value={formData.apiKeyName}
                      onChange={(e) => setFormData({ ...formData, apiKeyName: e.target.value })}
                      placeholder="api_key or X-API-Key"
                    />
                  </>
                )}
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={() => handleUpdate(profile.id)}>
                    <Check className="w-4 h-4 mr-1" />
                    保存
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={cancelEdit}>
                    <X className="w-4 h-4 mr-1" />
                    キャンセル
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{profile.name}</h4>
                  <p className="text-sm text-gray-600">{profile.baseUrl}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    認証: {authTypeOptions.find(o => o.value === profile.authType)?.label}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    環境変数: {profile.envVarKey}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(profile)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(profile.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* 新規追加フォーム */}
        {isAdding && (
          <div className="border border-blue-300 rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold text-gray-900 mb-3">新しいAPIプロファイル</h4>
            <div className="space-y-3">
              <Input
                label="プロファイル名"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="WeatherAPI"
                required
              />
              <Input
                label="ベースURL"
                value={formData.baseUrl}
                onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                placeholder="https://api.example.com"
                required
              />
              <Select
                label="認証方式"
                value={formData.authType}
                onChange={(e) => setFormData({ ...formData, authType: e.target.value as AuthType })}
                options={authTypeOptions}
                required
              />
              {formData.authType !== AuthType.NONE && (
                <>
                  <Input
                    label="APIキー/トークン"
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    placeholder="your_api_key_here"
                  />
                  <Input
                    label="キー名/ヘッダー名"
                    value={formData.apiKeyName}
                    onChange={(e) => setFormData({ ...formData, apiKeyName: e.target.value })}
                    placeholder="api_key or X-API-Key"
                    helperText="クエリパラメータ名またはHTTPヘッダー名"
                  />
                </>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAdd}
                  disabled={!formData.name || !formData.baseUrl}
                >
                  <Check className="w-4 h-4 mr-1" />
                  追加
                </Button>
                <Button type="button" size="sm" variant="secondary" onClick={cancelEdit}>
                  <X className="w-4 h-4 mr-1" />
                  キャンセル
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 追加ボタン */}
        {!isAdding && !editingId && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsAdding(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            APIプロファイルを追加
          </Button>
        )}
      </CardBody>

      <CardFooter>
        <div className="flex justify-between w-full">
          <Button type="button" variant="secondary" onClick={onPrev}>
            戻る
          </Button>
          <Button type="button" onClick={onNext}>
            次へ
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

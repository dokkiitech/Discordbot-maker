'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
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
    });
  };

  const responseTypeOptions = [
    { value: ResponseType.STATIC_TEXT, label: '静的テキスト' },
    { value: ResponseType.API_CALL, label: 'API利用' },
  ];

  const renderCommandForm = (isEdit: boolean, commandId?: string) => (
    <div className="space-y-3">
      <Input
        label="コマンド名"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="weather"
        helperText="小文字、数字、ハイフン、アンダースコアのみ"
        required
      />

      <Input
        label="説明"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="天気情報を取得します"
        required
      />

      <Select
        label="応答タイプ"
        value={formData.responseType}
        onChange={(e) => setFormData({ ...formData, responseType: e.target.value as ResponseType })}
        options={responseTypeOptions}
        required
      />

      {formData.responseType === ResponseType.STATIC_TEXT && (
        <Textarea
          label="応答テキスト"
          value={formData.staticText}
          onChange={(e) => setFormData({ ...formData, staticText: e.target.value })}
          placeholder="こんにちは！これは静的な応答です。"
          rows={3}
        />
      )}

      {formData.responseType === ResponseType.API_CALL && (
        <>
          <Select
            label="使用するAPIプロファイル"
            value={formData.apiProfileId}
            onChange={(e) => setFormData({ ...formData, apiProfileId: e.target.value })}
            options={[
              { value: '', label: 'APIプロファイルを選択' },
              ...apiProfiles.map((p) => ({ value: p.id, label: p.name })),
            ]}
            required
          />

          <Input
            label="APIエンドポイント"
            value={formData.apiEndpoint}
            onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
            placeholder="weather?q={city}"
            helperText="ベースURLからの相対パス。変数は{変数名}で指定"
          />

          <Textarea
            label="カスタムロジック（オプション）"
            value={formData.codeSnippet}
            onChange={(e) => setFormData({ ...formData, codeSnippet: e.target.value })}
            placeholder={`// API応答を処理してDiscord応答を返す
const data = await apiResponse.json();
return {
  content: \`現在の気温: \${data.main.temp}°C\`
};`}
            rows={6}
            helperText="JavaScriptコード。apiResponseオブジェクトが利用可能"
          />
        </>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => (isEdit && commandId ? handleUpdate(commandId) : handleAdd())}
          disabled={!formData.name || !formData.description}
        >
          <Check className="w-4 h-4 mr-1" />
          {isEdit ? '保存' : '追加'}
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={cancelEdit}>
          <X className="w-4 h-4 mr-1" />
          キャンセル
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold text-gray-900">
          ステップ 3: スラッシュコマンド定義
        </h2>
        <p className="text-gray-600 mt-1">
          Botが応答するスラッシュコマンドを追加してください
        </p>
      </CardHeader>

      <CardBody className="space-y-4">
        {/* 既存のコマンド一覧 */}
        {commands.map((command) => (
          <div
            key={command.id}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            {editingId === command.id ? (
              renderCommandForm(true, command.id)
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">/{command.name}</h4>
                  <p className="text-sm text-gray-600">{command.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    応答: {responseTypeOptions.find(o => o.value === command.responseType)?.label}
                  </p>
                  {command.responseType === ResponseType.API_CALL && command.apiProfileId && (
                    <p className="text-xs text-blue-600 mt-1">
                      API: {apiProfiles.find(p => p.id === command.apiProfileId)?.name}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(command)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(command.id)}
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
            <h4 className="font-semibold text-gray-900 mb-3">新しいコマンド</h4>
            {renderCommandForm(false)}
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
            コマンドを追加
          </Button>
        )}

        {commands.length === 0 && !isAdding && (
          <div className="text-center py-8 text-gray-500">
            <p>まだコマンドが追加されていません</p>
            <p className="text-sm mt-1">上のボタンから追加してください</p>
          </div>
        )}
      </CardBody>

      <CardFooter>
        <div className="flex justify-between w-full">
          <Button type="button" variant="secondary" onClick={onPrev}>
            戻る
          </Button>
          <Button type="button" onClick={onNext} disabled={commands.length === 0}>
            次へ
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

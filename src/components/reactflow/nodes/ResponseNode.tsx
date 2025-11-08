'use client';

import { memo, useState, useCallback, useEffect, useContext } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { ResponseNodeData } from '@/lib/reactflow-types';
import { ResponseType, ApiProfile, ApiTestResult, FieldMapping, ApiField } from '@/lib/types';
import { ResponseTemplate, generateCustomLogic, createDefaultFieldMappings } from '@/lib/code-generator';
import { getSelectableFields } from '@/lib/api-response-parser';
import { ApiProfilesContext } from '../ReactFlowEditor';

const ResponseNodeComponent = ({ data, id }: NodeProps<ResponseNodeData>) => {
  const { setNodes } = useReactFlow();
  const apiProfiles = useContext(ApiProfilesContext);
  const [responseType, setResponseType] = useState(data.responseType);
  const [staticText, setStaticText] = useState(data.staticText || '');
  const [apiProfileId, setApiProfileId] = useState(data.apiProfileId || '');
  const [apiEndpoint, setApiEndpoint] = useState(data.apiEndpoint || '');
  const [codeSnippet, setCodeSnippet] = useState(data.codeSnippet || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ApiTestResult | null>(null);
  const [showFieldSelector, setShowFieldSelector] = useState(false);
  const [selectedFields, setSelectedFields] = useState<FieldMapping[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ResponseTemplate>(ResponseTemplate.SIMPLE_TEXT);

  useEffect(() => {
    setResponseType(data.responseType);
    setStaticText(data.staticText || '');
    setApiProfileId(data.apiProfileId || '');
    setApiEndpoint(data.apiEndpoint || '');
    setCodeSnippet(data.codeSnippet || '');
  }, [data.responseType, data.staticText, data.apiProfileId, data.apiEndpoint, data.codeSnippet]);

  const handleInputMouseDown = useCallback((evt: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    evt.stopPropagation();
  }, []);

  const onResponseTypeChange = useCallback((evt: React.ChangeEvent<HTMLSelectElement>) => {
    const newResponseType = evt.target.value as ResponseType;
    setResponseType(newResponseType);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              responseType: newResponseType,
            },
          };
        }
        return node;
      })
    );
  }, [id, setNodes]);

  const onStaticTextChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStaticText(evt.target.value);
  }, []);

  const onStaticTextBlur = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              staticText,
            },
          };
        }
        return node;
      })
    );
  }, [id, staticText, setNodes]);

  const onApiProfileIdChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    setApiProfileId(evt.target.value);
  }, []);

  const onApiProfileIdBlur = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              apiProfileId,
            },
          };
        }
        return node;
      })
    );
  }, [id, apiProfileId, setNodes]);

  const onApiEndpointChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    setApiEndpoint(evt.target.value);
  }, []);

  const onApiEndpointBlur = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              apiEndpoint,
            },
          };
        }
        return node;
      })
    );
  }, [id, apiEndpoint, setNodes]);

  const onCodeSnippetChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCodeSnippet(evt.target.value);
  }, []);

  const onCodeSnippetBlur = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              codeSnippet,
            },
          };
        }
        return node;
      })
    );
  }, [id, codeSnippet, setNodes]);

  // APIテストハンドラー
  const handleTestApi = useCallback(async () => {
    if (!apiProfileId || !apiEndpoint) {
      alert('APIプロファイルとエンドポイントを入力してください');
      return;
    }

    const selectedProfile = apiProfiles.find(p => p.id === apiProfileId);
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
          endpoint: apiEndpoint,
          testParams: {},
        }),
      });

      const result: ApiTestResult = await response.json();
      setTestResult(result);

      if (result.success && result.fields) {
        // 自動的にフィールドマッピングを作成
        const defaultMappings = createDefaultFieldMappings(result.fields);
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
  }, [apiProfileId, apiEndpoint, apiProfiles]);

  // コード自動生成ハンドラー
  const handleGenerateCode = useCallback(() => {
    if (selectedFields.length === 0) {
      alert('フィールドを選択してください');
      return;
    }

    const generatedCode = generateCustomLogic(selectedFields, selectedTemplate);
    setCodeSnippet(generatedCode);

    // ノードデータを更新
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              codeSnippet: generatedCode,
            },
          };
        }
        return node;
      })
    );

    setShowFieldSelector(false);
  }, [id, selectedFields, selectedTemplate, setNodes]);

  // フィールド選択のトグル
  const toggleFieldSelection = useCallback((field: ApiField) => {
    setSelectedFields((prev) => {
      const exists = prev.find(f => f.fieldPath === field.path);
      if (exists) {
        return prev.filter(f => f.fieldPath !== field.path);
      } else {
        return [...prev, {
          fieldPath: field.path,
          displayLabel: field.path.split('.').pop() || field.path,
          formatString: '{value}',
        }];
      }
    });
  }, []);

  return (
    <div className="px-2 py-2 shadow-lg rounded-lg bg-purple-50 border-2 border-purple-500 min-w-[200px]">
      <div className="font-bold text-purple-700 mb-2 text-xs">Response</div>

      <Handle
        type="target"
        position={Position.Left}
        className="w-6 h-6 !bg-purple-500 border-2 border-white"
        style={{ left: -12 }}
      />

      <div className="space-y-2 text-xs">
        <div>
          <label className="block font-medium text-gray-700 mb-1">応答タイプ:</label>
          <select
            value={responseType}
            onChange={onResponseTypeChange}
            onMouseDown={handleInputMouseDown}
            className="nodrag w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value={ResponseType.STATIC_TEXT}>静的テキスト</option>
            <option value={ResponseType.API_CALL}>API呼び出し</option>
          </select>
        </div>

        {responseType === ResponseType.STATIC_TEXT ? (
          <div>
            <label className="block font-medium text-gray-700 mb-1">テキスト:</label>
            <textarea
              value={staticText}
              onChange={onStaticTextChange}
              onBlur={onStaticTextBlur}
              onMouseDown={handleInputMouseDown}
              className="nodrag w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
              placeholder="応答メッセージ"
            />
          </div>
        ) : (
          <>
            <div>
              <label className="block font-medium text-gray-700 mb-1">API Profile ID:</label>
              <input
                type="text"
                value={apiProfileId}
                onChange={onApiProfileIdChange}
                onBlur={onApiProfileIdBlur}
                onMouseDown={handleInputMouseDown}
                className="nodrag w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="api_profile_id"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Endpoint:</label>
              <input
                type="text"
                value={apiEndpoint}
                onChange={onApiEndpointChange}
                onBlur={onApiEndpointBlur}
                onMouseDown={handleInputMouseDown}
                className="nodrag w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="/api/endpoint"
              />
            </div>

            {/* APIテストボタン */}
            <div className="flex gap-1">
              <button
                onClick={handleTestApi}
                disabled={isTesting || !apiProfileId || !apiEndpoint}
                onMouseDown={handleInputMouseDown}
                className="nodrag flex-1 px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isTesting ? 'テスト中...' : 'APIテスト'}
              </button>
              {testResult && testResult.success && (
                <button
                  onClick={() => setShowFieldSelector(true)}
                  onMouseDown={handleInputMouseDown}
                  className="nodrag flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                >
                  自動生成
                </button>
              )}
            </div>

            {/* テスト結果の表示 */}
            {testResult && (
              <div className={`p-2 rounded text-xs ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {testResult.success ? (
                  <div>
                    <div className="font-bold">成功 ({testResult.statusCode})</div>
                    <div className="text-[10px] mt-1">
                      {testResult.fields ? `${testResult.fields.length}個のフィールドを検出` : 'レスポンスを取得しました'}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-bold">エラー</div>
                    <div className="text-[10px] mt-1">{testResult.error}</div>
                  </div>
                )}
              </div>
            )}

            {/* フィールド選択UI */}
            {showFieldSelector && testResult && testResult.fields && (
              <div className="nodrag absolute top-0 left-full ml-2 p-3 bg-white border-2 border-purple-500 rounded-lg shadow-xl z-50 w-64 max-h-96 overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm">フィールドを選択</h3>
                  <button
                    onClick={() => setShowFieldSelector(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                {/* テンプレート選択 */}
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">テンプレート:</label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value as ResponseTemplate)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option value={ResponseTemplate.SIMPLE_TEXT}>シンプルテキスト</option>
                    <option value={ResponseTemplate.MULTI_LINE}>複数行</option>
                    <option value={ResponseTemplate.EMBED}>Embed</option>
                    <option value={ResponseTemplate.JSON_FORMATTED}>JSON</option>
                  </select>
                </div>

                {/* フィールドリスト */}
                <div className="space-y-1 mb-3">
                  {getSelectableFields(testResult.fields).map((field) => (
                    <label key={field.path} className="flex items-start gap-2 text-xs cursor-pointer hover:bg-purple-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedFields.some(f => f.fieldPath === field.path)}
                        onChange={() => toggleFieldSelection(field)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{field.path}</div>
                        <div className="text-[10px] text-gray-500">
                          {field.type} {field.sampleValue !== undefined && `(${JSON.stringify(field.sampleValue).slice(0, 20)}...)`}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* 生成ボタン */}
                <button
                  onClick={handleGenerateCode}
                  disabled={selectedFields.length === 0}
                  className="w-full px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  コードを生成 ({selectedFields.length}個選択)
                </button>
              </div>
            )}

            <div>
              <label className="block font-medium text-gray-700 mb-1">カスタムロジック:</label>
              <textarea
                value={codeSnippet}
                onChange={onCodeSnippetChange}
                onBlur={onCodeSnippetBlur}
                onMouseDown={handleInputMouseDown}
                className="nodrag w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono"
                rows={3}
                placeholder="const data = await apiResponse.json();"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const ResponseNode = memo(ResponseNodeComponent);

ResponseNode.displayName = 'ResponseNode';

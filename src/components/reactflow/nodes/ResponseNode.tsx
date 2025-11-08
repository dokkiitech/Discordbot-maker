'use client';

import { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { ResponseNodeData } from '@/lib/reactflow-types';
import { ResponseType } from '@/lib/types';

export const ResponseNode = memo(({ data, id }: NodeProps<ResponseNodeData>) => {
  const { setNodes } = useReactFlow();

  const handleInputMouseDown = useCallback((evt: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    evt.stopPropagation();
  }, []);

  const onResponseTypeChange = useCallback((evt: React.ChangeEvent<HTMLSelectElement>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              responseType: evt.target.value as ResponseType,
            },
          };
        }
        return node;
      })
    );
  }, [id, setNodes]);

  const onStaticTextChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              staticText: evt.target.value,
            },
          };
        }
        return node;
      })
    );
  }, [id, setNodes]);

  const onApiProfileIdChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              apiProfileId: evt.target.value,
            },
          };
        }
        return node;
      })
    );
  }, [id, setNodes]);

  const onApiEndpointChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              apiEndpoint: evt.target.value,
            },
          };
        }
        return node;
      })
    );
  }, [id, setNodes]);

  const onCodeSnippetChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              codeSnippet: evt.target.value,
            },
          };
        }
        return node;
      })
    );
  }, [id, setNodes]);

  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-purple-50 border-2 border-purple-500 min-w-[280px]">
      <div className="font-bold text-purple-700 mb-3 text-sm">Response</div>

      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-purple-500 border-2 border-white"
        style={{ left: -6 }}
      />

      <div className="space-y-2 text-xs">
        <div>
          <label className="block font-medium text-gray-700 mb-1">応答タイプ:</label>
          <select
            value={data.responseType}
            onChange={onResponseTypeChange}
            onMouseDown={handleInputMouseDown}
            className="nodrag w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value={ResponseType.STATIC_TEXT}>静的テキスト</option>
            <option value={ResponseType.API_CALL}>API呼び出し</option>
          </select>
        </div>

        {data.responseType === ResponseType.STATIC_TEXT ? (
          <div>
            <label className="block font-medium text-gray-700 mb-1">テキスト:</label>
            <textarea
              value={data.staticText || ''}
              onChange={onStaticTextChange}
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
                value={data.apiProfileId || ''}
                onChange={onApiProfileIdChange}
                onMouseDown={handleInputMouseDown}
                className="nodrag w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="api_profile_id"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Endpoint:</label>
              <input
                type="text"
                value={data.apiEndpoint || ''}
                onChange={onApiEndpointChange}
                onMouseDown={handleInputMouseDown}
                className="nodrag w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="/api/endpoint"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">カスタムロジック:</label>
              <textarea
                value={data.codeSnippet || ''}
                onChange={onCodeSnippetChange}
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
});

ResponseNode.displayName = 'ResponseNode';

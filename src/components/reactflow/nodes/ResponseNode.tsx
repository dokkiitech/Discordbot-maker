'use client';

import { memo, useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import type { ResponseNodeData } from '@/lib/reactflow-types';
import { ResponseType } from '@/lib/types';

const ResponseNodeComponent = (props: any) => {
  const { setNodes } = useReactFlow();
  const data = props.data as ResponseNodeData;
  const id = props.id;
  const [responseType, setResponseType] = useState(data.responseType);
  const [staticText, setStaticText] = useState(data.staticText || '');
  const [apiProfileId, setApiProfileId] = useState(data.apiProfileId || '');
  const [apiEndpoint, setApiEndpoint] = useState(data.apiEndpoint || '');
  const [codeSnippet, setCodeSnippet] = useState(data.codeSnippet || '');

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

  return (
    <div className="px-2 py-2 shadow-lg rounded-lg border-2 min-w-[200px]" style={{ backgroundColor: 'color-mix(in srgb, var(--purple) 10%, var(--background))', borderColor: 'var(--purple)' }}>
      <div className="font-bold mb-2 text-xs" style={{ color: 'var(--purple)' }}>Response</div>

      <Handle
        type="target"
        position={Position.Left}
        className="w-6 h-6 !border-2 border-white"
        style={{ left: -12, backgroundColor: 'var(--purple)' }}
      />

      <div className="space-y-2 text-xs">
        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--muted)' }}>応答タイプ:</label>
          <select
            value={responseType}
            onChange={onResponseTypeChange}
            onMouseDown={handleInputMouseDown}
            className="nodrag w-full px-2 py-1 border rounded focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card-background)', color: 'var(--foreground)' }}
          >
            <option value={ResponseType.STATIC_TEXT}>静的テキスト</option>
            <option value={ResponseType.API_CALL}>API呼び出し</option>
          </select>
        </div>

        {responseType === ResponseType.STATIC_TEXT ? (
          <div>
            <label className="block font-medium mb-1" style={{ color: 'var(--muted)' }}>テキスト:</label>
            <textarea
              value={staticText}
              onChange={onStaticTextChange}
              onBlur={onStaticTextBlur}
              onMouseDown={handleInputMouseDown}
              className="nodrag w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card-background)', color: 'var(--foreground)' }}
              rows={3}
              placeholder="応答メッセージ"
            />
          </div>
        ) : (
          <>
            <div>
              <label className="block font-medium mb-1" style={{ color: 'var(--muted)' }}>API Profile ID:</label>
              <input
                type="text"
                value={apiProfileId}
                onChange={onApiProfileIdChange}
                onBlur={onApiProfileIdBlur}
                onMouseDown={handleInputMouseDown}
                className="nodrag w-full px-2 py-1 border rounded focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card-background)', color: 'var(--foreground)' }}
                placeholder="api_profile_id"
              />
            </div>
            <div>
              <label className="block font-medium mb-1" style={{ color: 'var(--muted)' }}>Endpoint:</label>
              <input
                type="text"
                value={apiEndpoint}
                onChange={onApiEndpointChange}
                onBlur={onApiEndpointBlur}
                onMouseDown={handleInputMouseDown}
                className="nodrag w-full px-2 py-1 border rounded focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card-background)', color: 'var(--foreground)' }}
                placeholder="/api/endpoint"
              />
            </div>
            <div>
              <label className="block font-medium mb-1" style={{ color: 'var(--muted)' }}>カスタムロジック:</label>
              <textarea
                value={codeSnippet}
                onChange={onCodeSnippetChange}
                onBlur={onCodeSnippetBlur}
                onMouseDown={handleInputMouseDown}
                className="nodrag w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 resize-none font-mono"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card-background)', color: 'var(--foreground)' }}
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

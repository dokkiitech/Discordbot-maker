'use client';

import { memo, useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import type { CommandNodeData } from '@/lib/reactflow-types';

const CommandNodeComponent = (props: any) => {
  const { setNodes } = useReactFlow();
  const data = props.data as CommandNodeData;
  const id = props.id;
  const [name, setName] = useState(data.name);
  const [description, setDescription] = useState(data.description);

  // プロップが外部から変更されたときのみ同期（例：他のノードから影響を受けた場合）
  useEffect(() => {
    setName(data.name);
    setDescription(data.description);
  }, [data.name, data.description]);

  const handleInputMouseDown = useCallback((evt: React.MouseEvent<HTMLInputElement>) => {
    evt.stopPropagation();
  }, []);

  const onNameChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    setName(evt.target.value);
  }, []);

  const onNameBlur = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              name,
            },
          };
        }
        return node;
      })
    );
  }, [id, name, setNodes]);

  const onDescriptionChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(evt.target.value);
  }, []);

  const onDescriptionBlur = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              description,
            },
          };
        }
        return node;
      })
    );
  }, [id, description, setNodes]);

  return (
    <div className="px-2 py-2 shadow-lg rounded-lg border-2 min-w-[200px]" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 10%, var(--background))', borderColor: 'var(--primary)' }}>
      <div className="font-bold mb-2 text-xs" style={{ color: 'var(--primary)' }}>Discord Command</div>

      <div className="mb-3">
        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
          コマンド名:
        </label>
        <input
          type="text"
          value={name}
          onChange={onNameChange}
          onBlur={onNameBlur}
          onMouseDown={handleInputMouseDown}
          className="nodrag w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card-background)', color: 'var(--foreground)' }}
          placeholder="/mycommand"
        />
      </div>

      <div className="mb-2">
        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
          説明:
        </label>
        <input
          type="text"
          value={description}
          onChange={onDescriptionChange}
          onBlur={onDescriptionBlur}
          onMouseDown={handleInputMouseDown}
          className="nodrag w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card-background)', color: 'var(--foreground)' }}
          placeholder="コマンドの説明"
        />
      </div>

      {/* オプションへの接続ポイント */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="options"
        className="w-6 h-6 !bg-green-500 border-2 border-white"
        style={{ bottom: -12 }}
      />

      {/* 応答への接続ポイント */}
      <Handle
        type="source"
        position={Position.Right}
        id="response"
        className="w-6 h-6 !bg-purple-500 border-2 border-white"
        style={{ right: -12 }}
      />
    </div>
  );
};

export const CommandNode = memo(CommandNodeComponent);

CommandNode.displayName = 'CommandNode';

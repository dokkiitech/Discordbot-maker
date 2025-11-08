'use client';

import { memo, useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { CommandNodeData } from '@/lib/reactflow-types';

const CommandNodeComponent = ({ data, id }: NodeProps<CommandNodeData>) => {
  const { setNodes } = useReactFlow();
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
    <div className="px-4 py-3 shadow-lg rounded-lg bg-blue-50 border-2 border-blue-500 min-w-[280px]">
      <div className="font-bold text-blue-700 mb-3 text-sm">Discord Command</div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          コマンド名:
        </label>
        <input
          type="text"
          value={name}
          onChange={onNameChange}
          onBlur={onNameBlur}
          onMouseDown={handleInputMouseDown}
          className="nodrag w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="/mycommand"
        />
      </div>

      <div className="mb-2">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          説明:
        </label>
        <input
          type="text"
          value={description}
          onChange={onDescriptionChange}
          onBlur={onDescriptionBlur}
          onMouseDown={handleInputMouseDown}
          className="nodrag w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="コマンドの説明"
        />
      </div>

      {/* オプションへの接続ポイント */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="options"
        className="w-3 h-3 !bg-green-500 border-2 border-white"
        style={{ bottom: -6 }}
      />

      {/* 応答への接続ポイント */}
      <Handle
        type="source"
        position={Position.Right}
        id="response"
        className="w-3 h-3 !bg-purple-500 border-2 border-white"
        style={{ right: -6 }}
      />
    </div>
  );
};

export const CommandNode = memo(CommandNodeComponent);

CommandNode.displayName = 'CommandNode';

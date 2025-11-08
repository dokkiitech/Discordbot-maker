'use client';

import { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { OptionNodeData } from '@/lib/reactflow-types';

export const OptionNode = memo(({ data, id }: NodeProps<OptionNodeData>) => {
  const { setNodes } = useReactFlow();

  const handleInputMouseDown = useCallback((evt: React.MouseEvent<HTMLInputElement | HTMLSelectElement>) => {
    evt.stopPropagation();
  }, []);

  const onNameChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              name: evt.target.value,
            },
          };
        }
        return node;
      })
    );
  }, [id, setNodes]);

  const onDescriptionChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              description: evt.target.value,
            },
          };
        }
        return node;
      })
    );
  }, [id, setNodes]);

  const onTypeChange = useCallback((evt: React.ChangeEvent<HTMLSelectElement>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              type: evt.target.value as OptionNodeData['type'],
            },
          };
        }
        return node;
      })
    );
  }, [id, setNodes]);

  const onRequiredChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              required: evt.target.checked,
            },
          };
        }
        return node;
      })
    );
  }, [id, setNodes]);

  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-green-50 border-2 border-green-500 min-w-[250px]">
      <div className="font-bold text-green-700 mb-3 text-sm">Option</div>

      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-green-500 border-2 border-white"
        style={{ top: -6 }}
      />

      <div className="space-y-2 text-xs">
        <div>
          <label className="block font-medium text-gray-700 mb-1">名前:</label>
          <input
            type="text"
            value={data.name}
            onChange={onNameChange}
            onMouseDown={handleInputMouseDown}
            className="nodrag w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="option_name"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">説明:</label>
          <input
            type="text"
            value={data.description}
            onChange={onDescriptionChange}
            onMouseDown={handleInputMouseDown}
            className="nodrag w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="オプションの説明"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">型:</label>
          <select
            value={data.type}
            onChange={onTypeChange}
            onMouseDown={handleInputMouseDown}
            className="nodrag w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="string">文字列</option>
            <option value="integer">整数</option>
            <option value="boolean">真偽値</option>
            <option value="user">ユーザー</option>
            <option value="channel">チャンネル</option>
            <option value="role">ロール</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            id={`${id}-required`}
            type="checkbox"
            checked={data.required}
            onChange={onRequiredChange}
            onMouseDown={handleInputMouseDown}
            className="nodrag w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label htmlFor={`${id}-required`} className="ml-2 font-medium text-gray-700">
            必須
          </label>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-green-500 border-2 border-white"
        style={{ bottom: -6 }}
      />
    </div>
  );
});

OptionNode.displayName = 'OptionNode';

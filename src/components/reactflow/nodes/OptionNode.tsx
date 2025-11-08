'use client';

import { memo, useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { OptionNodeData } from '@/lib/reactflow-types';

const OptionNodeComponent = ({ data, id }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const nodeData = data as OptionNodeData;
  const [name, setName] = useState(nodeData.name);
  const [description, setDescription] = useState(nodeData.description);
  const [type, setType] = useState(nodeData.type);
  const [required, setRequired] = useState(nodeData.required);

  useEffect(() => {
    const d = data as OptionNodeData;
    setName(d.name);
    setDescription(d.description);
    setType(d.type);
    setRequired(d.required);
  }, [data]);

  const handleInputMouseDown = useCallback((evt: React.MouseEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const onTypeChange = useCallback((evt: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = evt.target.value as OptionNodeData['type'];
    setType(newType);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              type: newType,
            },
          };
        }
        return node;
      })
    );
  }, [id, setNodes]);

  const onRequiredChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    setRequired(evt.target.checked);
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
    <div className="px-2 py-2 shadow-lg rounded-lg bg-green-50 border-2 border-green-500 min-w-[180px]">
      <div className="font-bold text-green-700 mb-2 text-xs">Option</div>

      <Handle
        type="target"
        position={Position.Top}
        className="w-6 h-6 !bg-green-500 border-2 border-white"
        style={{ top: -12 }}
      />

      <div className="space-y-2 text-xs">
        <div>
          <label className="block font-medium text-gray-700 mb-1">名前:</label>
          <input
            type="text"
            value={name}
            onChange={onNameChange}
            onBlur={onNameBlur}
            onMouseDown={handleInputMouseDown}
            className="nodrag w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="option_name"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">説明:</label>
          <input
            type="text"
            value={description}
            onChange={onDescriptionChange}
            onBlur={onDescriptionBlur}
            onMouseDown={handleInputMouseDown}
            className="nodrag w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="オプションの説明"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">型:</label>
          <select
            value={type}
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
            checked={required}
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
        className="w-6 h-6 !bg-green-500 border-2 border-white"
        style={{ bottom: -12 }}
      />
    </div>
  );
};

export const OptionNode = memo(OptionNodeComponent);

OptionNode.displayName = 'OptionNode';

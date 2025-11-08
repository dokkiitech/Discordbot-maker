'use client';

import { memo, useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import type { OptionNodeData } from '@/lib/reactflow-types';

const OptionNodeComponent = (props: any) => {
  const { setNodes } = useReactFlow();
  const data = props.data as OptionNodeData;
  const id = props.id;
  const [name, setName] = useState(data.name);
  const [description, setDescription] = useState(data.description);
  const [type, setType] = useState(data.type);
  const [required, setRequired] = useState(data.required);

  useEffect(() => {
    setName(data.name);
    setDescription(data.description);
    setType(data.type);
    setRequired(data.required);
  }, [data.name, data.description, data.type, data.required]);

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
    <div className="px-2 py-2 shadow-lg rounded-lg border-2 min-w-[180px]" style={{ backgroundColor: 'color-mix(in srgb, var(--success) 10%, var(--background))', borderColor: 'var(--success)' }}>
      <div className="font-bold mb-2 text-xs" style={{ color: 'var(--success)' }}>Option</div>

      <Handle
        type="target"
        position={Position.Top}
        className="w-6 h-6 !border-2 border-white"
        style={{ top: -12, backgroundColor: 'var(--success)' }}
      />

      <div className="space-y-2 text-xs">
        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--muted)' }}>名前:</label>
          <input
            type="text"
            value={name}
            onChange={onNameChange}
            onBlur={onNameBlur}
            onMouseDown={handleInputMouseDown}
            className="nodrag w-full px-2 py-1 border rounded focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card-background)', color: 'var(--foreground)' }}
            placeholder="option_name"
          />
        </div>

        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--muted)' }}>説明:</label>
          <input
            type="text"
            value={description}
            onChange={onDescriptionChange}
            onBlur={onDescriptionBlur}
            onMouseDown={handleInputMouseDown}
            className="nodrag w-full px-2 py-1 border rounded focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card-background)', color: 'var(--foreground)' }}
            placeholder="オプションの説明"
          />
        </div>

        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--muted)' }}>型:</label>
          <select
            value={type}
            onChange={onTypeChange}
            onMouseDown={handleInputMouseDown}
            className="nodrag w-full px-2 py-1 border rounded focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card-background)', color: 'var(--foreground)' }}
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
            className="nodrag w-4 h-4 border-2 rounded"
            style={{ borderColor: 'var(--border)', accentColor: 'var(--success)' }}
          />
          <label htmlFor={`${id}-required`} className="ml-2 font-medium" style={{ color: 'var(--muted)' }}>
            必須
          </label>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-6 h-6 !border-2 border-white"
        style={{ bottom: -12, backgroundColor: 'var(--success)' }}
      />
    </div>
  );
};

export const OptionNode = memo(OptionNodeComponent);

OptionNode.displayName = 'OptionNode';

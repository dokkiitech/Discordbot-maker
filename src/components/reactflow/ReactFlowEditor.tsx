'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  OnConnect,
  NodeTypes,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { CommandNode } from './nodes/CommandNode';
import { OptionNode } from './nodes/OptionNode';
import { ResponseNode } from './nodes/ResponseNode';
import { AppNode, AppEdge } from '@/lib/reactflow-types';
import { SlashCommand } from '@/lib/types';
import { commandsToReactFlow, reactFlowToCommands } from '@/lib/reactflow-converter';

// ノードタイプの登録（コンポーネント外で定義して再レンダリングを防ぐ）
const nodeTypes: NodeTypes = {
  command: CommandNode,
  option: OptionNode,
  response: ResponseNode,
};

interface ReactFlowEditorInnerProps {
  commands: SlashCommand[];
  onChange: (commands: SlashCommand[]) => void;
}

function ReactFlowEditorInner({ commands, onChange }: ReactFlowEditorInnerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>([]);

  // プロップから来た commands を追跡して、props更新と user操作を区別
  const prevCommandsRef = useRef(commands);
  const isPropsUpdateRef = useRef(false);

  // 初回に commands からノード・エッジを生成
  // commands が変更されたときもリセット
  useEffect(() => {
    // JSON.stringify で実際の値の変更を確認
    const hasCommandsChanged =
      JSON.stringify(prevCommandsRef.current) !== JSON.stringify(commands);

    if (hasCommandsChanged) {
      // props が変更されたことをマーク
      isPropsUpdateRef.current = true;

      const { nodes: newNodes, edges: newEdges } = commandsToReactFlow(commands);
      setNodes(newNodes);
      setEdges(newEdges);
      prevCommandsRef.current = commands;

      // より信頼性の高いマイクロタスクキューを使用
      queueMicrotask(() => {
        isPropsUpdateRef.current = false;
      });
    }
  }, [commands, setNodes, setEdges]);

  // 接続時の処理
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find(n => n.id === connection.source);
      const targetNode = nodes.find(n => n.id === connection.target);

      // commandノードのoptionsハンドル → optionノードのみ接続可能
      if (sourceNode?.type === 'command' && connection.sourceHandle === 'options') {
        if (targetNode?.type !== 'option') {
          console.warn('Options can only connect to option nodes');
          return;
        }
      }

      // commandノードのresponseハンドル → responseノードのみ接続可能
      if (sourceNode?.type === 'command' && connection.sourceHandle === 'response') {
        if (targetNode?.type !== 'response') {
          console.warn('Response can only connect to response nodes');
          return;
        }
      }

      // optionノード → optionノードへの接続（チェーン）
      if (sourceNode?.type === 'option' && targetNode?.type !== 'option') {
        console.warn('Options can only chain to other option nodes');
        return;
      }

      setEdges((eds) => addEdge(connection, eds));
    },
    [nodes, setEdges]
  );

  // ノードやエッジの変更をSlashCommandに変換
  // ただし、props から来た初期化のときは parent に通知しない
  useEffect(() => {
    // props更新中は何もしない
    if (isPropsUpdateRef.current) {
      return;
    }

    const updatedCommands = reactFlowToCommands(nodes, edges);
    onChange(updatedCommands);
  }, [nodes, edges, onChange]);

  // ノード追加ハンドラー
  const handleAddNode = useCallback(
    (type: 'command' | 'option' | 'response') => {
      const newNodeId = `${type}-${Date.now()}`;
      const newNode: AppNode = {
        id: newNodeId,
        type,
        position: { x: Math.random() * 300, y: Math.random() * 200 },
        data:
          type === 'command'
            ? { name: 'New Command', description: '' }
            : type === 'option'
              ? { name: 'New Option' }
              : { responseType: 'text', responseValue: '' },
      } as AppNode;

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', aspectRatio: '16 / 9', maxHeight: '100vh' }}>
      {/* ノード追加ツールバー */}
      <div style={{ padding: '12px', backgroundColor: '#f0f9ff', borderBottom: '1px solid #bfdbfe', display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={() => handleAddNode('command')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          + コマンド
        </button>
        <button
          onClick={() => handleAddNode('option')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          + オプション
        </button>
        <button
          onClick={() => handleAddNode('response')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#a855f7',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          + レスポンス
        </button>
      </div>

      {/* ReactFlow キャンバス */}
      <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15, minZoom: 0.3, maxZoom: 1.5 }}
          className="bg-gray-50"
          minZoom={0.1}
          maxZoom={3}
        >
          <Background color="#cbd5e1" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              if (node.type === 'command') return '#3b82f6';
              if (node.type === 'option') return '#10b981';
              if (node.type === 'response') return '#a855f7';
              return '#gray';
            }}
            maskColor="rgb(240, 240, 240, 0.6)"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

interface ReactFlowEditorProps {
  commands: SlashCommand[];
  onChange: (commands: SlashCommand[]) => void;
}

export function ReactFlowEditor({ commands, onChange }: ReactFlowEditorProps) {
  return (
    <ReactFlowProvider>
      <ReactFlowEditorInner commands={commands} onChange={onChange} />
    </ReactFlowProvider>
  );
}

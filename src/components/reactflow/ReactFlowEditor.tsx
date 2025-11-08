'use client';

import { useCallback, useEffect, useMemo } from 'react';
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

  // 初回および commands が変更されたときにノードとエッジを生成
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = commandsToReactFlow(commands);
    setNodes(newNodes);
    setEdges(newEdges);
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
  useEffect(() => {
    const updatedCommands = reactFlowToCommands(nodes, edges);
    onChange(updatedCommands);
  }, [nodes, edges, onChange]);

  return (
    <div style={{ width: '100%', height: '800px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
        minZoom={0.2}
        maxZoom={2}
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

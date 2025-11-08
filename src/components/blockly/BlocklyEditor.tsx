'use client';

import { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import { registerAllBlocks, toolboxConfig } from './blocks';
import type { SlashCommand } from '@/lib/types';
import { blocksToCommands, commandsToBlocks } from '@/lib/blockly-converter';

interface BlocklyEditorProps {
  commands: SlashCommand[];
  onChange: (commands: SlashCommand[]) => void;
}

export function BlocklyEditor({ commands, onChange }: BlocklyEditorProps) {
  const blocklyDivRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!blocklyDivRef.current || isInitializedRef.current) return;

    // カスタムブロックを登録
    registerAllBlocks();

    // Blocklyワークスペースを初期化
    const workspace = Blockly.inject(blocklyDivRef.current, {
      toolbox: toolboxConfig,
      grid: {
        spacing: 20,
        length: 3,
        colour: '#ccc',
        snap: true,
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
      trashcan: true,
    });

    workspaceRef.current = workspace;
    isInitializedRef.current = true;

    // 既存のコマンドからブロックを生成
    if (commands.length > 0) {
      commandsToBlocks(commands, workspace);
    }

    // ワークスペースの変更を監視
    const changeListener = () => {
      try {
        const updatedCommands = blocksToCommands(workspace);
        onChange(updatedCommands);
      } catch (error) {
        console.error('Error converting blocks to commands:', error);
      }
    };

    workspace.addChangeListener(changeListener);

    // クリーンアップ
    return () => {
      workspace.removeChangeListener(changeListener);
      workspace.dispose();
      isInitializedRef.current = false;
      workspaceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空の依存配列で初回のみ実行

  // commandsが外部から変更された場合の更新
  useEffect(() => {
    if (workspaceRef.current && isInitializedRef.current) {
      // ワークスペースをクリアして再構築
      workspaceRef.current.clear();
      if (commands.length > 0) {
        commandsToBlocks(commands, workspaceRef.current);
      }
    }
  }, [commands]);

  return (
    <div className="blockly-container">
      <div
        ref={blocklyDivRef}
        style={{
          width: '100%',
          height: '600px',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      />
      <style jsx>{`
        .blockly-container {
          width: 100%;
        }
      `}</style>
    </div>
  );
}

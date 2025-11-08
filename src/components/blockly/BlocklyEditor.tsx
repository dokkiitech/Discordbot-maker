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
    console.log('[Blockly Debug] useEffect called, initialized:', isInitializedRef.current);
    if (!blocklyDivRef.current || isInitializedRef.current) {
      console.log('[Blockly Debug] Skipping initialization');
      return;
    }

    console.log('[Blockly Debug] Starting Blockly initialization...');

    // カスタムブロックを登録
    registerAllBlocks();
    console.log('[Blockly Debug] Blocks registered');

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
      move: {
        scrollbars: {
          horizontal: true,
          vertical: true,
        },
        drag: true,
        wheel: true,
      },
      renderer: 'zelos',
      horizontalLayout: false,
      toolboxPosition: 'start',
    });

    // ワークスペースのスクロール範囲を拡張するためにメトリクスを調整
    const originalGetMetrics = workspace.getMetrics.bind(workspace);
    workspace.getMetrics = function() {
      const metrics = originalGetMetrics();
      // スクロール範囲を大幅に拡張（負の座標も許可）
      return {
        ...metrics,
        contentLeft: Math.min(metrics.contentLeft || 0, -5000),
        contentTop: Math.min(metrics.contentTop || 0, -5000),
        contentWidth: Math.max(metrics.contentWidth || 0, 10000),
        contentHeight: Math.max(metrics.contentHeight || 0, 10000),
      };
    };

    console.log('[Blockly Debug] Workspace created successfully');
    workspaceRef.current = workspace;
    isInitializedRef.current = true;

    // ワークスペースのサイズを自動調整
    const resizeWorkspace = () => {
      Blockly.svgResize(workspace as Blockly.WorkspaceSvg);
    };
    window.addEventListener('resize', resizeWorkspace);
    resizeWorkspace(); // 初期サイズ調整

    // 既存のコマンドからブロックを生成
    console.log('[Blockly Debug] Initial commands count:', commands.length);
    if (commands.length > 0) {
      console.log('[Blockly Debug] Creating initial blocks from commands...');
      commandsToBlocks(commands, workspace);
    }

    // ワークスペースの変更を監視（頻繁な更新を避けるためデバウンス）
    let timeoutId: NodeJS.Timeout;
    const changeListener = (event: Blockly.Events.Abstract) => {
      console.log('[Blockly Debug] Event:', event.type, event);

      // UI系のイベント（ドラッグ、選択など）は無視
      if (event.type === Blockly.Events.BLOCK_MOVE ||
          event.type === Blockly.Events.VIEWPORT_CHANGE ||
          event.type === Blockly.Events.TOOLBOX_ITEM_SELECT ||
          event.type === Blockly.Events.THEME_CHANGE ||
          event.type === Blockly.Events.CLICK) {
        console.log('[Blockly Debug] Ignoring UI event:', event.type);
        return;
      }

      console.log('[Blockly Debug] Processing event:', event.type);

      // デバウンス処理
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        try {
          console.log('[Blockly Debug] Converting blocks to commands...');
          const updatedCommands = blocksToCommands(workspace);
          console.log('[Blockly Debug] Converted commands:', updatedCommands);
          onChange(updatedCommands);
        } catch (error) {
          console.error('[Blockly Debug] Error converting blocks to commands:', error);
        }
      }, 300);
    };

    workspace.addChangeListener(changeListener);

    // クリーンアップ
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', resizeWorkspace);
      workspace.removeChangeListener(changeListener);
      workspace.dispose();
      isInitializedRef.current = false;
      workspaceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空の依存配列で初回のみ実行

  // commandsが外部から変更された場合の更新
  useEffect(() => {
    console.log('[Blockly Debug] Commands changed, length:', commands.length);
    if (workspaceRef.current && isInitializedRef.current) {
      console.log('[Blockly Debug] Updating workspace from external commands...');
      // ワークスペースをクリアして再構築
      workspaceRef.current.clear();
      if (commands.length > 0) {
        commandsToBlocks(commands, workspaceRef.current);
      }
    } else {
      console.log('[Blockly Debug] Workspace not initialized, skipping update');
    }
  }, [commands]);

  return (
    <div className="blockly-container">
      <div
        ref={blocklyDivRef}
        className="blockly-workspace"
      />
      <style jsx>{`
        .blockly-container {
          width: 100%;
          position: relative;
          overflow: hidden;
        }
        .blockly-workspace {
          width: 100%;
          height: 800px;
          min-height: 600px;
          border: 1px solid #ccc;
          border-radius: 4px;
          position: relative;
        }
        /* Blocklyのスクロールバーを制御 */
        :global(.blocklyScrollbarVertical),
        :global(.blocklyScrollbarHorizontal) {
          pointer-events: auto !important;
        }
        /* フライアウトが閉じているときはスクロールバーを非表示 */
        :global(.blocklyFlyout[style*="display: none"] ~ .blocklyScrollbarVertical),
        :global(.blocklyFlyout[style*="display: none"] ~ .blocklyScrollbarHorizontal),
        :global(.blocklyFlyoutBackground[style*="display: none"] ~ .blocklyScrollbarVertical),
        :global(.blocklyFlyoutBackground[style*="display: none"] ~ .blocklyScrollbarHorizontal) {
          display: none !important;
        }
        /* フライアウトのスクロールバーハンドルを強制非表示（問題の要素） */
        :global(.blocklyFlyoutScrollbar .blocklyScrollbarHandle) {
          display: none !important;
        }
        /* ツールボックスのスタイル調整 */
        :global(.blocklyToolboxDiv) {
          background-color: #f5f5f5;
          border-right: 1px solid #ddd;
        }
        :global(.blocklyFlyout) {
          fill: #ffffff;
          fill-opacity: 0.95;
        }
        :global(.blocklyFlyoutBackground) {
          fill: #ffffff;
          fill-opacity: 0.8;
        }
        /* ワークスペース全体のスタイル */
        :global(.blocklyMainBackground) {
          stroke: none;
        }
        /* フライアウトのスクロールバー全体を非表示 */
        :global(.blocklyFlyoutScrollbar) {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

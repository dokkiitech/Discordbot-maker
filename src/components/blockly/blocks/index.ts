import * as Blockly from 'blockly';
// ブロック定義をインポート（副作用としてBlockly.Blocksに登録される）
import './commandBlocks';
import './optionBlocks';
import './responseBlocks';

/**
 * すべてのカスタムブロックを登録
 */
export function registerAllBlocks() {
  // ブロック定義は各ファイルのインポート時に自動的に登録される
}

/**
 * ツールボックスの定義
 */
export const toolboxConfig = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'コマンド',
      colour: '230',
      contents: [
        {
          kind: 'block',
          type: 'discord_command',
        },
      ],
    },
    {
      kind: 'category',
      name: 'オプション',
      colour: '160',
      contents: [
        {
          kind: 'block',
          type: 'command_option',
        },
      ],
    },
    {
      kind: 'category',
      name: '応答',
      colour: '290',
      contents: [
        {
          kind: 'block',
          type: 'static_text_response',
        },
        {
          kind: 'block',
          type: 'api_response',
        },
      ],
    },
  ],
};

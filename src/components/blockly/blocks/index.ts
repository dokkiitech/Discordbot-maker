import * as Blockly from 'blockly';
import { commandBlocks } from './commandBlocks';
import { optionBlocks } from './optionBlocks';
import { responseBlocks } from './responseBlocks';

/**
 * すべてのカスタムブロックを登録
 */
export function registerAllBlocks() {
  // ブロック定義は既に各ファイルで登録済み
  // この関数は互換性のために残す
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

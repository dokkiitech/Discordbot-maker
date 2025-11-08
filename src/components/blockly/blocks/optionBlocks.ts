import * as Blockly from 'blockly';

/**
 * オプションブロックの定義
 */
export const optionBlocks = Blockly.common.createBlockDefinitionsFromJsonArray([
  {
    type: 'command_option',
    message0: 'オプション %1 型 %2 必須 %3 説明 %4',
    args0: [
      {
        type: 'field_input',
        name: 'NAME',
        text: 'option_name',
      },
      {
        type: 'field_dropdown',
        name: 'TYPE',
        options: [
          ['文字列', 'string'],
          ['整数', 'integer'],
          ['真偽値', 'boolean'],
          ['ユーザー', 'user'],
          ['チャンネル', 'channel'],
          ['ロール', 'role'],
        ],
      },
      {
        type: 'field_checkbox',
        name: 'REQUIRED',
        checked: false,
      },
      {
        type: 'field_input',
        name: 'DESCRIPTION',
        text: 'オプションの説明',
      },
    ],
    previousStatement: 'Option',
    nextStatement: 'Option',
    colour: 160,
    tooltip: 'コマンドのオプション（引数）を定義します',
    helpUrl: '',
  },
]);

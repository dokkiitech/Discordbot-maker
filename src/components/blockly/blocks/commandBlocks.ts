import * as Blockly from 'blockly';

/**
 * コマンドブロックの定義
 */
export const commandBlocks = Blockly.common.createBlockDefinitionsFromJsonArray([
  {
    type: 'discord_command',
    message0: 'コマンド /%1 説明 %2',
    args0: [
      {
        type: 'field_input',
        name: 'NAME',
        text: 'mycommand',
      },
      {
        type: 'field_input',
        name: 'DESCRIPTION',
        text: 'コマンドの説明',
      },
    ],
    message1: 'オプション %1',
    args1: [
      {
        type: 'input_statement',
        name: 'OPTIONS',
      },
    ],
    message2: '応答 %1',
    args2: [
      {
        type: 'input_statement',
        name: 'RESPONSE',
      },
    ],
    colour: 230,
    tooltip: 'Discordスラッシュコマンドを定義します',
    helpUrl: '',
  },
]);

import * as Blockly from 'blockly';

/**
 * 応答ブロックの定義
 */
export const responseBlocks = Blockly.common.createBlockDefinitionsFromJsonArray([
  {
    type: 'static_text_response',
    message0: '静的テキスト応答 %1',
    args0: [
      {
        type: 'field_input',
        name: 'TEXT',
        text: 'こんにちは！',
      },
    ],
    previousStatement: 'Response',
    nextStatement: 'Response',
    colour: 290,
    tooltip: '固定のテキストを返します',
    helpUrl: '',
  },
  {
    type: 'api_response',
    message0: 'API応答 プロファイル %1 エンドポイント %2',
    args0: [
      {
        type: 'field_input',
        name: 'PROFILE_ID',
        text: 'api_profile_id',
      },
      {
        type: 'field_input',
        name: 'ENDPOINT',
        text: '/api/endpoint',
      },
    ],
    message1: 'カスタムロジック %1',
    args1: [
      {
        type: 'field_multilinetext',
        name: 'CODE',
        text: 'const data = await apiResponse.json();\nreturn { content: JSON.stringify(data) };',
      },
    ],
    previousStatement: 'Response',
    nextStatement: 'Response',
    colour: 290,
    tooltip: 'APIを呼び出して応答します',
    helpUrl: '',
  },
]);

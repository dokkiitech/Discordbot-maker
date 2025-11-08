import * as Blockly from 'blockly';

/**
 * 応答ブロックの定義
 */
Blockly.Blocks['static_text_response'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('静的テキスト応答')
        .appendField(new Blockly.FieldTextInput('こんにちは！'), 'TEXT');
    this.setPreviousStatement(true, 'Response');
    this.setNextStatement(true, 'Response');
    this.setColour(290);
    this.setTooltip('固定のテキストを返します');
    this.setHelpUrl('');
    this.setMovable(true);
    this.setDeletable(true);
    this.setEditable(true);
  }
};

Blockly.Blocks['api_response'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('API応答 プロファイル')
        .appendField(new Blockly.FieldTextInput('api_profile_id'), 'PROFILE_ID');
    this.appendDummyInput()
        .appendField('エンドポイント')
        .appendField(new Blockly.FieldTextInput('/api/endpoint'), 'ENDPOINT');
    this.appendDummyInput()
        .appendField('カスタムロジック')
        .appendField(new Blockly.FieldTextInput('const data = await apiResponse.json();'), 'CODE');
    this.setPreviousStatement(true, 'Response');
    this.setNextStatement(true, 'Response');
    this.setColour(290);
    this.setTooltip('APIを呼び出して応答します');
    this.setHelpUrl('');
    this.setMovable(true);
    this.setDeletable(true);
    this.setEditable(true);
  }
};

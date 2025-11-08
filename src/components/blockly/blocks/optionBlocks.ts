import * as Blockly from 'blockly';

/**
 * オプションブロックの定義
 */
Blockly.Blocks['command_option'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('オプション')
        .appendField(new Blockly.FieldTextInput('option_name'), 'NAME')
        .appendField('型')
        .appendField(new Blockly.FieldDropdown([
          ['文字列', 'string'],
          ['整数', 'integer'],
          ['真偽値', 'boolean'],
          ['ユーザー', 'user'],
          ['チャンネル', 'channel'],
          ['ロール', 'role'],
        ]), 'TYPE')
        .appendField('必須')
        .appendField(new Blockly.FieldCheckbox('FALSE'), 'REQUIRED')
        .appendField('説明')
        .appendField(new Blockly.FieldTextInput('オプションの説明'), 'DESCRIPTION');
    this.setPreviousStatement(true, 'Option');
    this.setNextStatement(true, 'Option');
    this.setColour(160);
    this.setTooltip('コマンドのオプション（引数）を定義します');
    this.setHelpUrl('');
    this.setMovable(true);
    this.setDeletable(true);
    this.setEditable(true);
  }
};

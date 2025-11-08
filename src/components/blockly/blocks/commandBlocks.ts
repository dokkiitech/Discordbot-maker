import * as Blockly from 'blockly';

/**
 * コマンドブロックの定義
 */
Blockly.Blocks['discord_command'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('コマンド /')
        .appendField(new Blockly.FieldTextInput('mycommand'), 'NAME')
        .appendField('説明')
        .appendField(new Blockly.FieldTextInput('コマンドの説明'), 'DESCRIPTION');
    this.appendStatementInput('OPTIONS')
        .setCheck('Option')
        .appendField('オプション');
    this.appendStatementInput('RESPONSE')
        .setCheck('Response')
        .appendField('応答');
    this.setColour(230);
    this.setTooltip('Discordスラッシュコマンドを定義します');
    this.setHelpUrl('');
    this.setMovable(true);
    this.setDeletable(true);
    this.setEditable(true);
    // 接続を無効化（コマンドブロックは独立）
    this.setPreviousStatement(false);
    this.setNextStatement(false);
  }
};

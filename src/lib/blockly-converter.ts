import * as Blockly from 'blockly';
import type { SlashCommand, CommandOption } from './types';
import { ResponseType } from './types';

/**
 * Blocklyワークスペースから SlashCommand[] に変換
 */
export function blocksToCommands(workspace: Blockly.Workspace): SlashCommand[] {
  console.log('[Converter Debug] blocksToCommands called');
  const commands: SlashCommand[] = [];
  const topBlocks = workspace.getTopBlocks(false);
  console.log('[Converter Debug] Top blocks count:', topBlocks.length);

  topBlocks.forEach((block, index) => {
    console.log(`[Converter Debug] Block ${index}:`, block.type);
    if (block.type === 'discord_command') {
      const command = blockToCommand(block);
      console.log(`[Converter Debug] Converted command ${index}:`, command);
      if (command) {
        commands.push(command);
      }
    }
  });

  console.log('[Converter Debug] Final commands:', commands);
  return commands;
}

/**
 * 単一のコマンドブロックを SlashCommand に変換
 */
function blockToCommand(block: Blockly.Block): SlashCommand | null {
  const name = block.getFieldValue('NAME') as string;
  const description = block.getFieldValue('DESCRIPTION') as string;

  if (!name || !description) {
    return null;
  }

  // オプションを取得
  const options: CommandOption[] = [];
  let optionBlock = block.getInputTargetBlock('OPTIONS');
  while (optionBlock) {
    if (optionBlock.type === 'command_option') {
      const option = blockToOption(optionBlock);
      if (option) {
        options.push(option);
      }
    }
    optionBlock = optionBlock.getNextBlock();
  }

  // 応答を取得
  let responseType = ResponseType.STATIC_TEXT;
  let staticText = '';
  let apiProfileId = '';
  let apiEndpoint = '';
  let codeSnippet = '';

  const responseBlock = block.getInputTargetBlock('RESPONSE');
  if (responseBlock) {
    if (responseBlock.type === 'static_text_response') {
      responseType = ResponseType.STATIC_TEXT;
      staticText = responseBlock.getFieldValue('TEXT') as string;
    } else if (responseBlock.type === 'api_response') {
      responseType = ResponseType.API_CALL;
      apiProfileId = responseBlock.getFieldValue('PROFILE_ID') as string;
      apiEndpoint = responseBlock.getFieldValue('ENDPOINT') as string;
      codeSnippet = responseBlock.getFieldValue('CODE') as string;
    }
  }

  return {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    name,
    description,
    responseType,
    staticText,
    apiProfileId,
    apiEndpoint,
    codeSnippet,
    options,
  };
}

/**
 * オプションブロックを CommandOption に変換
 */
function blockToOption(block: Blockly.Block): CommandOption | null {
  const name = block.getFieldValue('NAME') as string;
  const description = block.getFieldValue('DESCRIPTION') as string;
  const type = block.getFieldValue('TYPE') as 'string' | 'integer' | 'boolean' | 'user' | 'channel' | 'role';
  const required = block.getFieldValue('REQUIRED') === 'TRUE';

  if (!name || !description) {
    return null;
  }

  return {
    name,
    description,
    type,
    required,
  };
}

/**
 * SlashCommand[] を Blocklyワークスペースに変換
 */
export function commandsToBlocks(commands: SlashCommand[], workspace: Blockly.Workspace): void {
  console.log('[Converter Debug] commandsToBlocks called with', commands.length, 'commands');
  workspace.clear();

  let yOffset = 20;

  commands.forEach((command, index) => {
    console.log(`[Converter Debug] Creating block for command ${index}:`, command.name);
    const commandBlock = workspace.newBlock('discord_command') as Blockly.Block;
    commandBlock.setFieldValue(command.name, 'NAME');
    commandBlock.setFieldValue(command.description, 'DESCRIPTION');

    // オプションを追加
    if (command.options && command.options.length > 0) {
      let previousOptionBlock: Blockly.Block | null = null;

      command.options.forEach((option) => {
        const optionBlock = workspace.newBlock('command_option') as Blockly.Block;
        optionBlock.setFieldValue(option.name, 'NAME');
        optionBlock.setFieldValue(option.description, 'DESCRIPTION');
        optionBlock.setFieldValue(option.type, 'TYPE');
        optionBlock.setFieldValue(option.required ? 'TRUE' : 'FALSE', 'REQUIRED');

        if (previousOptionBlock) {
          // 前のオプションブロックの次に接続
          const nextConnection = previousOptionBlock.nextConnection;
          const previousConnection = optionBlock.previousConnection;
          if (nextConnection && previousConnection) {
            nextConnection.connect(previousConnection);
          }
        } else {
          // 最初のオプションブロックはコマンドのOPTIONS入力に接続
          const optionsInput = commandBlock.getInput('OPTIONS');
          if (optionsInput && optionsInput.connection) {
            const previousConnection = optionBlock.previousConnection;
            if (previousConnection) {
              optionsInput.connection.connect(previousConnection);
            }
          }
        }

        if ('initSvg' in optionBlock && typeof optionBlock.initSvg === 'function') {
          optionBlock.initSvg();
        }
        if ('render' in optionBlock && typeof optionBlock.render === 'function') {
          optionBlock.render();
        }
        previousOptionBlock = optionBlock;
      });
    }

    // 応答を追加
    let responseBlock: Blockly.Block | null = null;

    if (command.responseType === ResponseType.STATIC_TEXT) {
      responseBlock = workspace.newBlock('static_text_response') as Blockly.Block;
      responseBlock.setFieldValue(command.staticText || '', 'TEXT');
    } else if (command.responseType === ResponseType.API_CALL) {
      responseBlock = workspace.newBlock('api_response') as Blockly.Block;
      responseBlock.setFieldValue(command.apiProfileId || '', 'PROFILE_ID');
      responseBlock.setFieldValue(command.apiEndpoint || '', 'ENDPOINT');
      responseBlock.setFieldValue(command.codeSnippet || '', 'CODE');
    }

    if (responseBlock) {
      const responseInput = commandBlock.getInput('RESPONSE');
      if (responseInput && responseInput.connection) {
        const previousConnection = responseBlock.previousConnection;
        if (previousConnection) {
          responseInput.connection.connect(previousConnection);
        }
      }
      if ('initSvg' in responseBlock && typeof responseBlock.initSvg === 'function') {
        responseBlock.initSvg();
      }
      if ('render' in responseBlock && typeof responseBlock.render === 'function') {
        responseBlock.render();
      }
    }

    // コマンドブロックを配置
    commandBlock.moveBy(20, yOffset);
    if ('initSvg' in commandBlock && typeof commandBlock.initSvg === 'function') {
      commandBlock.initSvg();
    }
    if ('render' in commandBlock && typeof commandBlock.render === 'function') {
      commandBlock.render();
    }

    yOffset += 200; // 次のコマンドブロックの位置
  });
}

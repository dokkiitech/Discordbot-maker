import { SlashCommand, CommandOption, ResponseType } from './types';
import { AppNode, AppEdge } from './reactflow-types';

/**
 * SlashCommand配列をReact Flowのノード・エッジに変換
 */
export function commandsToReactFlow(
  commands: SlashCommand[]
): { nodes: AppNode[]; edges: AppEdge[] } {
  const nodes: AppNode[] = [];
  const edges: AppEdge[] = [];

  let yOffset = 50;
  const xOffset = 50;

  commands.forEach((command, cmdIndex) => {
    const commandNodeId = `command-${cmdIndex}`;

    // 1. コマンドノードを作成
    const commandNode: AppNode = {
      id: commandNodeId,
      type: 'command',
      position: { x: xOffset, y: yOffset },
      data: {
        name: command.name,
        description: command.description,
      },
    };
    nodes.push(commandNode);

    // 2. オプションノードを作成
    if (command.options && command.options.length > 0) {
      let optionYOffset = yOffset + 200;
      let previousOptionId: string | null = null;

      command.options.forEach((option, optIndex) => {
        const optionNodeId = `${commandNodeId}-option-${optIndex}`;

        const optionNode: AppNode = {
          id: optionNodeId,
          type: 'option',
          position: { x: xOffset, y: optionYOffset },
          data: {
            name: option.name,
            description: option.description,
            type: option.type,
            required: option.required,
          },
        };
        nodes.push(optionNode);

        // 最初のオプションはコマンドに接続
        if (optIndex === 0) {
          edges.push({
            id: `${commandNodeId}-${optionNodeId}`,
            source: commandNodeId,
            target: optionNodeId,
            sourceHandle: 'options',
            type: 'smoothstep',
            animated: true,
          });
        } else if (previousOptionId) {
          // 2番目以降はチェーン接続
          edges.push({
            id: `${previousOptionId}-${optionNodeId}`,
            source: previousOptionId,
            target: optionNodeId,
            type: 'smoothstep',
          });
        }

        previousOptionId = optionNodeId;
        optionYOffset += 150;
      });
    }

    // 3. レスポンスノードを作成
    const responseNodeId = `${commandNodeId}-response`;
    const responseNode: AppNode = {
      id: responseNodeId,
      type: 'response',
      position: { x: xOffset + 450, y: yOffset },
      data: {
        responseType: command.responseType,
        staticText: command.staticText,
        apiProfileId: command.apiProfileId,
        apiEndpoint: command.apiEndpoint,
        codeSnippet: command.codeSnippet,
      },
    };
    nodes.push(responseNode);

    // コマンドとレスポンスを接続
    edges.push({
      id: `${commandNodeId}-${responseNodeId}`,
      source: commandNodeId,
      target: responseNodeId,
      sourceHandle: 'response',
      type: 'smoothstep',
      animated: true,
    });

    yOffset += 500; // 次のコマンド用のオフセット
  });

  return { nodes, edges };
}

/**
 * React Flowのノード・エッジからSlashCommand配列に変換
 */
export function reactFlowToCommands(
  nodes: AppNode[],
  edges: AppEdge[]
): SlashCommand[] {
  const commands: SlashCommand[] = [];

  // コマンドノードをすべて取得
  const commandNodes = nodes.filter(n => n.type === 'command');

  commandNodes.forEach((commandNode) => {
    if (commandNode.type !== 'command') return;

    // このコマンドに接続されているオプションを取得
    const optionEdges = edges.filter(
      e => e.source === commandNode.id && e.sourceHandle === 'options'
    );

    const options: CommandOption[] = [];

    // オプションのチェーンを辿る
    let currentOptionEdge = optionEdges[0];
    while (currentOptionEdge) {
      const optionNode = nodes.find(n => n.id === currentOptionEdge.target);
      if (optionNode && optionNode.type === 'option') {
        options.push({
          name: optionNode.data.name,
          description: optionNode.data.description,
          type: optionNode.data.type,
          required: optionNode.data.required,
        });

        // 次のオプションを探す
        const nextEdge = edges.find(e => e.source === optionNode.id);
        currentOptionEdge = nextEdge || null;
      } else {
        break;
      }
    }

    // このコマンドに接続されているレスポンスを取得
    const responseEdge = edges.find(
      e => e.source === commandNode.id && e.sourceHandle === 'response'
    );

    let responseType = ResponseType.STATIC_TEXT;
    let staticText = '';
    let apiProfileId = '';
    let apiEndpoint = '';
    let codeSnippet = '';

    if (responseEdge) {
      const responseNode = nodes.find(n => n.id === responseEdge.target);
      if (responseNode && responseNode.type === 'response') {
        responseType = responseNode.data.responseType;
        staticText = responseNode.data.staticText || '';
        apiProfileId = responseNode.data.apiProfileId || '';
        apiEndpoint = responseNode.data.apiEndpoint || '';
        codeSnippet = responseNode.data.codeSnippet || '';
      }
    }

    // SlashCommandオブジェクトを構築
    commands.push({
      id: commandNode.id,
      name: commandNode.data.name,
      description: commandNode.data.description,
      options,
      responseType,
      staticText,
      apiProfileId,
      apiEndpoint,
      codeSnippet,
    });
  });

  return commands;
}

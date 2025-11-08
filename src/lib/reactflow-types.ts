import { Node, Edge } from '@xyflow/react';
import { CommandOption, ResponseType } from './types';

/**
 * CommandNodeのデータ型
 */
export interface CommandNodeData {
  name: string;
  description: string;
}

/**
 * OptionNodeのデータ型
 */
export interface OptionNodeData {
  name: string;
  description: string;
  type: 'string' | 'integer' | 'boolean' | 'user' | 'channel' | 'role';
  required: boolean;
}

/**
 * ResponseNodeのデータ型
 */
export interface ResponseNodeData {
  responseType: ResponseType;
  staticText?: string;
  apiProfileId?: string;
  apiEndpoint?: string;
  codeSnippet?: string;
}

/**
 * カスタムノード型の定義
 */
export type CommandNode = Node<CommandNodeData, 'command'>;
export type OptionNode = Node<OptionNodeData, 'option'>;
export type ResponseNode = Node<ResponseNodeData, 'response'>;

/**
 * 全ノード型のユニオン
 */
export type AppNode = CommandNode | OptionNode | ResponseNode;

/**
 * カスタムエッジ型
 */
export type AppEdge = Edge<{ label?: string }>;

/**
 * 接続タイプの列挙
 */
export enum ConnectionType {
  COMMAND_TO_OPTION = 'command-option',
  OPTION_TO_OPTION = 'option-chain',
  COMMAND_TO_RESPONSE = 'command-response',
}

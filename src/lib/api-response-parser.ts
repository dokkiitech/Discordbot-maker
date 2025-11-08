import { ApiField } from './types';

/**
 * APIレスポンスのJSON構造を解析してフィールド情報を抽出
 */
export function parseApiResponse(json: any): ApiField[] {
  const fields: ApiField[] = [];

  function traverse(obj: any, path: string = '') {
    if (obj === null) {
      fields.push({
        path: path || 'root',
        type: 'null',
        sampleValue: null,
      });
      return;
    }

    if (obj === undefined) {
      fields.push({
        path: path || 'root',
        type: 'undefined',
        sampleValue: undefined,
      });
      return;
    }

    const type = typeof obj;

    if (type === 'string' || type === 'number' || type === 'boolean') {
      fields.push({
        path: path || 'root',
        type: type as 'string' | 'number' | 'boolean',
        sampleValue: obj,
      });
      return;
    }

    if (Array.isArray(obj)) {
      fields.push({
        path: path || 'root',
        type: 'array',
        sampleValue: obj,
      });

      // 配列の最初の要素を解析（存在する場合）
      if (obj.length > 0) {
        traverse(obj[0], `${path}[0]`);
      }
      return;
    }

    if (type === 'object') {
      fields.push({
        path: path || 'root',
        type: 'object',
        sampleValue: obj,
      });

      // オブジェクトのプロパティを再帰的に解析
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const newPath = path ? `${path}.${key}` : key;
          traverse(obj[key], newPath);
        }
      }
      return;
    }
  }

  traverse(json);
  return fields;
}

/**
 * フィールドパスからネストされた値を取得
 */
export function getValueByPath(obj: any, path: string): any {
  // 配列アクセス [0] を処理
  const parts = path.split(/\.|\[|\]/).filter(Boolean);

  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

/**
 * フィールドを階層構造に整理
 */
export interface FieldNode {
  path: string;
  name: string;
  type: ApiField['type'];
  sampleValue?: any;
  children?: FieldNode[];
  isLeaf: boolean;
}

export function organizeFieldsHierarchy(fields: ApiField[]): FieldNode[] {
  const root: FieldNode[] = [];
  const nodeMap = new Map<string, FieldNode>();

  // プリミティブ型のみをリーフとして扱う
  const isLeafType = (type: ApiField['type']) =>
    type === 'string' || type === 'number' || type === 'boolean' || type === 'null';

  // 全フィールドをノードに変換
  fields.forEach(field => {
    const parts = field.path.split(/\.|\[|\]/).filter(Boolean);
    const name = parts[parts.length - 1] || field.path;

    const node: FieldNode = {
      path: field.path,
      name,
      type: field.type,
      sampleValue: field.sampleValue,
      children: field.type === 'object' || field.type === 'array' ? [] : undefined,
      isLeaf: isLeafType(field.type),
    };

    nodeMap.set(field.path, node);
  });

  // 親子関係を構築
  fields.forEach(field => {
    const node = nodeMap.get(field.path);
    if (!node) return;

    const parts = field.path.split(/\.|\[|\]/).filter(Boolean);

    if (parts.length === 1) {
      // ルートレベルのフィールド
      root.push(node);
    } else {
      // 親パスを構築
      const parentParts = parts.slice(0, -1);
      const parentPath = parentParts.join('.');
      const parent = nodeMap.get(parentPath);

      if (parent && parent.children) {
        parent.children.push(node);
      }
    }
  });

  return root;
}

/**
 * 選択可能なフィールド（リーフノード）のみをフラット化
 */
export function getSelectableFields(fields: ApiField[]): ApiField[] {
  return fields.filter(field =>
    field.type === 'string' ||
    field.type === 'number' ||
    field.type === 'boolean' ||
    field.type === 'null'
  );
}

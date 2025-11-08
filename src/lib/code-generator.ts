import { FieldMapping, ApiField } from './types';

/**
 * レスポンスフォーマットのテンプレート種類
 */
export enum ResponseTemplate {
  SIMPLE_TEXT = 'simple_text',
  MULTI_LINE = 'multi_line',
  EMBED = 'embed',
  JSON_FORMATTED = 'json_formatted',
}

/**
 * フィールドマッピングからカスタムロジックのJavaScriptコードを生成
 */
export function generateCustomLogic(
  fieldMappings: FieldMapping[],
  template: ResponseTemplate = ResponseTemplate.SIMPLE_TEXT
): string {
  if (fieldMappings.length === 0) {
    return `// API応答を処理してDiscord応答を返す
const data = await apiResponse.json();
return {
  content: JSON.stringify(data, null, 2)
};`;
  }

  switch (template) {
    case ResponseTemplate.SIMPLE_TEXT:
      return generateSimpleTextCode(fieldMappings);
    case ResponseTemplate.MULTI_LINE:
      return generateMultiLineCode(fieldMappings);
    case ResponseTemplate.EMBED:
      return generateEmbedCode(fieldMappings);
    case ResponseTemplate.JSON_FORMATTED:
      return generateJsonFormattedCode(fieldMappings);
    default:
      return generateSimpleTextCode(fieldMappings);
  }
}

/**
 * シンプルなテキスト形式のコード生成
 */
function generateSimpleTextCode(fieldMappings: FieldMapping[]): string {
  const lines: string[] = ['const data = await apiResponse.json();'];

  // フィールドの値を変数に抽出
  fieldMappings.forEach(mapping => {
    const varName = fieldPathToVarName(mapping.fieldPath);
    lines.push(`const ${varName} = ${pathToAccessor(mapping.fieldPath)};`);
  });

  // テキストを構築
  const textParts = fieldMappings.map(mapping => {
    const varName = fieldPathToVarName(mapping.fieldPath);
    const format = mapping.formatString || '{value}';
    const formatted = format.replace('{value}', `\${${varName}}`);
    return `${mapping.displayLabel}: ${formatted}`;
  });

  lines.push('');
  lines.push('return {');
  lines.push(`  content: \`${textParts.join(', ')}\``);
  lines.push('};');

  return lines.join('\n');
}

/**
 * 複数行テキスト形式のコード生成
 */
function generateMultiLineCode(fieldMappings: FieldMapping[]): string {
  const lines: string[] = ['const data = await apiResponse.json();'];

  // フィールドの値を変数に抽出
  fieldMappings.forEach(mapping => {
    const varName = fieldPathToVarName(mapping.fieldPath);
    lines.push(`const ${varName} = ${pathToAccessor(mapping.fieldPath)};`);
  });

  // 複数行テキストを構築
  const textLines = fieldMappings.map(mapping => {
    const varName = fieldPathToVarName(mapping.fieldPath);
    const format = mapping.formatString || '{value}';
    const formatted = format.replace('{value}', `\${${varName}}`);
    return `**${mapping.displayLabel}**: ${formatted}`;
  });

  lines.push('');
  lines.push('return {');
  lines.push('  content: `' + textLines.join('\\n') + '`');
  lines.push('};');

  return lines.join('\n');
}

/**
 * Discord Embed形式のコード生成
 */
function generateEmbedCode(fieldMappings: FieldMapping[]): string {
  const lines: string[] = ['const data = await apiResponse.json();'];

  // フィールドの値を変数に抽出
  fieldMappings.forEach(mapping => {
    const varName = fieldPathToVarName(mapping.fieldPath);
    lines.push(`const ${varName} = ${pathToAccessor(mapping.fieldPath)};`);
  });

  lines.push('');
  lines.push('return {');
  lines.push('  embeds: [{');
  lines.push('    title: "API Response",');
  lines.push('    color: 0x5865F2,');
  lines.push('    fields: [');

  fieldMappings.forEach((mapping, index) => {
    const varName = fieldPathToVarName(mapping.fieldPath);
    const format = mapping.formatString || '{value}';
    const formatted = format.replace('{value}', `\${${varName}}`);
    const comma = index < fieldMappings.length - 1 ? ',' : '';

    lines.push('      {');
    lines.push(`        name: "${mapping.displayLabel}",`);
    lines.push(`        value: \`${formatted}\`,`);
    lines.push('        inline: true');
    lines.push(`      }${comma}`);
  });

  lines.push('    ],');
  lines.push('    timestamp: new Date().toISOString()');
  lines.push('  }]');
  lines.push('};');

  return lines.join('\n');
}

/**
 * JSON整形形式のコード生成
 */
function generateJsonFormattedCode(fieldMappings: FieldMapping[]): string {
  const lines: string[] = ['const data = await apiResponse.json();'];

  lines.push('');
  lines.push('const selectedData = {');

  fieldMappings.forEach((mapping, index) => {
    const varName = fieldPathToVarName(mapping.fieldPath);
    const comma = index < fieldMappings.length - 1 ? ',' : '';
    lines.push(`  "${mapping.displayLabel}": ${pathToAccessor(mapping.fieldPath)}${comma}`);
  });

  lines.push('};');
  lines.push('');
  lines.push('return {');
  lines.push('  content: "```json\\n" + JSON.stringify(selectedData, null, 2) + "\\n```"');
  lines.push('};');

  return lines.join('\n');
}

/**
 * フィールドパスをJavaScriptのプロパティアクセス形式に変換
 * 例: "data.main.temp" → "data.main.temp"
 * 例: "items[0].name" → "items[0].name"
 */
function pathToAccessor(path: string): string {
  return `data.${path}`;
}

/**
 * フィールドパスを変数名に変換
 * 例: "data.main.temp" → "temp"
 * 例: "weather[0].description" → "weatherDescription"
 */
function fieldPathToVarName(path: string): string {
  // 配列アクセスを削除
  const cleaned = path.replace(/\[\d+\]/g, '');
  // ドットで分割して最後の部分を取得
  const parts = cleaned.split('.');

  if (parts.length === 1) {
    return parts[0];
  }

  // キャメルケースに変換
  return parts.slice(-2).map((part, index) => {
    if (index === 0) return part;
    return part.charAt(0).toUpperCase() + part.slice(1);
  }).join('');
}

/**
 * フィールドからデフォルトのフォーマット文字列を生成
 */
export function getDefaultFormat(field: ApiField): string {
  switch (field.type) {
    case 'number':
      // 数値の場合、サンプル値から適切なフォーマットを推測
      if (typeof field.sampleValue === 'number') {
        if (field.path.toLowerCase().includes('temp')) {
          return '{value}°C';
        }
        if (field.path.toLowerCase().includes('price') || field.path.toLowerCase().includes('cost')) {
          return '${value}';
        }
        if (field.path.toLowerCase().includes('percent')) {
          return '{value}%';
        }
      }
      return '{value}';

    case 'boolean':
      return '{value} ? "はい" : "いいえ"';

    case 'string':
    default:
      return '{value}';
  }
}

/**
 * フィールドからデフォルトの表示ラベルを生成
 */
export function getDefaultLabel(field: ApiField): string {
  const parts = field.path.split(/\.|\[|\]/).filter(Boolean);
  const lastPart = parts[parts.length - 1];

  // キャメルケースやスネークケースを日本語に変換するロジック（簡易版）
  const labelMap: Record<string, string> = {
    'temp': '気温',
    'temperature': '気温',
    'humidity': '湿度',
    'pressure': '気圧',
    'description': '説明',
    'name': '名前',
    'title': 'タイトル',
    'value': '値',
    'count': '件数',
    'total': '合計',
    'price': '価格',
    'amount': '金額',
    'date': '日付',
    'time': '時刻',
    'status': 'ステータス',
    'message': 'メッセージ',
    'id': 'ID',
    'url': 'URL',
  };

  return labelMap[lastPart.toLowerCase()] || lastPart;
}

/**
 * APIフィールドからデフォルトのフィールドマッピングを作成
 */
export function createDefaultFieldMappings(fields: ApiField[]): FieldMapping[] {
  // プリミティブ型のフィールドのみを対象とする
  const selectableFields = fields.filter(f =>
    f.type === 'string' || f.type === 'number' || f.type === 'boolean'
  );

  return selectableFields.map(field => ({
    fieldPath: field.path,
    displayLabel: getDefaultLabel(field),
    formatString: getDefaultFormat(field),
  }));
}

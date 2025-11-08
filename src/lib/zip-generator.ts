import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * 生成されたファイル情報
 */
export interface GeneratedFile {
  path: string;
  content: string;
}

/**
 * 生成されたファイルをZIPに圧縮してダウンロード
 * @param files 生成されたファイルの配列
 * @param botName Bot名（ファイル名に使用）
 */
export async function downloadAsZip(files: GeneratedFile[], botName: string): Promise<void> {
  const zip = new JSZip();

  // 各ファイルをZIPに追加
  files.forEach((file) => {
    zip.file(file.path, file.content);
  });

  // ZIPファイルを生成
  const blob = await zip.generateAsync({ type: 'blob' });

  // タイムスタンプを生成（YYYYMMDD-HHMMSS形式）
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '-')
    .substring(0, 19);

  // ファイル名を生成
  const filename = `${botName}-${timestamp}.zip`;

  // ダウンロード
  saveAs(blob, filename);
}

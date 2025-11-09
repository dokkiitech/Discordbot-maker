/**
 * 全テンプレートのコード生成テスト
 */
import { BOT_TEMPLATES } from './src/lib/templates.ts';
import { generateBotCode } from './src/lib/template-generator.ts';
import { BotConfig, RepositoryConfig, BotDeploymentType } from './src/lib/types.ts';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const TEST_OUTPUT_DIR = path.join(__dirname, 'test-output');

// テスト用の設定
const testRepoConfig: RepositoryConfig = {
  name: 'test-bot',
  branch: 'main',
  description: 'Test bot',
  isPrivate: true,
};

async function testTemplate(templateId: string) {
  console.log(`\n========================================`);
  console.log(`Testing: ${templateId}`);
  console.log(`========================================`);

  const template = BOT_TEMPLATES.find(t => t.id === templateId);
  if (!template) {
    console.error(`❌ Template not found: ${templateId}`);
    return false;
  }

  // テンプレートからBotConfig作成
  const botConfig: BotConfig = {
    name: template.name,
    description: template.description,
    applicationId: 'TEST_APP_ID',
    publicKey: 'TEST_PUBLIC_KEY',
    botToken: 'TEST_BOT_TOKEN',
    deploymentType: template.defaultBotConfig.deploymentType || BotDeploymentType.INTERACTIONS_ENDPOINT,
  };

  // コマンドにIDを付与
  const commands = template.commands.map((cmd, i) => ({
    ...cmd,
    id: `${templateId}-${i}`,
  }));

  try {
    // コード生成
    const result = generateBotCode(
      botConfig,
      template.apiProfiles,
      commands as any
    );

    const generatedFiles = result.files;

    console.log(`✓ Generated ${generatedFiles.length} files`);

    // 出力ディレクトリ作成
    const outputDir = path.join(TEST_OUTPUT_DIR, templateId);
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true });
    }
    fs.mkdirSync(outputDir, { recursive: true });

    // ファイル書き込み
    for (const file of generatedFiles) {
      const filePath = path.join(outputDir, file.path);
      const fileDir = path.dirname(filePath);
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }
      fs.writeFileSync(filePath, file.content);
    }

    console.log(`✓ Files written to ${outputDir}`);

    // TypeScriptコンパイルチェック
    try {
      // package.jsonがない場合はスキップ
      if (!fs.existsSync(path.join(outputDir, 'package.json'))) {
        console.log('⚠ No package.json, skipping build test');
        return true;
      }

      // npm installはスキップ（依存関係が多すぎるため）
      // 代わりにtscでチェック
      const tsconfigPath = path.join(outputDir, 'tsconfig.json');
      if (fs.existsSync(tsconfigPath)) {
        console.log('Running TypeScript check...');
        execSync(`npx tsc --noEmit --project ${tsconfigPath}`, {
          cwd: outputDir,
          stdio: 'inherit',
        });
        console.log(`✅ TypeScript check passed`);
      } else {
        console.log('⚠ No tsconfig.json found');
      }

      return true;
    } catch (buildError: any) {
      console.error(`❌ Build failed: ${buildError.message}`);
      return false;
    }
  } catch (error: any) {
    console.error(`❌ Code generation failed: ${error.message}`);
    console.error(error.stack);
    return false;
  }
}

async function main() {
  console.log('🚀 Testing all bot templates...\n');

  const results: Record<string, boolean> = {};

  // API連携ありのテンプレート
  const templatesWithAPI = [
    'dog-images',       // 犬の画像（fieldMappings）
    'joke-bot',         // ジョーク（複数fieldMappings）
    'advice-bot',       // アドバイス（ネストしたfieldPath）
    'numbers-trivia',   // 数字トリビア（fieldMappingsなし）
    'github-info',      // GitHub（複数fieldMappings）
  ];

  // STATIC_TEXTのみのテンプレート
  const staticTemplates = [
    'cat-images',       // 猫（シンプルなSTATIC_TEXT）
    'fun-games',        // ゲーム（random関数あり）
    'simple-greeting',  // 挨拶（基本的なSTATIC_TEXT）
  ];

  // 全テンプレートをテスト
  const allTemplates = [...templatesWithAPI, ...staticTemplates];

  for (const templateId of allTemplates) {
    results[templateId] = await testTemplate(templateId);
  }

  // 結果サマリー
  console.log('\n========================================');
  console.log('Test Summary');
  console.log('========================================');

  let passCount = 0;
  let failCount = 0;

  for (const [templateId, passed] of Object.entries(results)) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${templateId}`);
    if (passed) passCount++;
    else failCount++;
  }

  console.log('\n----------------------------------------');
  console.log(`Total: ${passCount + failCount}`);
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);
  console.log('----------------------------------------\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch(console.error);

import type {
  RepositoryConfig,
  BotConfig,
  ApiProfile,
  SlashCommand,
  GeneratedFile,
  EnvVariable,
  GenerationResult,
} from './types';
import { AuthType, ResponseType, BotDeploymentType } from './types';

/**
 * Discord Botのコードを生成
 */
export function generateBotCode(
  botConfig: BotConfig,
  apiProfiles: ApiProfile[],
  commands: SlashCommand[]
): GenerationResult {
  const files: GeneratedFile[] = [];
  const envVariables: EnvVariable[] = [];

  // デプロイメントタイプに応じて分岐
  const deploymentType = botConfig.deploymentType || BotDeploymentType.INTERACTIONS_ENDPOINT;

  if (deploymentType === BotDeploymentType.INTERACTIONS_ENDPOINT) {
    return generateInteractionsEndpointBot(botConfig, apiProfiles, commands);
  } else {
    return generateGatewayBot(botConfig, apiProfiles, commands);
  }
}

/**
 * Interactions Endpoint Bot (Cloudflare Workers) を生成
 */
function generateInteractionsEndpointBot(
  botConfig: BotConfig,
  apiProfiles: ApiProfile[],
  commands: SlashCommand[]
): GenerationResult {
  const files: GeneratedFile[] = [];
  const envVariables: EnvVariable[] = [];

  // 環境変数を抽出
  envVariables.push({
    key: 'DISCORD_APPLICATION_ID',
    value: botConfig.applicationId || 'your_discord_application_id',
    description: 'Discord Application ID',
  });

  envVariables.push({
    key: 'DISCORD_PUBLIC_KEY',
    value: botConfig.publicKey || 'your_discord_public_key',
    description: 'Discord Public Key',
  });

  envVariables.push({
    key: 'DISCORD_BOT_TOKEN',
    value: botConfig.botToken || 'your_discord_bot_token',
    description: 'Discord Bot Token (コマンド登録用)',
  });

  // ランダムなシークレットを生成
  const registerSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  envVariables.push({
    key: 'REGISTER_SECRET',
    value: registerSecret,
    description: 'コマンド登録エンドポイント用シークレット',
  });

  // APIプロファイルから環境変数を抽出
  apiProfiles.forEach((profile) => {
    if (profile.authType !== AuthType.NONE && profile.apiKey) {
      envVariables.push({
        key: profile.envVarKey,
        value: profile.apiKey,
        description: `API Key for ${profile.name}`,
      });
    }

    if (profile.envVarUrl) {
      envVariables.push({
        key: profile.envVarUrl,
        value: profile.baseUrl,
        description: `Base URL for ${profile.name}`,
      });
    }
  });

  // 1. index.ts を生成
  files.push({
    path: 'src/index.ts',
    content: generateIndexTs(botConfig, apiProfiles, commands),
  });

  // 2. wrangler.toml を生成
  files.push({
    path: 'wrangler.toml',
    content: generateWranglerToml(botConfig),
  });

  // 3. package.json を生成
  files.push({
    path: 'package.json',
    content: generatePackageJson(botConfig),
  });

  // 4. tsconfig.json を生成
  files.push({
    path: 'tsconfig.json',
    content: generateTsConfig(),
  });

  // 5. README.md を生成
  files.push({
    path: 'README.md',
    content: generateReadme(botConfig, envVariables, registerSecret),
  });

  // 6. .gitignore を生成
  files.push({
    path: '.gitignore',
    content: generateGitignore(),
  });

  const setupInstructions = generateSetupInstructions(envVariables, registerSecret);

  return {
    files,
    envVariables,
    setupInstructions,
  };
}

/**
 * Gateway Bot (discord.js) を生成
 */
function generateGatewayBot(
  botConfig: BotConfig,
  apiProfiles: ApiProfile[],
  commands: SlashCommand[]
): GenerationResult {
  const files: GeneratedFile[] = [];
  const envVariables: EnvVariable[] = [];

  // 環境変数を抽出
  envVariables.push({
    key: 'DISCORD_BOT_TOKEN',
    value: botConfig.botToken || 'your_discord_bot_token',
    description: 'Discord Bot Token',
  });

  envVariables.push({
    key: 'DISCORD_APPLICATION_ID',
    value: botConfig.applicationId || 'your_discord_application_id',
    description: 'Discord Application ID',
  });

  // APIプロファイルから環境変数を抽出
  apiProfiles.forEach((profile) => {
    if (profile.authType !== AuthType.NONE && profile.apiKey) {
      envVariables.push({
        key: profile.envVarKey,
        value: profile.apiKey,
        description: `API Key for ${profile.name}`,
      });
    }

    if (profile.envVarUrl) {
      envVariables.push({
        key: profile.envVarUrl,
        value: profile.baseUrl,
        description: `Base URL for ${profile.name}`,
      });
    }
  });

  // 1. index.ts を生成（discord.js版）
  files.push({
    path: 'src/index.ts',
    content: generateGatewayIndexTs(botConfig, apiProfiles, commands),
  });

  // 2. package.json を生成（discord.js版）
  files.push({
    path: 'package.json',
    content: generateGatewayPackageJson(botConfig),
  });

  // 3. tsconfig.json を生成
  files.push({
    path: 'tsconfig.json',
    content: generateGatewayTsConfig(),
  });

  // 4. .env.example を生成
  files.push({
    path: '.env.example',
    content: generateEnvExample(envVariables),
  });

  // 5. README.md を生成
  files.push({
    path: 'README.md',
    content: generateGatewayReadme(botConfig, envVariables),
  });

  // 6. .gitignore を生成
  files.push({
    path: '.gitignore',
    content: generateGitignore(),
  });

  const setupInstructions = generateGatewaySetupInstructions(envVariables);

  return {
    files,
    envVariables,
    setupInstructions,
  };
}

/**
 * index.ts を生成
 */
function generateIndexTs(
  botConfig: BotConfig,
  apiProfiles: ApiProfile[],
  commands: SlashCommand[]
): string {
  // コマンドハンドラーを生成
  const commandHandlers = commands
    .map((cmd) => generateCommandHandler(cmd, apiProfiles))
    .join('\n\n');

  // コマンド登録用の配列を生成
  const commandDefinitions = commands
    .map((cmd) => {
      const optionsArray = cmd.options && cmd.options.length > 0
        ? `,\n    options: ${JSON.stringify(cmd.options.map(opt => ({
            name: opt.name,
            description: opt.description,
            type: getDiscordOptionType(opt.type),
            required: opt.required,
          })), null, 6).replace(/\n/g, '\n    ')}`
        : '';
      return `  {
    name: '${cmd.name}',
    description: '${cmd.description}'${optionsArray}
  }`;
    })
    .join(',\n');

  return `import { verifyKey } from 'discord-interactions';

export interface Env {
  DISCORD_APPLICATION_ID: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_BOT_TOKEN: string;
  REGISTER_SECRET: string;
${apiProfiles
  .map(
    (p) => {
      const parts = [];
      if (p.envVarKey) parts.push(`  ${p.envVarKey}: string;`);
      if (p.envVarUrl) parts.push(`  ${p.envVarUrl}: string;`);
      return parts.join('\n');
    }
  )
  .filter(s => s)
  .join('\n')}
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // コマンド登録エンドポイント
    if (url.pathname === '/register') {
      const token = url.searchParams.get('token');
      
      if (token !== env.REGISTER_SECRET) {
        return new Response('Unauthorized', { status: 401 });
      }

      try {
        await registerCommands(env);
        return new Response('[成功] コマンド登録が完了しました！\n\nDiscordでスラッシュコマンドが使用可能になりました。', {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      } catch (error) {
        console.error('Failed to register commands:', error);
        return new Response('[エラー] コマンド登録に失敗しました: ' + (error as Error).message, {
          status: 500,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }
    }

    // Verify Discord request
    const signature = request.headers.get('X-Signature-Ed25519');
    const timestamp = request.headers.get('X-Signature-Timestamp');
    const body = await request.clone().text();

    if (!signature || !timestamp) {
      return new Response('Missing signature headers', { status: 401 });
    }

    const isValid = verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);
    if (!isValid) {
      return new Response('Invalid signature', { status: 401 });
    }

    const interaction = JSON.parse(body);

    // Handle PING
    if (interaction.type === 1) {
      return Response.json({ type: 1 });
    }

    // Handle application commands
    if (interaction.type === 2) {
      const commandName = interaction.data.name;

      switch (commandName) {
${commands
  .map(
    (cmd) => `        case '${cmd.name}':
          return await handle${capitalize(cmd.name)}(interaction, env);`
  )
  .join('\n')}
        default:
          return Response.json({
            type: 4,
            data: { content: 'Unknown command' },
          });
      }
    }

    return Response.json({ error: 'Unknown interaction type' }, { status: 400 });
  },
};

${commandHandlers}

// コマンド登録関数
async function registerCommands(env: Env): Promise<void> {
  const commands = [
${commandDefinitions}
  ];

  const response = await fetch(
    \`https://discord.com/api/v10/applications/\${env.DISCORD_APPLICATION_ID}/commands\`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: \`Bot \${env.DISCORD_BOT_TOKEN}\`,
      },
      body: JSON.stringify(commands),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(\`Discord API error: \${response.status} - \${errorText}\`);
  }
}
`;
}

/**
 * 各コマンドのハンドラーを生成
 */
function generateCommandHandler(
  command: SlashCommand,
  apiProfiles: ApiProfile[]
): string {
  const functionName = `handle${capitalize(command.name)}`;

  if (command.responseType === ResponseType.STATIC_TEXT) {
    // オプション値の取得ロジック
    const optionGetters = command.options && command.options.length > 0
      ? command.options.map(opt => {
          return `  const ${opt.name} = interaction.data.options?.find((o: any) => o.name === '${opt.name}')?.value;`;
        }).join('\n')
      : '';

    // テンプレート文字列の処理
    let contentExpression = `\`${command.staticText || 'Hello from ' + command.name}\``;

    // {optionName} を ${optionName} に置換
    if (command.options && command.options.length > 0) {
      command.options.forEach(opt => {
        const regex = new RegExp(`\\{${opt.name}\\}`, 'g');
        contentExpression = contentExpression.replace(regex, `\${${opt.name}}`);
      });
    }

    // {random(...)} パターンを処理
    // 例: {random(1, 6)} → ランダム関数呼び出し
    // 例: {random("表", "裏")} → 配列からランダム選択
    contentExpression = contentExpression.replace(
      /\{random\((.*?)\)\}/g,
      (match, args) => {
        // 数値範囲の場合: random(1, 6) → Math.floor(Math.random() * (6 - 1 + 1)) + 1
        if (/^\d+\s*,\s*\d+$/.test(args.trim())) {
          const parts = args.split(',').map((s: string) => s.trim());
          if (parts.length === 2) {
            const min = parts[0];
            const max = parts[1];
            return `\${Math.floor(Math.random() * (${max} - ${min} + 1)) + ${min}}`;
          }
        }
        // 文字列配列の場合: random("表", "裏") → ['表', '裏'][Math.floor(Math.random() * 2)]
        const items = args.split(',').map((s: string) => s.trim());
        return `\${[${items.join(', ')}][Math.floor(Math.random() * ${items.length})]}`;
      }
    );

    return `async function ${functionName}(interaction: any, env: Env): Promise<Response> {
${optionGetters}
  const content = ${contentExpression};

  return Response.json({
    type: 4,
    data: {
      content,
    },
  });
}`;
  }

  // API Call
  const profile = apiProfiles.find((p) => p.id === command.apiProfileId);
  if (!profile) {
    return `async function ${functionName}(interaction: any, env: Env): Promise<Response> {
  return Response.json({
    type: 4,
    data: { content: 'API profile not configured' },
  });
}`;
  }

  // API呼び出しロジック
  let authHeader = '';
  let urlParams = '';

  if (profile.authType === AuthType.API_KEY_HEADER) {
    authHeader = `headers.set('${profile.apiKeyName}', env.${profile.envVarKey});`;
  } else if (profile.authType === AuthType.BEARER_TOKEN) {
    authHeader = `headers.set('Authorization', \`Bearer \${env.${profile.envVarKey}}\`);`;
  } else if (profile.authType === AuthType.API_KEY_QUERY) {
    urlParams = `url.searchParams.set('${profile.apiKeyName}', env.${profile.envVarKey});`;
  }

  // カスタムロジックまたはフィールドマッピングに基づく整形出力を生成
  let customLogic: string;

  if (command.codeSnippet) {
    // ユーザー定義のカスタムロジック
    customLogic = command.codeSnippet;
  } else if (command.fieldMappings && command.fieldMappings.length > 0) {
    // フィールドマッピングに基づく整形出力
    const mappingLogic = command.fieldMappings.map(mapping => {
      const fieldAccessor = `data.${mapping.fieldPath}`;
      let formatStr = mapping.formatString || `{${mapping.fieldPath}}`;

      // formatString内の{fieldPath}を実際の値で置換
      const fieldPattern = new RegExp(`\\{${mapping.fieldPath.replace(/\./g, '\\.')}\\}`, 'g');
      formatStr = formatStr.replace(fieldPattern, `\${${fieldAccessor}}`);

      // 他のフィールド参照も置換（ネストされたフィールド対応）
      command.fieldMappings?.forEach(m => {
        const pattern = new RegExp(`\\{${m.fieldPath.replace(/\./g, '\\.')}\\}`, 'g');
        formatStr = formatStr.replace(pattern, `\${data.${m.fieldPath}}`);
      });

      return `    if (${fieldAccessor} !== null && ${fieldAccessor} !== undefined) parts.push(\`${formatStr}\`);`;
    }).join('\n');

    customLogic = `
    const data = await apiResponse.json() as any;
    const parts: string[] = [];
${mappingLogic}
    return {
      content: parts.join('\\n'),
    };`;
  } else {
    // デフォルト: 生のJSON出力
    customLogic = `
    const data = await apiResponse.json() as any;
    return {
      content: JSON.stringify(data, null, 2),
    };`;
  }

  // エンドポイント内の変数を置換するロジックを生成（Cloudflare Workers版）
  const endpointVariableReplacementCF = command.options && command.options.length > 0
    ? command.options.map(opt => {
        const getterMethod = opt.type === 'integer' ? 'getInteger' :
                           opt.type === 'boolean' ? 'getBoolean' :
                           opt.type === 'user' ? 'getUser' :
                           opt.type === 'channel' ? 'getChannel' :
                           opt.type === 'role' ? 'getRole' : 'getString';
        return `endpoint = endpoint.replace('{${opt.name}}', String(interaction.data.options?.find((o: any) => o.name === '${opt.name}')?.value || ''));`;
      }).join('\n    ')
    : '';

  return `async function ${functionName}(interaction: any, env: Env): Promise<Response> {
  try {
    const baseUrl = env.${profile.envVarUrl};
    let endpoint = '${command.apiEndpoint || ''}';

    // コマンドオプションから値を取得してエンドポイントの変数を置換
    ${endpointVariableReplacementCF}

    const url = new URL(endpoint, baseUrl);

    ${urlParams}

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    ${authHeader}

    const apiResponse = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!apiResponse.ok) {
      throw new Error(\`API request failed: \${apiResponse.status}\`);
    }

    const responseData = await (async () => {
      ${customLogic}
    })();

    return Response.json({
      type: 4,
      data: responseData,
    });
  } catch (error) {
    console.error('Error in ${functionName}:', error);
    return Response.json({
      type: 4,
      data: {
        content: 'エラーが発生しました。もう一度お試しください。',
      },
    });
  }
}`;
}

/**
 * wrangler.toml を生成
 */
function generateWranglerToml(botConfig: BotConfig): string {
  return `name = "${botConfig.name.toLowerCase().replace(/\s+/g, '-')}"
main = "src/index.ts"
compatibility_date = "2025-01-01"

[vars]
DISCORD_APPLICATION_ID = "${botConfig.applicationId || 'YOUR_DISCORD_APPLICATION_ID'}"

# Secrets (set using: wrangler secret put DISCORD_PUBLIC_KEY)
# DISCORD_PUBLIC_KEY
# Other API keys...
`;
}

/**
 * package.json を生成
 */
function generatePackageJson(botConfig: BotConfig): string {
  return JSON.stringify(
    {
      name: botConfig.name.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: botConfig.description || 'Discord Bot powered by Cloudflare Workers',
      main: 'src/index.ts',
      scripts: {
        build: 'tsc --noEmit',
        dev: 'wrangler dev',
        deploy: 'wrangler deploy',
      },
      dependencies: {
        'discord-interactions': '^3.4.0',
      },
      devDependencies: {
        '@cloudflare/workers-types': '^4.20241127.0',
        wrangler: '^3.93.0',
        typescript: '^5.7.2',
      },
    },
    null,
    2
  );
}

/**
 * tsconfig.json を生成
 */
function generateTsConfig(): string {
  return JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2021',
        lib: ['ES2021'],
        module: 'ES2022',
        moduleResolution: 'node',
        types: ['@cloudflare/workers-types'],
        resolveJsonModule: true,
        allowJs: true,
        checkJs: false,
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules'],
    },
    null,
    2
  );
}

/**
 * README.md を生成
 */
function generateReadme(botConfig: BotConfig, envVariables: EnvVariable[], registerSecret: string): string {
  return `# ${botConfig.name}

${botConfig.description || 'Discord Bot powered by Cloudflare Workers'}

## セットアップ

### 1. 依存関係のインストール

\`\`\`bash
npm install
\`\`\`

### 2. 環境変数の設定

以下の環境変数をCloudflare Workersに設定してください:

${envVariables.map((env) => `- \`${env.key}\`: ${env.description}`).join('\n')}

#### 設定方法

\`\`\`bash
# wranglerコマンドで設定
${envVariables.map((env) => `wrangler secret put ${env.key}`).join('\n')}
\`\`\`

または、Cloudflare Dashboardから設定:
1. Workers & Pages → あなたのWorkerを選択
2. Settings → Variables → Edit variables
3. 上記の変数を追加

### 3. デプロイ

\`\`\`bash
npm run deploy
\`\`\`

### 4. Discord Botの設定

1. [Discord Developer Portal](https://discord.com/developers/applications)にアクセス
2. あなたのアプリケーションを選択
3. Bot → Interactions Endpoint URLに、デプロイしたWorkerのURLを設定

### 5. スラッシュコマンドの登録

デプロイ後、以下のURLにアクセスしてスラッシュコマンドを登録してください:

\`\`\`
https://your-worker-url.workers.dev/register?token=${registerSecret}
\`\`\`

**重要:** このURLは1回だけアクセスすれば十分です。成功すると「✅ コマンド登録が完了しました！」と表示されます。

## 開発

ローカル開発サーバーを起動:

\`\`\`bash
npm run dev
\`\`\`

## 生成元

このBotは [DiscordBot-Maker](https://github.com/yourusername/discordbot-maker) で生成されました。
`;
}

/**
 * .gitignore を生成
 */
function generateGitignore(): string {
  return `node_modules/
.wrangler/
.dev.vars
.env
.env.local
*.log
dist/
`;
}

/**
 * セットアップ手順を生成
 */
function generateSetupInstructions(envVariables: EnvVariable[], registerSecret: string): string {
  return `# Discord Bot セットアップ手順

## 1. リポジトリのクローン

GitHubからリポジトリをクローンしてください。

## 2. 依存関係のインストール

\`\`\`bash
npm install
\`\`\`

## 3. 環境変数の設定

以下の環境変数をCloudflare Workersに設定してください:

${envVariables.map((env) => `### ${env.key}\n${env.description}\n値: \`${env.value}\``).join('\n\n')}

## 4. デプロイ

\`\`\`bash
npm run deploy
\`\`\`

## 5. スラッシュコマンドの登録

デプロイ後、以下のURLにブラウザでアクセスしてスラッシュコマンドを登録してください:

\`\`\`
https://your-worker-url.workers.dev/register?token=${registerSecret}
\`\`\`

成功すると「✅ コマンド登録が完了しました！」と表示されます。
`;
}

/**
 * 文字列の最初の文字を大文字に
 */
function capitalize(str: string): string {
  // ハイフン（-）とアンダースコア（_）をキャメルケースに変換
  // 例: "address-search" -> "AddressSearch"
  // 例: "my_command" -> "MyCommand"
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * コマンドオプションの型をDiscord APIの型番号に変換
 */
function getDiscordOptionType(type: string): number {
  const typeMap: Record<string, number> = {
    'string': 3,
    'integer': 4,
    'boolean': 5,
    'user': 6,
    'channel': 7,
    'role': 8,
  };
  return typeMap[type] || 3; // デフォルトは文字列
}

/**
 * Gateway Bot用のindex.ts を生成 (discord.js)
 */
function generateGatewayIndexTs(
  botConfig: BotConfig,
  apiProfiles: ApiProfile[],
  commands: SlashCommand[]
): string {
  const commandHandlers = commands
    .map((cmd) => generateGatewayCommandHandler(cmd, apiProfiles))
    .join('\n\n');

  const commandDefinitions = commands
    .map((cmd) => {
      const optionsArray = cmd.options && cmd.options.length > 0
        ? `,\n    options: ${JSON.stringify(cmd.options.map(opt => ({
            name: opt.name,
            description: opt.description,
            type: getDiscordOptionType(opt.type),
            required: opt.required,
          })), null, 6).replace(/\n/g, '\n    ')}`
        : '';
      return `  {
    name: '${cmd.name}',
    description: '${cmd.description}'${optionsArray}
  }`;
    })
    .join(',\n');

  return `import { Client, GatewayIntentBits, REST, Routes, ChatInputCommandInteraction } from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// コマンド定義
const commands = [
${commandDefinitions}
];

// コマンドハンドラー
${commandHandlers}

client.on('ready', async () => {
  console.log(\`[接続] Logged in as \${client.user?.tag}!\`);

  // スラッシュコマンドを登録
  try {
    console.log('[登録中] Registering slash commands...');
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN!);

    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID!),
      { body: commands }
    );

    console.log('[成功] Successfully registered slash commands!');
  } catch (error) {
    console.error('[エラー] Error registering commands:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    switch (commandName) {
${commands.map((cmd) => `      case '${cmd.name}':\n        await handle${capitalize(cmd.name)}(interaction);\n        break;`).join('\n')}
      default:
        await interaction.reply({ content: 'Unknown command', ephemeral: true });
    }
  } catch (error) {
    console.error(\`Error handling command \${commandName}:\`, error);
    const errorMessage = { content: 'エラーが発生しました。', ephemeral: true };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
`;
}

/**
 * Gateway Bot用のコマンドハンドラーを生成
 */
function generateGatewayCommandHandler(
  command: SlashCommand,
  apiProfiles: ApiProfile[]
): string {
  const functionName = `handle${capitalize(command.name)}`;

  if (command.responseType === ResponseType.STATIC_TEXT) {
    // オプション値の取得ロジック
    const optionGetters = command.options && command.options.length > 0
      ? command.options.map(opt => {
          const getterMethod = opt.type === 'integer' ? 'getInteger' :
                             opt.type === 'boolean' ? 'getBoolean' :
                             opt.type === 'user' ? 'getUser' :
                             opt.type === 'channel' ? 'getChannel' :
                             opt.type === 'role' ? 'getRole' : 'getString';
          return `  const ${opt.name} = interaction.options.${getterMethod}('${opt.name}')${opt.required ? '' : ' || null'};`;
        }).join('\n')
      : '';

    // テンプレート文字列の処理
    let contentExpression = `\`${command.staticText || 'Hello from ' + command.name}\``;

    // {optionName} を ${optionName} に置換
    if (command.options && command.options.length > 0) {
      command.options.forEach(opt => {
        const regex = new RegExp(`\\{${opt.name}\\}`, 'g');
        contentExpression = contentExpression.replace(regex, `\${${opt.name}}`);
      });
    }

    // {random(...)} パターンを処理
    contentExpression = contentExpression.replace(
      /\{random\((.*?)\)\}/g,
      (match, args) => {
        // 数値範囲の場合
        if (/^\d+\s*,\s*\d+$/.test(args.trim())) {
          const parts = args.split(',').map((s: string) => s.trim());
          if (parts.length === 2) {
            const min = parts[0];
            const max = parts[1];
            return `\${Math.floor(Math.random() * (${max} - ${min} + 1)) + ${min}}`;
          }
        }
        // 文字列配列の場合
        const items = args.split(',').map((s: string) => s.trim());
        return `\${[${items.join(', ')}][Math.floor(Math.random() * ${items.length})]}`;
      }
    );

    return `async function ${functionName}(interaction: ChatInputCommandInteraction) {
${optionGetters}
  const content = ${contentExpression};

  await interaction.reply(content);
}`;
  }

  // API Call
  const profile = apiProfiles.find((p) => p.id === command.apiProfileId);
  if (!profile) {
    return `async function ${functionName}(interaction: ChatInputCommandInteraction) {
  await interaction.reply('API profile not configured');
}`;
  }

  // API呼び出しロジック
  let authHeader = '';
  let urlParams = '';

  if (profile.authType === AuthType.API_KEY_HEADER) {
    authHeader = `headers['${profile.apiKeyName}'] = process.env.${profile.envVarKey}!;`;
  } else if (profile.authType === AuthType.BEARER_TOKEN) {
    authHeader = `headers['Authorization'] = \`Bearer \${process.env.${profile.envVarKey}}\`;`;
  } else if (profile.authType === AuthType.API_KEY_QUERY) {
    urlParams = `url.searchParams.set('${profile.apiKeyName}', process.env.${profile.envVarKey}!);`;
  }

  // カスタムロジックまたはフィールドマッピングに基づく整形出力を生成
  let customLogic: string;

  if (command.codeSnippet) {
    // ユーザー定義のカスタムロジック
    customLogic = command.codeSnippet;
  } else if (command.fieldMappings && command.fieldMappings.length > 0) {
    // フィールドマッピングに基づく整形出力
    const mappingLogic = command.fieldMappings.map(mapping => {
      const fieldAccessor = `data.${mapping.fieldPath}`;
      let formatStr = mapping.formatString || `{${mapping.fieldPath}}`;

      // formatString内の{fieldPath}を実際の値で置換
      const fieldPattern = new RegExp(`\\{${mapping.fieldPath.replace(/\./g, '\\.')}\\}`, 'g');
      formatStr = formatStr.replace(fieldPattern, `\${${fieldAccessor}}`);

      // 他のフィールド参照も置換（ネストされたフィールド対応）
      command.fieldMappings?.forEach(m => {
        const pattern = new RegExp(`\\{${m.fieldPath.replace(/\./g, '\\.')}\\}`, 'g');
        formatStr = formatStr.replace(pattern, `\${data.${m.fieldPath}}`);
      });

      return `    if (${fieldAccessor} !== null && ${fieldAccessor} !== undefined) parts.push(\`${formatStr}\`);`;
    }).join('\n');

    customLogic = `
    const data = await apiResponse.json() as any;
    const parts: string[] = [];
${mappingLogic}
    return parts.join('\\n');`;
  } else {
    // デフォルト: 生のJSON出力
    customLogic = `
    const data = await apiResponse.json() as any;
    return JSON.stringify(data, null, 2);`;
  }

  // エンドポイント内の変数を置換するロジックを生成
  const endpointVariableReplacement = command.options && command.options.length > 0
    ? command.options.map(opt => {
        const getterMethod = opt.type === 'integer' ? 'getInteger' :
                           opt.type === 'boolean' ? 'getBoolean' :
                           opt.type === 'user' ? 'getUser' :
                           opt.type === 'channel' ? 'getChannel' :
                           opt.type === 'role' ? 'getRole' : 'getString';
        return `endpoint = endpoint.replace('{${opt.name}}', String(interaction.options.${getterMethod}('${opt.name}') || ''));`;
      }).join('\n    ')
    : '';

  return `async function ${functionName}(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply();

    const baseUrl = process.env.${profile.envVarUrl}!;
    let endpoint = '${command.apiEndpoint || ''}';

    // コマンドオプションから値を取得してエンドポイントの変数を置換
    ${endpointVariableReplacement}

    const url = new URL(endpoint, baseUrl);

    ${urlParams}

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    ${authHeader}

    const apiResponse = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!apiResponse.ok) {
      throw new Error(\`API request failed: \${apiResponse.status}\`);
    }

    const responseContent = await (async () => {
      ${customLogic}
    })();

    await interaction.editReply(responseContent);
  } catch (error) {
    console.error('Error in ${functionName}:', error);
    const errorMessage = 'エラーが発生しました。もう一度お試しください。';
    
    if (interaction.deferred) {
      await interaction.editReply(errorMessage);
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
}`;
}

/**
 * Gateway Bot用のpackage.json を生成
 */
function generateGatewayPackageJson(botConfig: BotConfig): string {
  return JSON.stringify(
    {
      name: botConfig.name.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: botConfig.description || 'Discord Bot powered by discord.js',
      main: 'dist/index.js',
      scripts: {
        build: 'tsc',
        start: 'node dist/index.js',
        dev: 'ts-node src/index.ts',
      },
      dependencies: {
        'discord.js': '^14.14.1',
        'dotenv': '^16.3.1',
      },
      devDependencies: {
        '@types/node': '^20.10.5',
        'typescript': '^5.3.3',
        'ts-node': '^10.9.2',
      },
    },
    null,
    2
  );
}

/**
 * Gateway Bot用のtsconfig.json を生成
 */
function generateGatewayTsConfig(): string {
  return JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2021',
        module: 'commonjs',
        lib: ['ES2021'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    },
    null,
    2
  );
}

/**
 * .env.example を生成
 */
function generateEnvExample(envVariables: EnvVariable[]): string {
  // 実際の値ではなくプレースホルダーを使用
  return envVariables.map((env) => {
    let placeholder = '';
    if (env.key === 'DISCORD_BOT_TOKEN') {
      placeholder = 'your_discord_bot_token_here';
    } else if (env.key === 'DISCORD_APPLICATION_ID') {
      placeholder = 'your_application_id_here';
    } else {
      placeholder = 'your_value_here';
    }
    return `# ${env.description}\n${env.key}=${placeholder}`;
  }).join('\n\n') + '\n';
}

/**
 * Gateway Bot用のREADME.md を生成
 */
function generateGatewayReadme(botConfig: BotConfig, envVariables: EnvVariable[]): string {
  // 環境変数の説明を生成(実際の値は含めない)
  const envVarDocs = envVariables.map((env) => {
    let exampleValue = '';
    if (env.key === 'DISCORD_BOT_TOKEN') {
      exampleValue = 'your_discord_bot_token_here';
    } else if (env.key === 'DISCORD_APPLICATION_ID') {
      exampleValue = 'your_application_id_here';
    } else {
      exampleValue = 'your_value_here';
    }
    return `\`\`\`\n${env.key}=${exampleValue}\n\`\`\`\n${env.description}`;
  }).join('\n\n');

  // PM2用のプロセス名を生成（bot名をケバブケースに変換）
  const processName = botConfig.name.toLowerCase().replace(/\s+/g, '-');

  return `# ${botConfig.name}

${botConfig.description || 'Discord Bot powered by discord.js'}

## 特徴

- ✅ Botが「オンライン」として表示されます
- ✅ discord.jsを使用したGateway接続
- ✅ スラッシュコマンド対応

## セットアップ

### 1. 依存関係のインストール

\`\`\`bash
npm install
\`\`\`

### 2. 環境変数の設定

\`.env\`ファイルを作成し、以下の環境変数を設定してください:

${envVarDocs}

**注意:** 実際の値はDiscord Developer Portalから取得してください。上記はプレースホルダーです。

### 3. ビルド

\`\`\`bash
npm run build
\`\`\`

### 4. 起動

\`\`\`bash
npm start
\`\`\`

または開発モード:

\`\`\`bash
npm run dev
\`\`\`

## デプロイ

このBotは常時稼働サーバーが必要です。以下のプラットフォームでデプロイできます:

- **Railway** (推奨): https://railway.app/
- **Render**: https://render.com/
- **Heroku**: https://www.heroku.com/
- **VPS/EC2**: 任意のVPSやAWS EC2

### Railway/Renderでのデプロイ

1. GitHubリポジトリをインポート
2. 環境変数を設定
3. 自動デプロイ完了

### PM2でのデプロイ (VPS/EC2)

PM2を使用して本番環境で管理する場合:

\`\`\`bash
# PM2をグローバルにインストール
npm install -g pm2

# Botを起動（プロセス名: ${processName}）
pm2 start npm --name "${processName}" -- start

# 自動起動設定（サーバー再起動時に自動起動）
pm2 startup
pm2 save

# ステータス確認
pm2 status

# ログ確認
pm2 logs ${processName}

# 再起動
pm2 restart ${processName}

# 停止
pm2 stop ${processName}

# プロセス削除
pm2 delete ${processName}
\`\`\`

**PM2の便利なコマンド:**

\`\`\`bash
# すべてのプロセスの状態を確認
pm2 list

# リアルタイムモニタリング
pm2 monit

# メモリ使用量などの詳細情報
pm2 show ${processName}
\`\`\`

## スラッシュコマンド

スラッシュコマンドはBot起動時に自動的に登録されます。

## 生成元

このBotは [DiscordBot-Maker](https://github.com/yourusername/discordbot-maker) で生成されました。
`;
}

/**
 * Gateway Bot用のセットアップ手順を生成
 */
function generateGatewaySetupInstructions(envVariables: EnvVariable[]): string {
  // 環境変数の説明を生成（実際の値は表示しない）
  const envVarDocs = envVariables.map((env) => {
    return `### ${env.key}\n${env.description}\n**Discord Developer Portalから取得してください**`;
  }).join('\n\n');

  return `# Discord Bot セットアップ手順 (Gateway Bot)

## 1. リポジトリのクローン

GitHubからリポジトリをクローンしてください。

## 2. 依存関係のインストール

\`\`\`bash
npm install
\`\`\`

## 3. 環境変数の設定

\`.env\`ファイルを作成し、以下の環境変数を設定してください:

${envVarDocs}

**重要:** 環境変数の実際の値はGitHubには含まれていません。Discord Developer Portalから取得して設定してください。

## 4. ビルドと起動

\`\`\`bash
npm run build
npm start
\`\`\`

または開発モード:

\`\`\`bash
npm run dev
\`\`\`

## 5. デプロイ (本番環境)

このBotは常時稼働が必要なため、以下のいずれかのプラットフォームにデプロイしてください:

- **Railway** (推奨・無料枠あり): https://railway.app/
- **Render** (無料枠あり): https://render.com/
- **Heroku**: https://www.heroku.com/
- **VPS/EC2**: 任意のVPSやAWS EC2

スラッシュコマンドはBot起動時に自動的に登録されます。
`;
}

import type {
  RepositoryConfig,
  BotConfig,
  ApiProfile,
  SlashCommand,
  GeneratedFile,
  EnvVariable,
  GenerationResult,
} from './types';
import { AuthType, ResponseType } from './types';

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
    content: generateReadme(botConfig, envVariables),
  });

  // 6. .gitignore を生成
  files.push({
    path: '.gitignore',
    content: generateGitignore(),
  });

  const setupInstructions = generateSetupInstructions(envVariables);

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
    .map(
      (cmd) => `  {
    name: '${cmd.name}',
    description: '${cmd.description}',
  }`
    )
    .join(',\n');

  return `import { verifyKey } from 'discord-interactions';

export interface Env {
  DISCORD_APPLICATION_ID: string;
  DISCORD_PUBLIC_KEY: string;
${apiProfiles
  .map(
    (p) => `  ${p.envVarKey}: string;
  ${p.envVarUrl}: string;`
  )
  .join('\n')}
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
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

// Register commands (run this once)
export async function registerCommands(env: Env): Promise<void> {
  const commands = [
${commandDefinitions}
  ];

  const response = await fetch(
    \`https://discord.com/api/v10/applications/\${env.DISCORD_APPLICATION_ID}/commands\`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: \`Bot YOUR_BOT_TOKEN\`,
      },
      body: JSON.stringify(commands),
    }
  );

  if (!response.ok) {
    console.error('Failed to register commands:', await response.text());
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
    return `async function ${functionName}(interaction: any, env: Env): Promise<Response> {
  return Response.json({
    type: 4,
    data: {
      content: '${command.staticText || 'Hello from ' + command.name}',
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

  const customLogic = command.codeSnippet || `
    const data = await apiResponse.json();
    return {
      content: JSON.stringify(data, null, 2),
    };`;

  return `async function ${functionName}(interaction: any, env: Env): Promise<Response> {
  try {
    const baseUrl = env.${profile.envVarUrl};
    const endpoint = '${command.apiEndpoint || ''}';
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
compatibility_date = "2024-01-01"

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
function generateReadme(botConfig: BotConfig, envVariables: EnvVariable[]): string {
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
function generateSetupInstructions(envVariables: EnvVariable[]): string {
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
`;
}

/**
 * 文字列の最初の文字を大文字に
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

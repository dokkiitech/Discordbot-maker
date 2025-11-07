import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  createGitHubRepository,
  commitFilesToGitHub,
  checkRepositoryExists,
} from '@/lib/github';
import { generateBotCode } from '@/lib/template-generator';
import type { RepositoryConfig, BotConfig, ApiProfile, SlashCommand } from '@/lib/types';

interface GenerateRequest {
  repository: RepositoryConfig;
  botConfig: BotConfig;
  apiProfiles: ApiProfile[];
  commands: SlashCommand[];
}

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('github_token');

    if (!tokenCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const accessToken = tokenCookie.value;

    // リクエストボディを取得
    const body: GenerateRequest = await request.json();
    const { repository, botConfig, apiProfiles, commands } = body;

    // バリデーション
    if (!repository.name || !botConfig.name || commands.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // コード生成
    const generationResult = generateBotCode(botConfig, apiProfiles, commands);

    // GitHubリポジトリを作成
    let repoInfo;
    try {
      repoInfo = await createGitHubRepository(
        accessToken,
        repository.name,
        repository.description || botConfig.description || 'Discord Bot',
        repository.isPrivate
      );
    } catch (error: any) {
      console.error('Error creating repository:', error);
      return NextResponse.json(
        { error: 'Failed to create repository: ' + error.message },
        { status: 500 }
      );
    }

    // ファイルをコミット
    try {
      await commitFilesToGitHub(
        accessToken,
        repoInfo.owner,
        repoInfo.repo,
        repository.branch,
        generationResult.files,
        `Initial commit: ${botConfig.name}\n\n🤖 Generated with DiscordBot-Maker`
      );
    } catch (error: any) {
      console.error('Error committing files:', error);
      return NextResponse.json(
        { error: 'Failed to commit files: ' + error.message },
        { status: 500 }
      );
    }

    // 環境変数を整形
    const envVariables: Record<string, string> = {};
    generationResult.envVariables.forEach((env) => {
      envVariables[env.key] = env.value;
    });

    return NextResponse.json({
      success: true,
      repoUrl: repoInfo.url,
      envVariables,
      setupInstructions: generationResult.setupInstructions,
    });
  } catch (error) {
    console.error('Error in generate API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

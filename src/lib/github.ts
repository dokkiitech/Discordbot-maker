import { Octokit } from '@octokit/rest';
import type { GeneratedFile } from './types';

/**
 * GitHub OAuth認証URLを生成
 */
export function getGitHubAuthUrl(): string {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/callback`;
  const scope = 'repo user:email';

  return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
}

/**
 * GitHub OAuthアクセストークンを取得
 */
export async function getGitHubAccessToken(code: string): Promise<string> {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error_description || 'Failed to get access token');
  }

  return data.access_token;
}

/**
 * GitHubユーザー情報を取得
 */
export async function getGitHubUser(accessToken: string) {
  const octokit = new Octokit({ auth: accessToken });
  const { data } = await octokit.users.getAuthenticated();
  return data;
}

/**
 * GitHubリポジトリを作成
 */
export async function createGitHubRepository(
  accessToken: string,
  name: string,
  description: string,
  isPrivate: boolean
): Promise<{ owner: string; repo: string; url: string }> {
  const octokit = new Octokit({ auth: accessToken });

  const { data } = await octokit.repos.createForAuthenticatedUser({
    name,
    description,
    private: isPrivate,
    auto_init: false,
  });

  return {
    owner: data.owner.login,
    repo: data.name,
    url: data.html_url,
  };
}

/**
 * GitHubリポジトリに複数のファイルを一括コミット
 */
export async function commitFilesToGitHub(
  accessToken: string,
  owner: string,
  repo: string,
  branch: string,
  files: GeneratedFile[],
  message: string
): Promise<void> {
  const octokit = new Octokit({ auth: accessToken });

  try {
    // 1. 現在のブランチの参照を取得（存在しない場合は後で作成）
    let sha: string | undefined;
    let treeSha: string | undefined;

    try {
      const { data: refData } = await octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`,
      });
      sha = refData.object.sha;

      // 現在のコミットからツリーを取得
      const { data: commitData } = await octokit.git.getCommit({
        owner,
        repo,
        commit_sha: sha,
      });
      treeSha = commitData.tree.sha;
    } catch (error: any) {
      // ブランチが存在しない場合は新規作成
      if (error.status === 404) {
        console.log('Branch does not exist, will create new one');
      } else {
        throw error;
      }
    }

    // 2. 全ファイルのBlobを作成
    const blobs = await Promise.all(
      files.map(async (file) => {
        const { data: blobData } = await octokit.git.createBlob({
          owner,
          repo,
          content: Buffer.from(file.content).toString('base64'),
          encoding: 'base64',
        });
        return {
          path: file.path,
          mode: '100644' as const,
          type: 'blob' as const,
          sha: blobData.sha,
        };
      })
    );

    // 3. 新しいツリーを作成
    const { data: newTree } = await octokit.git.createTree({
      owner,
      repo,
      tree: blobs,
      base_tree: treeSha,
    });

    // 4. コミットを作成
    const { data: newCommit } = await octokit.git.createCommit({
      owner,
      repo,
      message,
      tree: newTree.sha,
      parents: sha ? [sha] : [],
    });

    // 5. ブランチの参照を更新または作成
    if (sha) {
      await octokit.git.updateRef({
        owner,
        repo,
        ref: `heads/${branch}`,
        sha: newCommit.sha,
      });
    } else {
      await octokit.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branch}`,
        sha: newCommit.sha,
      });
    }

    console.log(`Successfully committed ${files.length} files to ${owner}/${repo}:${branch}`);
  } catch (error: any) {
    console.error('Error committing files to GitHub:', error);
    throw new Error(`Failed to commit files: ${error.message}`);
  }
}

/**
 * リポジトリの存在確認
 */
export async function checkRepositoryExists(
  accessToken: string,
  owner: string,
  repo: string
): Promise<boolean> {
  const octokit = new Octokit({ auth: accessToken });

  try {
    await octokit.repos.get({ owner, repo });
    return true;
  } catch (error: any) {
    if (error.status === 404) {
      return false;
    }
    throw error;
  }
}

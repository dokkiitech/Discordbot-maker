import { NextRequest, NextResponse } from 'next/server';
import { getGitHubAccessToken, getGitHubUser } from '@/lib/github';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // エラーがある場合
  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  // コードがない場合
  if (!code) {
    return NextResponse.redirect(
      new URL('/?error=no_code', request.url)
    );
  }

  try {
    // アクセストークンを取得
    const accessToken = await getGitHubAccessToken(code);

    // ユーザー情報を取得
    const user = await getGitHubUser(accessToken);

    // クッキーにトークンとユーザー情報を保存（本番環境ではより安全な方法を使用）
    const cookieStore = await cookies();

    cookieStore.set('github_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7日間
    });

    cookieStore.set('github_user', JSON.stringify({
      id: user.id,
      login: user.login,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
    }), {
      httpOnly: false, // クライアントサイドからアクセス可能
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    // ダッシュボードにリダイレクト
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Error during GitHub OAuth callback:', error);
    return NextResponse.redirect(
      new URL('/?error=auth_failed', request.url)
    );
  }
}

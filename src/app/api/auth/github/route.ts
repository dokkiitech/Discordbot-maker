import { NextResponse } from 'next/server';
import { getGitHubAuthUrl } from '@/lib/github';

export async function GET() {
  try {
    const authUrl = getGitHubAuthUrl();
    console.log('Redirecting to GitHub OAuth:', authUrl);
    return NextResponse.redirect(new URL(authUrl));
  } catch (error) {
    console.error('Error generating GitHub auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { ApiProfile, AuthType, ApiTestResult } from '@/lib/types';
import { parseApiResponse } from '@/lib/api-response-parser';

/**
 * APIエンドポイントをテストするAPIルート
 *
 * リクエストボディ:
 * {
 *   apiProfile: ApiProfile,
 *   endpoint: string,
 *   testParams?: Record<string, string>
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiProfile, endpoint, testParams = {} } = body;

    if (!apiProfile || !endpoint) {
      return NextResponse.json(
        { error: 'APIプロファイルとエンドポイントは必須です' },
        { status: 400 }
      );
    }

    // エンドポイントURLを構築
    let url = apiProfile.baseUrl;
    // エンドポイントが ? や # で始まる場合はそのまま結合、それ以外は / を挿入
    if (!url.endsWith('/') && !endpoint.startsWith('/') && !endpoint.startsWith('?') && !endpoint.startsWith('#')) {
      url += '/';
    }
    url += endpoint;

    // パラメータを置換（例: {zipcode} → 実際の値）
    Object.entries(testParams).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, encodeURIComponent(String(value)));
    });

    // URLオブジェクトを作成
    const requestUrl = new URL(url);

    // 認証ヘッダーを設定
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    const profile = apiProfile as ApiProfile;

    switch (profile.authType) {
      case AuthType.API_KEY_HEADER:
        if (profile.apiKey && profile.apiKeyName) {
          headers.set(profile.apiKeyName, profile.apiKey);
        }
        break;

      case AuthType.BEARER_TOKEN:
        if (profile.apiKey) {
          headers.set('Authorization', `Bearer ${profile.apiKey}`);
        }
        break;

      case AuthType.API_KEY_QUERY:
        if (profile.apiKey && profile.apiKeyName) {
          requestUrl.searchParams.set(profile.apiKeyName, profile.apiKey);
        }
        break;

      case AuthType.NONE:
      default:
        // 認証なし
        break;
    }

    // SSRF対策: 内部IPアドレスへのアクセスを禁止
    const hostname = requestUrl.hostname;
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')
    ) {
      return NextResponse.json(
        { error: '内部ネットワークへのアクセスは禁止されています' },
        { status: 403 }
      );
    }

    // APIを呼び出し
    const startTime = Date.now();
    const apiResponse = await fetch(requestUrl.toString(), {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(10000), // 10秒のタイムアウト
    });

    const responseTime = Date.now() - startTime;

    // レスポンスボディを取得
    const responseBody = await apiResponse.json();

    // レスポンスが成功した場合、フィールドを解析
    let fields = undefined;
    if (apiResponse.ok) {
      fields = parseApiResponse(responseBody);
    }

    const result: ApiTestResult = {
      success: apiResponse.ok,
      statusCode: apiResponse.status,
      responseBody,
      fields,
      timestamp: new Date(),
      error: apiResponse.ok ? undefined : `HTTPエラー ${apiResponse.status}: ${apiResponse.statusText}`,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API test error:', error);

    const result: ApiTestResult = {
      success: false,
      timestamp: new Date(),
      error: error.message || 'APIテスト中にエラーが発生しました',
    };

    return NextResponse.json(result, { status: 500 });
  }
}

import Link from "next/link";
import { Bot, Github, Zap, Code2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">DiscordBot-Maker</h1>
          </div>
          <Link
            href="/api/auth/github"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            始める
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Discord Botを<br />
            <span className="text-blue-600">3ステップ</span>で作成
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            コーディング不要。Web UIから設定するだけで、<br />
            Cloudflare Workers対応のDiscord Botが自動生成されます
          </p>
          <Link
            href="/api/auth/github"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Github className="w-5 h-5" />
            GitHubでログインして始める
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">簡単セットアップ</h3>
            <p className="text-gray-600">
              Web UIで設定を入力するだけ。複雑なコーディングは不要です。
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Code2 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">自動コード生成</h3>
            <p className="text-gray-600">
              TypeScriptで記述された高品質なコードを自動生成します。
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Github className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">GitHub連携</h3>
            <p className="text-gray-600">
              生成したBotは自動的にGitHubリポジトリにコミットされます。
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            使い方
          </h3>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  GitHub認証とリポジトリ設定
                </h4>
                <p className="text-gray-600">
                  GitHubアカウントでログインし、Botのリポジトリ名を設定します。
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  APIプロファイルとコマンド定義
                </h4>
                <p className="text-gray-600">
                  外部API連携とスラッシュコマンドを設定します。
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  生成とデプロイ
                </h4>
                <p className="text-gray-600">
                  ボタンをクリックするだけで、コードが生成され、GitHubにコミットされます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-24">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>© 2024 DiscordBot-Maker. MIT License.</p>
        </div>
      </footer>
    </div>
  );
}

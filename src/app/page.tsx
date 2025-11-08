import Link from "next/link";
import { Bot, Github, Zap, Code2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <header className="border-b backdrop-blur-sm liquid-blur-md header-depth-shadow" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border)' }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-8 h-8" style={{ color: 'var(--primary)' }} />
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>DiscordBot-Maker</h1>
          </div>
          <Link
            href="/api/auth/github"
            className="px-6 py-2 text-white rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            始める
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-5xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
            Discord Botを<br />
            <span style={{ color: 'var(--primary)' }}>3ステップ</span>で作成
          </h2>
          <p className="text-xl mb-8" style={{ color: 'var(--muted)' }}>
            ビジュアルコーディングで<br />
            Discord Botが生成できます。
          </p>
          <Link
            href="/api/auth/github"
            className="inline-flex items-center gap-2 px-8 py-4 text-white text-lg font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Github className="w-5 h-5" />
            GitHubでログインして始める
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-8 rounded-2xl shadow-lg border backdrop-blur-sm transition-all hover:shadow-xl hover:backdrop-blur" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border)' }}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)' }}>
              <Zap className="w-6 h-6" style={{ color: 'var(--primary)' }} />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>簡単セットアップ</h3>
            <p style={{ color: 'var(--muted)' }}>
              直感的なビジュアルコーディング。複雑なコーディングは不要です。
            </p>
          </div>

          <div className="p-8 rounded-2xl shadow-lg border backdrop-blur-sm transition-all hover:shadow-xl hover:backdrop-blur" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border)' }}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'color-mix(in srgb, var(--info) 10%, transparent)' }}>
              <Code2 className="w-6 h-6" style={{ color: 'var(--info)' }} />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>自動コード生成</h3>
            <p style={{ color: 'var(--muted)' }}>
              TypeScriptで記述された高品質なコードを自動生成します。
            </p>
          </div>

          <div className="p-8 rounded-2xl shadow-lg border backdrop-blur-sm transition-all hover:shadow-xl hover:backdrop-blur" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border)' }}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'color-mix(in srgb, var(--success) 10%, transparent)' }}>
              <Github className="w-6 h-6" style={{ color: 'var(--success)' }} />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>GitHub連携</h3>
            <p style={{ color: 'var(--muted)' }}>
              生成したBotは自動的にGitHubリポジトリにコミットされます。
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--foreground)' }}>
            使い方
          </h3>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>
                1
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                  GitHub認証とリポジトリ設定
                </h4>
                <p style={{ color: 'var(--muted)' }}>
                  GitHubアカウントでログインし、Botのリポジトリ名を設定します。
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>
                2
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                  APIプロファイル
                </h4>
                <p style={{ color: 'var(--muted)' }}>
                  外部API連携とスラッシュコマンドを設定します。
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>
                3
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                  コマンド定義とコード生成
                </h4>
                <p style={{ color: 'var(--muted)' }}>
                  コードが生成され、GitHubにコミットされます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border)' }}>
        <div className="container mx-auto px-4 py-8 text-center" style={{ color: 'var(--muted)' }}>
          <p>© 2025 DiscordBot-Maker. MIT License.</p>
        </div>
      </footer>
    </div>
  );
}

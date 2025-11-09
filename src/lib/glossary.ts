/**
 * 専門用語の用語集
 * Technical terms glossary for beginners
 */

export interface GlossaryTerm {
  term: string;
  description: string;
  link?: string;
}

export const glossary: Record<string, GlossaryTerm> = {
  // デプロイメント関連
  deploy: {
    term: "デプロイ",
    description: "作成したBotをインターネット上で実際に動かすことです。デプロイすることで、あなたのパソコンを起動していなくてもBotが24時間稼働できるようになります。",
  },
  deploymentType: {
    term: "デプロイメントタイプ",
    description: "Botを動かす環境の種類です。Cloudflare Workersは無料で使える手軽な選択肢、従来型VPSは自由度の高い上級者向けの選択肢です。",
  },
  cloudflareWorkers: {
    term: "Cloudflare Workers",
    description: "Cloudflareが提供する無料のサーバーレスプラットフォームです。難しい設定なしでBotをデプロイでき、初心者におすすめです。",
    link: "https://workers.cloudflare.com/",
  },
  vps: {
    term: "VPS",
    description: "Virtual Private Server（仮想専用サーバー）の略です。自分専用のサーバーを借りて、自由にBotを動かすことができます。設定の自由度が高い反面、サーバー管理の知識が必要です。",
  },

  // Git/GitHub関連
  git: {
    term: "Git",
    description: "プログラムのコードの変更履歴を記録・管理するためのツールです。チーム開発や個人開発で広く使われています。",
    link: "/help/gitinstallguide",
  },
  github: {
    term: "GitHub",
    description: "Gitを使ったプロジェクトをインターネット上で保存・共有できるサービスです。作成したBotのコードをここに保存します。",
  },
  repository: {
    term: "リポジトリ",
    description: "プロジェクトのファイルや変更履歴を保存する場所のことです。Botのコードを保管する「フォルダ」のようなものと考えてください。",
  },
  clone: {
    term: "クローン",
    description: "GitHubにあるリポジトリを自分のパソコンにコピーすることです。これにより、ローカル環境でコードを編集できるようになります。",
    link: "/help/gitinstallguide",
  },
  commit: {
    term: "コミット",
    description: "コードの変更を記録することです。「どこを変更したか」の履歴が残るので、後から変更内容を確認したり、元に戻したりできます。",
  },

  // Node.js/npm関連
  nodejs: {
    term: "Node.js",
    description: "JavaScriptをパソコン上で実行するための環境です。Discord BotはNode.jsを使って動作します。",
    link: "/help/nodeinstallguide",
  },
  npm: {
    term: "npm",
    description: "Node Package Managerの略で、Node.jsのプログラムやライブラリを管理するツールです。Node.jsをインストールすると自動的に使えるようになります。",
    link: "/help/nodeinstallguide",
  },

  // API関連
  api: {
    term: "API",
    description: "Application Programming Interfaceの略です。他のサービスと情報をやり取りするための仕組みです。例えば、天気情報を取得したり、翻訳機能を使ったりできます。",
  },
  apiProfile: {
    term: "APIプロファイル",
    description: "外部APIに接続するための設定のまとまりです。API URLや認証情報などをセットで管理できます。",
  },
  apiKey: {
    term: "APIキー",
    description: "APIを利用するための「パスワード」のようなものです。APIを提供しているサービスから発行されます。他の人に見せないように注意しましょう。",
  },
  apiEndpoint: {
    term: "APIエンドポイント",
    description: "APIにアクセスするためのURL（アドレス）です。このURLにリクエストを送ることで、データを取得したり送信したりできます。",
  },
  bearerToken: {
    term: "Bearer Token",
    description: "APIにアクセスするための認証方式の一つです。APIキーと似ていますが、より高度なセキュリティが必要な場合に使われます。",
  },
  basicAuth: {
    term: "Basic認証",
    description: "ユーザー名とパスワードを使った基本的な認証方式です。APIへのアクセス時に、この2つの情報を組み合わせて認証します。",
  },

  // Discord Bot関連
  discordBot: {
    term: "Discord Bot",
    description: "Discord上で自動的に動作するプログラムです。メッセージに反応したり、情報を提供したりと、様々な機能を持たせることができます。",
  },
  slashCommand: {
    term: "スラッシュコマンド",
    description: "Discordで「/」から始まるコマンドのことです。例えば「/天気」と入力すると天気情報を表示する、といった機能を作れます。",
  },
  command: {
    term: "コマンド",
    description: "Botに特定の動作をさせるための命令です。ユーザーがコマンドを入力すると、Botが対応する機能を実行します。",
  },

  // テンプレート関連
  template: {
    term: "テンプレート",
    description: "あらかじめ用意されたBot の設計図です。目的に応じたテンプレートを選ぶことで、簡単にBotを作り始められます。",
  },
  responseTemplate: {
    term: "レスポンステンプレート",
    description: "Botが返信する内容のひな形です。APIから取得したデータを埋め込んで、ユーザーに情報を表示できます。",
  },

  // 環境変数
  environmentVariable: {
    term: "環境変数",
    description: "APIキーなどの秘密情報を安全に保存するための仕組みです。コードに直接書かずに、別の場所に保管することでセキュリティを高めます。",
  },
  envFile: {
    term: ".envファイル",
    description: "環境変数を保存するためのファイルです。APIキーやパスワードなどの秘密情報をここに書きます。GitHubにアップロードしないよう注意が必要です。",
  },

  // その他
  terminal: {
    term: "ターミナル",
    description: "コマンドを入力してパソコンを操作するための画面です。Windowsでは「コマンドプロンプト」や「PowerShell」、Macでは「ターミナル」と呼ばれます。",
  },
  lts: {
    term: "LTS",
    description: "Long Term Support（長期サポート）の略です。Node.jsのLTS版は、長期間安定して使えるバージョンで、初心者におすすめです。",
    link: "/help/nodeinstallguide",
  },
  typescript: {
    term: "TypeScript",
    description: "JavaScriptに型チェック機能を追加したプログラミング言語です。エラーを早期に発見できるため、より安全にコードを書くことができます。",
  },
};

/**
 * 用語を取得する
 */
export function getGlossaryTerm(key: string): GlossaryTerm | undefined {
  return glossary[key];
}

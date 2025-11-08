# ReactFlowEditorコンポーネント分析

## 1. 使用箇所
- **Step3Commands.tsx (行450)**: editorMode が 'visual' の場合のみ表示
  - 動的インポート（lazy）でクライアントサイドのみで実行
  - Suspenseでフォールバック表示

## 2. Commands Props と onChange定義

### Step3Commands.tsx での定義
- **commands**: SlashCommand[] 型
  - 親コンポーネントから受け取った commands props
  - useState ではなく、親の props を直接使用
  - 行450: `<ReactFlowEditor commands={commands} onChange={onChange} />`

- **onChange**: (commands: SlashCommand[]) => void
  - 親から受け取った onChange コールバック関数
  - Step3Commands コンポーネント内では形式フォーム向けに使用
  - ReactFlowEditorに直接渡される

## 3. commandsToReactFlow関数
**ファイル**: src/lib/reactflow-converter.ts (行6-107)
**目的**: SlashCommand[] をReactFlowのノード・エッジに変換

処理内容:
1. コマンドノード作成: 各コマンドについて commandNodeId = `command-${index}`
2. オプションノード作成: 複数ノード化、チェーン接続
   - 最初のオプション → コマンドに接続 (sourceHandle: 'options')
   - 2番目以降 → 前のオプションにチェーン接続
3. レスポンスノード作成: 右側に配置、コマンドに接続 (sourceHandle: 'response')
4. 返値: { nodes: AppNode[], edges: AppEdge[] }

## 4. reactFlowToCommands関数
**ファイル**: src/lib/reactflow-converter.ts (行112-188)
**目的**: ReactFlowのノード・エッジからSlashCommand[] に変換

処理内容:
1. コマンドノードをフィルタリング
2. 各コマンドについて:
   - optionEdges からオプションチェーンを辿る
   - responseEdge からレスポンス情報を取得
3. SlashCommand[] として返値

## 5. 修正前後の比較

### 修正前（エラーが出ていた版）
```typescript
useEffect(() => {
  const { nodes: newNodes, edges: newEdges } = commandsToReactFlow(commands);
  setNodes(newNodes);
  setEdges(newEdges);
}, [commands, setNodes, setEdges]);  // ← 依存配列に setNodes, setEdges を含む

useEffect(() => {
  const updatedCommands = reactFlowToCommands(nodes, edges);
  onChange(updatedCommands);
}, [nodes, edges, onChange]);  // ← 毎回 onChange が実行される
```

### 修正後（現在のバージョン）
```typescript
// Refを使用してプロップ更新の追跡
const isUpdatingFromPropsRef = useRef(false);
const prevCommandsRef = useRef(commands);

useEffect(() => {
  if (JSON.stringify(prevCommandsRef.current) !== JSON.stringify(commands)) {
    isUpdatingFromPropsRef.current = true;
    const { nodes: newNodes, edges: newEdges } = commandsToReactFlow(commands);
    setNodes(newNodes);
    setEdges(newEdges);
    prevCommandsRef.current = commands;
    setTimeout(() => {
      isUpdatingFromPropsRef.current = false;
    }, 0);
  }
}, [commands]);  // ← 依存配列は [commands] のみ

useEffect(() => {
  if (isUpdatingFromPropsRef.current) {
    return;  // プロップ更新中は何もしない
  }
  const updatedCommands = reactFlowToCommands(nodes, edges);
  onChange(updatedCommands);
}, [nodes, edges, onChange]);
```

## 修正が与えた影響

### ノード初期化への影響
1. **無限ループの防止**: 修正前は setNodes, setEdges が依存配列にあり、setState 呼び出しが新たなレンダリングを誘発、再度useEffect が実行される無限ループが発生
2. **プロップ更新の追跡**: Ref を使用して「プロップから来た変更か、ユーザー操作か」を区別
3. **命令的な初期化**: isUpdatingFromPropsRef フラグで、プロップ更新時は onChange を呼び出さない
4. **意図した動作**:
   - プロップ変更時: ノードを再生成するが、親の onChange は呼び出さない（二重更新防止）
   - ユーザー操作時: ノード/エッジ変更時に親に変更を通知する

### 実装の流れ
1. Step3Commands から commands と onChange が渡される
2. コンポーネント初期化時:
   - commandsToReactFlow(commands) でノード・エッジを生成
   - 親 Step3Commands は無限再レンダリングされない
3. ユーザー操作時:
   - ノード・エッジが変更される
   - reactFlowToCommands でコマンド配列に変換
   - 親の onChange(updatedCommands) が呼ばれ、Step3Commands で form モード用の commands を更新

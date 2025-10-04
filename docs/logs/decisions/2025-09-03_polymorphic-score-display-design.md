# ADR-003: ポリモーフィックなスコア表示設計の採用

## ステータス
採用済み (2025-08-27)

## 背景
アニマルチェスのGameController対応実装中に、GameLayoutコンポーネントが各ゲーム固有の処理を直接持つ設計上の問題が発覚しました：

### 問題点
1. **GameLayoutコンポーネントが各ゲーム固有の処理を直接持っている**
   - `renderScoreInfo()`内でリバーシ、はさみ将棋、アニマルチェスの処理が混在
   - 新しいゲームを追加するたびにGameLayoutを修正する必要がある
   - 判定順序に依存する脆弱な設計

2. **ポリモーフィズムが活用されていない**
   - 各ゲームコントローラーが自身の表示ロジックを持っているのに活用されていない
   - GameLayoutが具体的なゲーム実装に依存している

### 具体的な問題事例
```typescript
// 問題のあるコード例
const hasamiShogiState = gameState as TState & { capturedPieces?: { PLAYER1: number; PLAYER2: number } };
if (hasamiShogiState.capturedPieces) {
  // はさみ将棋固有の処理
}

const animalChessState = gameState as TState & { capturedPieces?: { SENTE: string[]; GOTE: string[] } };
if (animalChessState.capturedPieces && Array.isArray(animalChessState.capturedPieces.SENTE)) {
  // アニマルチェス固有の処理
}
```

## 決定内容

### 1. BaseGameControllerインターフェースの拡張
各ゲームコントローラーが自身のスコア/統計情報を提供するメソッドを持つように拡張：

```typescript
interface ScoreInfo {
  title: string;
  items: Array<{
    label: string;
    value: string | number;
  }>;
}

interface BaseGameController<TState, TAction> {
  // 既存のメソッド...
  getDisplayStatus: () => string;
  
  // 新規追加
  getScoreInfo?: () => ScoreInfo | null;
}
```

### 2. 各ゲームコントローラーでの実装
```typescript
// はさみ将棋の場合
getScoreInfo: () => ({
  title: '捕獲数',
  items: [
    { label: '「歩」', value: gameState.capturedPieces.PLAYER2 },
    { label: '「と」', value: gameState.capturedPieces.PLAYER1 }
  ]
})

// アニマルチェスの場合
getScoreInfo: () => ({
  title: '捕獲コマ数',
  items: [
    { label: 'プレイヤー1', value: `${gameState.capturedPieces.SENTE.length}個` },
    { label: 'プレイヤー2', value: `${gameState.capturedPieces.GOTE.length}個` }
  ]
})
```

### 3. GameLayoutの簡素化
```typescript
const renderScoreInfo = () => {
  // 新しい設計: 各ゲームコントローラーが自身のスコア情報を提供
  if ('getScoreInfo' in gameController && typeof gameController.getScoreInfo === 'function') {
    const scoreInfo = gameController.getScoreInfo();
    if (scoreInfo) {
      return (
        <div style={gameLayoutStyles.scoreInfo}>
          <h4 style={gameLayoutStyles.sectionTitle}>{scoreInfo.title}</h4>
          <div style={gameLayoutStyles.scoreDisplay}>
            {scoreInfo.items.map((item, index) => (
              <span key={index}>{item.label}: {item.value}</span>
            ))}
          </div>
        </div>
      );
    }
  }
  
  // レガシー対応: リバーシ（まだ新しい設計に対応していない）
  // ...
  
  return null;
};
```

## 結果

### メリット
- **GameLayoutは汎用的になり、ゲーム固有の処理を持たない**
- **各ゲームが自身の表示ロジックを完全に制御できる**
- **新しいゲームを追加してもGameLayoutの修正が不要**
- **型安全性が保たれる**
- **保守性とテスタビリティの向上**

### レガシー対応
- リバーシなど、まだ新しい設計に対応していないゲームは従来通り動作
- 段階的な移行が可能

## 実装状況
- ✅ BaseGameControllerインターフェースの拡張
- ✅ はさみ将棋でgetScoreInfo()実装
- ✅ アニマルチェスでgetScoreInfo()実装
- ✅ GameLayoutの簡素化
- ✅ 全テスト通過確認
- ⏳ リバーシの新設計対応（今後のタスク）

## 関連ファイル
- `types/game.ts` - ScoreInfo型定義とBaseGameController拡張
- `games/hasami-shogi/useHasamiShogi.ts` - はさみ将棋の実装
- `games/animal-chess/useAnimalChess.ts` - アニマルチェスの実装
- `app/components/GameLayout.tsx` - ポリモーフィック表示ロジック

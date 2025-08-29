# GameLayoutのポリモーフィック設計改善

**日付**: 2025-08-27  
**決定者**: AI開発エージェント  
**ステータス**: 採用  
**影響範囲**: GameLayout, GameController, 全ゲーム実装  

## 背景

アニマルチェスのGameController対応実装中に、GameLayoutコンポーネントの設計上の問題が発覚した：

1. **ゲーム固有処理の混在**: GameLayoutが各ゲーム（リバーシ、はさみ将棋、アニマルチェス）の具体的な実装に依存
2. **拡張性の欠如**: 新しいゲームを追加するたびにGameLayoutの修正が必要
3. **判定順序への依存**: 型判定の順序に依存する脆弱な設計
4. **ポリモーフィズムの未活用**: 各ゲームコントローラーが持つ表示ロジックが活用されていない

## 問題の具体例

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

### 1. ScoreInfo型の導入

```typescript
export interface ScoreInfo {
  title: string;
  items: Array<{
    label: string;
    value: string | number;
  }>;
}
```

### 2. BaseGameControllerの拡張

```typescript
export interface BaseGameController<TState extends BaseGameState, TAction> {
  // 既存のメソッド...
  getDisplayStatus: () => string;
  // 新規追加
  getScoreInfo?: () => ScoreInfo | null;
}
```

### 3. 各ゲームでの実装

各ゲームコントローラーが自身のスコア情報を提供：

```typescript
// はさみ将棋
getScoreInfo: () => ({
  title: '捕獲数',
  items: [
    { label: '「歩」', value: gameState.capturedPieces.PLAYER2 },
    { label: '「と」', value: gameState.capturedPieces.PLAYER1 }
  ]
})

// アニマルチェス
getScoreInfo: () => ({
  title: '捕獲駒数',
  items: [
    { label: 'プレイヤー1', value: `${gameState.capturedPieces.SENTE.length}個` },
    { label: 'プレイヤー2', value: `${gameState.capturedPieces.GOTE.length}個` }
  ]
})
```

### 4. GameLayoutの簡素化

```typescript
const renderScoreInfo = () => {
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
  // レガシー対応...
  return null;
};
```

## 利点

1. **拡張性**: 新しいゲーム追加時にGameLayoutの修正が不要
2. **型安全性**: 各ゲームが自身の型を完全に制御
3. **保守性**: ゲーム固有のロジックが適切な場所に配置
4. **一貫性**: 統一されたインターフェースによる表示の標準化
5. **テスタビリティ**: 各ゲームのスコア表示ロジックを独立してテスト可能

## 移行戦略

1. **段階的移行**: 新しい設計を導入しつつレガシー対応を維持
2. **後方互換性**: 既存のリバーシは従来通り動作
3. **将来的な統一**: リバーシも新しい設計に移行予定

## 影響を受けるコンポーネント

- `types/game.ts`: ScoreInfo型とBaseGameController拡張
- `app/components/GameLayout.tsx`: ポリモーフィック表示ロジック
- `games/hasami-shogi/useHasamiShogi.ts`: getScoreInfo実装
- `games/animal-chess/useAnimalChess.ts`: getScoreInfo実装
- 将来の全ゲーム実装

## 関連する意思決定

- [2025-08-27_responsive-design-architecture-challenges.md](./2025-08-27_responsive-design-architecture-challenges.md)
- [2025-08-27_common-components-usage-guidelines.md](./2025-08-27_common-components-usage-guidelines.md)

## 次のステップ

1. リバーシの新しい設計への移行
2. 他のゲームでのgetScoreInfo実装
3. GameLayoutの完全なポリモーフィック化
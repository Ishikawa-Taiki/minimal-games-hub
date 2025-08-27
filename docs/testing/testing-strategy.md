# テスト戦略

## テストの種類と役割

### 1. ユニットテスト (Vitest)
- **対象**: ゲームのコアロジック (`games/*/core.ts`)
- **目的**: ゲームルール、状態遷移、勝敗判定の正確性を保証
- **場所**: `games/*/core.test.ts`
- **実行**: `npm run test:unit`

**テスト項目例:**
- 初期状態の正確性
- 有効/無効な手の判定
- 状態遷移の正確性
- 勝敗判定の正確性
- エッジケースの処理

### 2. E2Eテスト (Playwright)
- **対象**: ユーザーインターフェース全体
- **目的**: 実際のユーザー操作フローの動作保証
- **場所**: `tests/*.spec.ts`
- **実行**: `npm run test:e2e`

**テスト項目例:**
- 初期画面の表示
- ゲーム操作（駒を置く、リセットなど）
- UI状態の更新（スコア、手番表示など）
- 機能ボタンの動作（ヒント、履歴操作など）
- レスポンシブ対応

### 3. Reactフックのテスト
- **現在の方針**: E2Eテストでカバーする
- **理由**: @testing-library/reactを使用していないため
- **代替手段**: Playwrightでの統合テストで十分なカバレッジを確保

## 履歴機能のテスト要件

### 必須テスト項目
1. **初期状態**: 履歴カウンター「1 / 1」、履歴ボタン無効化
2. **手番実行**: 履歴カウンター更新、戻るボタン有効化
3. **履歴操作**: 
   - 戻る/進む機能
   - 最初/最後への移動
   - 履歴カウンターの正確な表示
4. **状態復元**: 履歴移動時の盤面・スコア・手番の正確な復元

### テスト実装例
```typescript
test('履歴機能が正しく動作する', async ({ page }) => {
  // 初期状態確認
  const initialCounter = await page.locator('[data-testid="history-counter"]').textContent();
  expect(initialCounter).toBe('1 / 1');
  
  // 手番実行と履歴更新確認
  await page.locator('[data-testid="cell-2-3"]').click();
  const counter1 = await page.locator('[data-testid="history-counter"]').textContent();
  expect(counter1).toBe('2 / 2');
  
  // 履歴操作確認
  await page.locator('[data-testid="history-back-button"]').click();
  const counter2 = await page.locator('[data-testid="history-counter"]').textContent();
  expect(counter2).toBe('1 / 2');
});
```

## ヒント機能のテスト要件

### 必須テスト項目
1. **ヒントレベル切り替え**: none → placeable → full → none
2. **ヒント表示**: 各レベルでの適切な表示
3. **フルヒントモード**: 2回タップでの移動実行

## 新機能追加時のテスト方針

### 1. コアロジック変更時
- 既存のユニットテストが通ることを確認
- 新機能に対応するユニットテストを追加

### 2. UI機能追加時
- 既存のE2Eテストが通ることを確認
- 新機能に対応するE2Eテストを追加
- data-testid属性を適切に設定

### 3. レスポンシブ対応時
- デスクトップ・モバイル両方での動作確認
- 画面サイズ変更時の動作確認

## テスト実行とCI/CD

### ローカル開発
```bash
npm run test:lint    # ESLint
npm run test:unit    # ユニットテスト
npm run test:e2e     # E2Eテスト
npm test            # 全テスト実行
```

### CI/CD (pre-pushフック)
1. ESLint
2. ライセンスチェック
3. ユニットテスト
4. E2Eテスト
5. ビルド確認

## 注意事項

- **@testing-library/react**: 現在使用していないため、Reactフックのテストは行わない
- **テストデータ**: data-testid属性を使用してE2Eテストの安定性を確保
- **待機処理**: アニメーション完了を適切に待機してテストの安定性を確保
- **テストカバレッジ**: 新機能追加時は既存機能のテストレベルを維持する
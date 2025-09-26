# テクニカルガイド: テスト戦略

## 概要

このプロジェクトでは、品質保証のために3層のテスト戦略を採用しています。

## テスト構成

### 1. ユニットテスト (Vitest + @testing-library/react)

**目的**: 個別コンポーネント・フック・コアロジックの単体動作保証

**対象**:
- ゲームコアロジック (`games/*/core.ts`)
- カスタムフック (`games/*/use*.ts`, `hooks/use*.ts`)
- UIコンポーネント (`app/components/**/*.tsx`)

**実行方法**:
```bash
npm run test:unit              # 全ユニットテスト実行
npm run test:unit-ui           # UI付きで実行
npm run test:unit -- <path>    # 特定ファイルのテスト実行
```

**テストファイル命名規則**:
- `*.test.ts` または `*.test.tsx`
- テスト対象ファイルと同じディレクトリに配置

**例**:
```typescript
// games/reversi/useReversi.test.ts
import { renderHook, act } from '@testing-library/react';
import { useReversi } from './useReversi';

describe('useReversi Hook', () => {
  it('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useReversi());
    expect(result.current.gameState.currentPlayer).toBe('BLACK');
  });
});
```

### 2. E2Eテスト (Playwright)

**目的**: 実際のユーザー操作フローの統合動作保証

**対象**:
- ページ全体の動作
- ユーザーインタラクション
- レスポンシブデザイン
- ブラウザ間の互換性

**実行方法**:
```bash
npm run test:e2e               # 全E2Eテスト実行
npm run test:e2e-ui            # UI付きで実行
npm run test:e2e -- <spec>     # 特定specファイルの実行
```

**配置場所と命名規則**:
- **ゲーム固有のテスト:**
  - `src/games/{ゲーム名}/e2e/*.spec.ts`
  - 各ゲームのディレクトリ配下の`e2e`ディレクトリに配置します。
- **横断的なテスト:**
  - `tests/*.spec.ts`
  - 特定のゲームに依存しない、共通機能（ナビゲーション等）のテストを配置します。

**例**:
```typescript
// src/games/reversi/e2e/reversi.spec.ts
test('履歴機能が正しく動作する', async ({ page }) => {
  await page.goto('/games/reversi');
  await page.locator('[data-testid="cell-2-3"]').click();

  const counter = await page.locator('[data-testid="history-counter"]').textContent();
  expect(counter).toBe('2 / 2');
});
```

### 3. 静的解析・品質チェック

**目的**: コード品質とライセンス適合性の保証

**構成**:
- **ESLint**: コード品質・スタイルチェック
- **TypeScript**: 型安全性チェック
- **License Checker**: 依存関係のライセンス確認

**実行方法**:
```bash
npm run test:lint              # ESLint実行
npm run test:license           # ライセンスチェック
npm test                       # 全テスト実行
```

## テスト環境設定

### Vitest設定 (`vitest.config.mts`)

```typescript
import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'tests/**'],
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

### セットアップファイル (`vitest.setup.ts`)

```typescript
import { expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)
```

## テスト作成ガイドライン

### ユニットテスト

**コアロジックテスト**:
```typescript
describe('Reversi Core Logic', () => {
  it('ゲームが正しく初期化されることを確認', () => {
    const gameState = createInitialState();
    expect(gameState.currentPlayer).toBe('BLACK');
    expect(gameState.scores.BLACK).toBe(2);
  });
});
```

**カスタムフックテスト**:
```typescript
describe('useReversi Hook', () => {
  it('履歴機能が動作する', () => {
    const { result } = renderHook(() => useReversi());

    act(() => {
      result.current.makeMove(2, 3);
    });

    expect(result.current.gameHistory.length).toBe(2);
  });
});
```

### E2Eテスト

**基本パターン**:
```typescript
describe('ゲーム名のE2Eテスト', () => {
  beforeEach(async ({ page }) => {
    await page.goto('/games/game-name');
    await page.waitForLoadState('networkidle');
  });

  test('機能名が正しく動作する', async ({ page }) => {
    // テスト実装
  });
});
```

**data-testid属性の使用**:
```typescript
// 推奨: data-testid属性を使用
await page.locator('[data-testid="reset-button"]').click();

// 非推奨: テキストやCSSセレクタに依存
await page.locator('button:has-text("リセット")').click();
```

## CI/CD統合

### pre-pushフック

```bash
npm run test:lint              # ESLint
npm run test:license           # ライセンスチェック
npm run test:unit              # ユニットテスト
npm run test:e2e               # E2Eテスト
npm run build                  # ビルド確認
```

### テスト実行順序

1. **静的解析**: 高速で基本的な問題を検出
2. **ユニットテスト**: 個別機能の動作確認
3. **E2Eテスト**: 統合動作の確認
4. **ビルド**: 本番環境での動作確認

## 新機能開発時のテスト要件

### 1. ゲーム追加時

**必須テスト**:
- コアロジックのユニットテスト
- 基本操作のE2Eテスト
- レスポンシブ対応の確認

**テンプレート**:
```typescript
// games/new-game/core.test.ts
describe('New Game Core Logic', () => {
  it('ゲームが正しく初期化される', () => {
    // テスト実装
  });
});

// src/games/new-game/e2e/new-game.spec.ts
describe('New GameのE2Eテスト', () => {
  test('基本操作が動作する', async ({ page }) => {
    // テスト実装
  });
});
```

### 2. 共通コンポーネント追加時

**必須テスト**:
- コンポーネントのユニットテスト
- プロップス変化のテスト
- 使用箇所でのE2Eテスト

### 3. カスタムフック追加時

**必須テスト**:
- フックのユニットテスト
- 状態変化のテスト
- 副作用のテスト

## トラブルシューティング

### よくある問題

**1. テストが不安定**
```typescript
// 解決策: 適切な待機処理
await page.waitForTimeout(500);
await page.waitForLoadState('networkidle');
```

**2. 型エラー**
```typescript
// 解決策: 適切な型アサーション
expect(result.current.gameState.winner as Player).toBe('BLACK');
```

**3. モック不要**
- 実際のコンポーネント・フックをテスト
- 外部依存は最小限に抑制

## パフォーマンス考慮事項

### テスト実行時間の最適化

- **並列実行**: Playwrightの並列実行を活用
- **選択実行**: 変更箇所に関連するテストのみ実行
- **キャッシュ活用**: node_modulesやビルド成果物のキャッシュ

### リソース使用量

- **メモリ**: jsdom環境でのメモリリーク対策
- **CPU**: 並列実行数の調整
- **ディスク**: テスト成果物の定期クリーンアップ

## 参考資料

- [Vitest公式ドキュメント](https://vitest.dev/)
- [Testing Library公式ドキュメント](https://testing-library.com/)
- [Playwright公式ドキュメント](https://playwright.dev/)
- [プロジェクトのテスト戦略](./testing-strategy.md)
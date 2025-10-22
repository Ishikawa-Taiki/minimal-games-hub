# テクニカルガイド: テスト戦略

## 概要

このプロジェクトでは、品質保証のために3層のテスト戦略を採用しています。また、ドキュメントを仕様書として活用する仕様駆動開発 (TDD) を推奨し、テスト・実装・ドキュメントの一貫性を保証します。

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

### 2. E2Eテスト (Playwright)

**目的**: 実際のユーザー操作フローの統合動作保証

**対象**:
- ページ全体の動作
- ユーザーインタラクション
- 無効な操作に対するコンソールエラーの検証
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

## 仕様駆動開発 (TDD) による品質保証

ゲームの安定性とデバッグ容易性を向上させるため、特にユーザーによる無効な操作は、仕様書駆動（ドキュメント駆動）のテストファーストアプローチで開発します。

1.  **仕様定義 (`spec-action.md`)**:
    -   新機能や修正に着手する前に、まず各ゲームの`spec-action.md`に、無効な操作の仕様を定義します。
    -   仕様には、どのような操作が無効であり、その際にどのような`console.error`メッセージが出力されるべきかを、以下の表形式で明記します。

| シナリオ | コンソールエラーメッセージ |
| :--- | :--- |
| （ここに具体的な操作シナリオを記述） | `（ここに出力されるエラーメッセージを記述）` |

2.  **E2Eテストによる仕様の検証**:
    -   次に、`spec-action.md`に定義した仕様を検証するためのE2Eテストを先行して実装します。
    -   Playwrightの`page.on('console', ...)`を用いてコンソール出力を監視し、仕様書通りのエラーメッセージが出力されることをアサートします。この時点では、実装がまだなのでテストは失敗します。

3.  **コアロジックとUIの実装**:
    - 失敗するE2Eテストを成功させるために、コアロジック(`core.ts`)を実装します。
        - コアロジックは、無効な操作を検知した場合、状態を変更せずに仕様書通りの`console.error`メッセージを出力します。
    - UI層（コンポーネントやフック）は、ユーザーの入力をブロックせず、常にコアロジックに伝達します。UI上での`disabled`属性の使用などは原則として行いません。
    - 実装後、E2Eテストが成功することを確認します。

この「仕様書 → E2Eテスト → 実装」というサイクルにより、ドキュメント、テスト、実装の三者が常に一致する状態を維持します。

## テスト作成ガイドライン

### ユニットテスト

**コアロジックテスト**:
```typescript
// games/reversi/core.test.ts
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
// games/reversi/useReversi.test.ts
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

### 機能別テスト要件

#### 履歴機能のテスト要件
E2Eテストで以下の項目を検証します。
1. **初期状態**: 履歴カウンターが「1 / 1」であり、履歴操作ボタンが無効化されている。
2. **手番実行**: 手番を実行すると、履歴カウンターが更新され、「戻る」ボタンが有効化される。
3. **履歴操作**:
   - 「戻る」「進む」機能が正しく動作する。
   - 「最初へ」「最後へ」機能が正しく動作する。
   - 履歴カウンターの表示が正確に更新される。
4. **状態復元**: 履歴を移動した際に、盤面・スコア・手番などのゲーム状態が正確に復元される。

#### ヒント機能のテスト要件
E2Eテストで以下の項目を検証します。
1. **ヒントレベル切り替え**: ヒントボタンクリックで、ヒントレベルが `none` → `placeable` → `full` → `none` の順に切り替わる。
2. **ヒント表示**: 各レベルで、仕様書通りの適切なヒントが表示される。
3. **フルヒントモードでの操作**: フルヒントモードで駒を2回タップすると、駒が移動する。

### E2Eテストの安定性

- **`data-testid`属性の使用**: E2Eテストの安定性を確保するため、要素の特定には `data-testid` 属性を必ず使用します。
  ```typescript
  // 推奨: data-testid属性を使用
  await page.locator('[data-testid="reset-button"]').click();

  // 非推奨: テキストやCSSセレクタに依存
  await page.locator('button:has-text("リセット")').click();
  ```
- **待機処理**: アニメーションや非同期処理が原因でテストが不安定になる場合は、`waitFor` 系のAPIを適切に使用して、アプリケーションの状態が安定するのを待ってからアサーションを実行します。

### テストカバレッジ
- **方針**: 新機能を追加する際は、既存の機能と同等のテストカバレッジを維持することを目標とします。

## CI/CD統合

### pre-pushフック

`husky`によるpre-pushフックで、以下のコマンドが自動実行されます。
```bash
npm run test:lint              # ESLint
npm run test:license           # ライセンスチェック
npm run test:unit              # ユニットテスト
npm run test:e2e               # E2Eテスト
npm run build                  # ビルド確認
```

### テスト実行順序

CI/CDパイプラインでは、以下の順序でテストが実行されます。
1. **静的解析**: 高速で基本的な問題を検出
2. **ユニットテスト**: 個別機能の動作確認
3. **E2Eテスト**: 統合動作の確認
4. **ビルド**: 本番環境での動作確認

## 新機能開発時のテスト要件

### 1. ゲーム追加時

**必須テスト**:
- コアロジックのユニットテスト
- 基本操作と主要機能（履歴、ヒント等）のE2Eテスト
- レスポンシブ対応の確認

### 2. 共通コンポーネント追加時

**必須テスト**:
- コンポーネントのユニットテスト
- プロップス変化に対する動作のテスト
- コンポーネントを使用している主要箇所でのE2Eテスト

### 3. カスタムフック追加時

**必須テスト**:
- フックのユニットテスト
- 状態変化のテスト
- 副作用のテスト

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

## トラブルシューティング

### よくある問題

**1. テストが不安定**
```typescript
// 解決策: 適切な待機処理
await page.waitForTimeout(500); // 最終手段としての固定待機
await page.waitForLoadState('networkidle'); // ネットワークが安定するのを待つ
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

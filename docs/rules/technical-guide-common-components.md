# 共通コンポーネント利用ガイド (COMMON COMPONENTS USAGE GUIDE)

本ドキュメントは、プロジェクト内で提供される共通コンポーネントの正しい使用方法と、一貫したユーザーエクスペリエンスを提供するためのガイドラインを定義します。

## 1. 共通コンポーネントの概要

### 1.1. 設計思想

共通コンポーネントは以下の原則に基づいて設計されています：

- **一貫性**: 全ゲームで統一されたUI/UXを提供
- **レスポンシブ対応**: PC・モバイル両対応の最適化されたレイアウト
- **アクセシビリティ**: 幼児を含む全ユーザーが利用可能
- **保守性**: 共通機能の一元管理による効率的な開発・保守

### 1.2. 利用必須の原則

**重要**: 新しいゲームを実装する際、または既存ゲームを修正する際は、**必ず**適切な共通コンポーネントを使用してください。独自実装は原則として禁止されています。

## 2. GameLayoutコンポーネント

### 2.1. 概要

`GameLayout`は全ゲーム共通のレイアウトを提供する最重要コンポーネントです。

**配置場所**: `app/components/GameLayout.tsx`

### 2.2. 必須使用ケース

以下の場合は**必ず**`GameLayout`を使用してください：

1. **新しいゲームの実装**
2. **既存ゲームのレスポンシブ対応**
3. **ゲーム画面のレイアウト変更**

### 2.3. 提供機能

#### 2.3.1. レスポンシブレイアウト
- **PCレイアウト**: サイドバー形式のコントロールパネル
- **モバイルレイアウト**: FAB（フローティングアクションボタン）+ ボトムシート

#### 2.3.2. 統一されたコントロール機能
- ゲームリセット機能
- ルール表示リンク
- ホームページへの戻りリンク
- ヒント機能（対応ゲームのみ）
- 履歴機能（対応ゲームのみ）

### 2.4. 使用方法

#### 2.4.1. 基本的な使用パターン

```typescript
// GameClientPage.tsx での実装例
import GameLayout from '@/app/components/GameLayout';
import YourGame, { useYourGameController } from '@/games/your-game';

const YourGameWithLayout = memo(function YourGameWithLayout({ manifest, slug }: GameClientPageProps) {
  const controller = useYourGameController();
  
  return (
    <GameLayout 
      gameName={manifest.displayName} 
      slug={slug}
      gameController={controller}
    >
      <YourGame controller={controller} />
    </GameLayout>
  );
});
```

#### 2.4.2. 必須Props

- `gameName`: ゲームの表示名（manifest.displayNameを使用）
- `slug`: ゲームのスラッグ（URLパス用）
- `gameController`: GameControllerインターフェースに準拠したコントローラー
- `children`: ゲーム本体のコンポーネント

#### 2.4.3. GameControllerインターフェース要件

`GameLayout`を使用するには、ゲームコントローラーが以下のインターフェースに準拠している必要があります：

```typescript
interface BaseGameController<TState extends BaseGameState, TAction> {
  gameState: TState;
  dispatch: React.Dispatch<TAction>;
  resetGame: () => void;
}
```

### 2.5. 実装手順

#### 2.5.1. 新しいゲームの場合

1. **GameControllerフックの作成**
   ```typescript
   // games/your-game/useYourGame.ts
   export function useYourGame(): BaseGameController<YourGameState, YourGameAction> {
     // GameControllerインターフェースに準拠した実装
   }
   ```

2. **ゲームコンポーネントの修正**
   ```typescript
   // games/your-game/index.tsx
   interface YourGameProps {
     controller?: YourGameController;
   }
   
   const YourGame = ({ controller: externalController }: YourGameProps = {}) => {
     const internalController = useYourGame();
     const controller = externalController || internalController;
     // ...
   };
   ```

3. **GameClientPageでの統合**
   ```typescript
   // app/games/[slug]/GameClientPage.tsx
   if (slug === 'your-game') {
     return <YourGameWithLayout manifest={manifest} slug={slug} />;
   }
   ```

#### 2.5.2. 既存ゲームの移行

1. **現状分析**: 既存の実装を確認
2. **GameControllerフックの作成**: 既存ロジックをGameControllerパターンに適合
3. **段階的移行**: テストを実行しながら段階的に移行
4. **動作確認**: PC・モバイル両環境での動作確認

### 2.6. トラブルシューティング

#### 2.6.1. よくある問題

**問題**: GameLayoutが表示されない
**原因**: GameControllerが正しく実装されていない、またはpropsが不正
**解決**: 
- GameControllerインターフェースへの準拠確認
- propsの型と値の確認
- ブラウザの開発者ツールでエラーログを確認

**問題**: レスポンシブ動作しない
**原因**: useResponsiveフックが正しく動作していない
**解決**:
- ブラウザのリサイズテスト実行
- useResponsiveフックの動作確認
- GameLayoutのログ出力確認

#### 2.6.2. デバッグ方法

開発環境では`GameStateDebugger`コンポーネントが自動的に表示されます：
- 右下（PC）または左下（モバイル）に表示
- ゲーム状態の変更をリアルタイム監視
- ログのエクスポート機能

## 3. UIコンポーネント

### 3.1. FloatingActionButton (FAB)

**配置場所**: `app/components/ui/FloatingActionButton.tsx`

モバイルレイアウトで使用されるフローティングアクションボタンです。

#### 3.1.1. 使用方法
```typescript
<FloatingActionButton
  onClick={handleFABClick}
  ariaLabel="コントロールパネルを開く"
  icon="⚙️"
/>
```

### 3.2. BottomSheet

**配置場所**: `app/components/ui/BottomSheet.tsx`

モバイルレイアウトでコントロールパネルを表示するためのボトムシートです。

#### 3.2.1. 使用方法
```typescript
<BottomSheet
  isOpen={isBottomSheetOpen}
  onClose={handleBottomSheetClose}
  title="コントロール"
>
  {/* コンテンツ */}
</BottomSheet>
```

### 3.3. GameStateDebugger

**配置場所**: `app/components/GameStateDebugger.tsx`

開発環境でのデバッグ支援コンポーネントです。

#### 3.3.1. 自動表示条件
- `process.env.NODE_ENV === 'development'`の場合のみ表示
- GameLayoutコンポーネント内で自動的に配置

## 4. フック（Hooks）

### 4.1. useResponsive

**配置場所**: `hooks/useResponsive.ts`

レスポンシブ対応のためのフックです。

#### 4.1.1. 使用方法
```typescript
const responsiveState = useResponsive();
const isMobileView = isMobile(responsiveState);
```

### 4.2. useGameStateLogger

**配置場所**: `hooks/useGameStateLogger.ts`

ゲーム状態の変更を自動的にログ出力するフックです。

#### 4.2.1. 使用方法
```typescript
const logger = useGameStateLogger('ComponentName', gameState, additionalData);
logger.log('EVENT_NAME', eventData);
```

## 5. 品質保証

### 5.1. 必須テスト

共通コンポーネントを使用する際は、以下のテストを必ず実行してください：

1. **ESLint**: `npm run test:lint`
2. **ユニットテスト**: `npm run test:unit`
3. **E2Eテスト**: `npm run test:e2e`

### 5.2. 手動確認項目

1. **レスポンシブ動作**: ブラウザリサイズでのレイアウト切り替え
2. **モバイル機能**: FABクリック → ボトムシート表示
3. **コントロール機能**: リセット、ルール表示、ホーム戻りの動作
4. **ゲーム固有機能**: ヒント、履歴機能の動作（対応ゲームのみ）

## 6. 更新とメンテナンス

### 6.1. 共通コンポーネントの更新

共通コンポーネントを更新する際は：

1. **影響範囲の確認**: 全ゲームへの影響を評価
2. **後方互換性の維持**: 既存の使用方法を破壊しない
3. **全ゲームでのテスト**: 更新後は全ゲームでテスト実行
4. **ドキュメント更新**: 本ガイドの更新

### 6.2. 新機能の追加

新しい共通機能を追加する際は：

1. **設計レビュー**: アーキテクチャとの整合性確認
2. **インターフェース設計**: 一貫性のあるAPI設計
3. **テストの追加**: 新機能に対するテスト追加
4. **ドキュメント更新**: 使用方法の文書化

## 7. 参考資料

- **アプリケーションアーキテクチャ**: `docs/rules/technical-guide-application-architecture.md`
- **開発ワークフロー**: `docs/rules/technical-guide-development-workflow.md`
- **型定義**: `types/game.ts`
- **実装例**: `games/tictactoe/`, `games/reversi/`
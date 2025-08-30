# UIコンポーネントカタログ

このドキュメントは、プロジェクト全体で利用可能な共通UIコンポーネントの仕様と使用方法を記述するカタログです。

## 1. ボタン (Buttons)

`app/components/ui/buttons.tsx` で定義されています。

- **`PositiveButton`**: 肯定的なアクション（はい、決定、送信など）に使用します。
- **`NegativeButton`**: 否定的なアクション（いいえ、キャンセル、やめるなど）に使用します。

### 1.1. 使用方法
```typescript
import { PositiveButton, NegativeButton } from '@/app/components/ui/buttons';

<PositiveButton labelText="実行" onClick={() => console.log('実行')} />
<NegativeButton labelText="キャンセル" onClick={() => console.log('キャンセル')} />
```

### 1.2. Props
- `labelText: string`: ボタンに表示されるテキスト。
- `onClick: () => void`: ボタンクリック時に実行される関数。

## 2. ダイアログ (Dialogs)

`app/hooks/useDialog.tsx` で定義されたフックを通じて利用します。

### 2.1. 確認ダイアログ (Confirmation Dialog)

#### 2.1.1. 使用方法
```typescript
import { useDialog } from '@/app/hooks/useDialog';

const { confirm } = useDialog();
const isConfirmed = await confirm({
  title: 'アクションの確認',
  body: 'この操作を実行してもよろしいですか？',
});
```

### 2.2. アラートダイアログ (Alert Dialog)

#### 2.2.1. 使用方法
```typescript
import { useDialog } from '@/app/hooks/useDialog';

const { alert } = useDialog();
await alert({
  title: 'お知らせ',
  body: '処理が完了しました。',
});
```

### 2.3. 前提条件
これらのフックを利用するコンポーネントは、ツリーの上位に `DialogProvider` が配置されている必要があります。これは `app/layout.tsx` で設定済みのため、通常は意識する必要はありません。

## 3. その他のUIコンポーネント

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

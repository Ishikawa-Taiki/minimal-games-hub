# UIコンポーネントカタログ

このドキュメントは、プロジェクト全体で使用される共通UIコンポーネントの仕様、使用法、および設計思想をまとめたものです。

## 1. ボタン (Button)

ボタンは、ユーザーのアクションをトリガーするための基本的な要素です。すべてのボタンは`<BaseButton>`を基盤としており、一貫した操作性とスタイルを提供します。

### 1.1. 基本的な考え方

-   **一貫性**: サイズ、無効状態、クリック時のフィードバックなどの基本的な振る舞いを共有します。
-   **意味論的コンポーネント**: `<PositiveButton>`のように、ボタンの目的を示す意味的なコンポーネントの使用を推奨します。
-   **色の哲学**:
    -   **青 (`primary`)**: 肯定的、主要なアクション（例：「保存」）。
    -   **赤 (`danger`)**: 破壊的、否定的なアクション（例：「削除」）。
    -   **緑 (`success`)**: 成功、有効な状態（例：トグルON）。
    -   **白 (`ghost`)**: 第二のアクション、無効な状態（例：トグルOFF）。
    -   **灰色 (`disabled`)**: 操作不能な状態。明確な灰色背景で表現します。

### 1.2. `<BaseButton>`

すべてのボタンコンポーネントの基盤です。直接使用するのではなく、これをラップした意味的なコンポーネントを使用してください。

**主な機能**:
-   **クリックデバウンス**: 250msのデバウンスが設定されており、連打による意図しない複数回実行を防ぎます。
-   **押下フィードバック**: クリック中はボタンがわずかに半透明になり、縮小します。
-   **テキストオーバーフロー**: ボタンの幅が固定されている場合、長いラベルは自動的に省略記号（...）で表示されます。

**Props**:
-   `variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'`
-   `size?: 'small' | 'medium' | 'large'`
-   `disabled?: boolean`
-   `fullWidth?: boolean` (幅100%)
-   `fixedWidth?: number` (固定幅をピクセルで指定)
-   `onClick: () => void`

### 1.3. コンポーネント一覧

#### `<PositiveButton>`
肯定的、または主要なアクションに使用します。
-   **実装**: `<BaseButton variant="primary">`

#### `<NegativeButton>`
否定的、または破壊的なアクションに使用します。
-   **実装**: `<BaseButton variant="danger">`

#### `<SelectableButton>`
ON/OFFの状態を持つトグルボタンです。状態は外部から`isSelected`プロパティで制御します。
-   **表示**: チェックボックス風アイコン + ラベル
-   **状態**: ONのとき緑(`success`)、OFFのとき白(`ghost`)になります。
-   **Props**:
    -   `isSelected: boolean`
    -   `onStateChange: (isSelected: boolean) => void`
    -   その他、`size`や`disabled`など`<BaseButton>`のPropsを継承します。

```tsx
const [isSelected, setIsSelected] = useState(false);

<SelectableButton
  isSelected={isSelected}
  onStateChange={setIsSelected}
  size="medium"
>
  ヒントを表示
</SelectableButton>
```

## 2. ダイアログ (Dialog)

ユーザーへの通知や確認を行うためのモーダルコンポーネントです。`useDialog`フックを通じて簡単に呼び出すことができます。

### 2.1. `useDialog` フック

ダイアログを表示するためのカスタムフックです。`DialogProvider`がアプリケーションのルートで提供されている必要があります。

-   `alert(options)`: ユーザーに情報を通知します。Promiseを返します。
-   `confirm(options)`: ユーザーに確認を求めます。ユーザーの選択に応じて`true`または`false`を返すPromiseを返します。

**`options`オブジェクト**:
-   `title: string`
-   `message: string`

**使用例**:
```tsx
import { useDialog } from '@/app/components/ui/DialogProvider';

function MyComponent() {
  const { alert, confirm } = useDialog();

  const handleConfirm = async () => {
    const result = await confirm({
      title: '削除の確認',
      message: '本当にこのアイテムを削除しますか？',
    });
    if (result) {
      // 削除処理を実行
      await alert({ title: '完了', message: '削除が完了しました。' });
    }
  };

  return <button onClick={handleConfirm}>削除</button>;
}
```

### 2.2. ダイアログの挙動

-   **操作の強制**: `AlertDialog`と`ConfirmationDialog`は、ユーザーに明確な選択を強制するため、デフォルトで画面外クリックやEscキーでのクローズはできません。
-   **ボタン**: ダイアログ内のボタンには、それぞれ`<PositiveButton>`と`<NegativeButton>`が使用されています。

---
*このドキュメントは、新しいコンポーネントが追加された際、または既存のコンポーネントの仕様が変更された際に更新されます。*

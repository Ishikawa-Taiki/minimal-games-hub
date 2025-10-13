'use client';
import React, { useState } from 'react';
import {
  Button,
  PositiveButton,
  NegativeButton,
  SelectableButton,
  DialogProvider,
  useDialog,
} from '@/core/components/ui';

function DebugPageClient() {
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isDisabled, setIsDisabled] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [dialogResult, setDialogResult] = useState<string | null>(null);
  const { alert, confirm } = useDialog();

  const handleShowAlert = async () => {
    await alert({
      title: 'アラート',
      message: 'これはアラートダイアログです。',
    });
    setDialogResult('アラートダイアログが確認されました。');
  };

  const handleShowConfirmation = async () => {
    const result = await confirm({
      title: '確認',
      message: 'この操作を実行しますか？',
    });
    setDialogResult(`確認ダイアログの結果: ${result}`);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>UIコンポーネント デバッグページ</h1>

      <section style={{ marginBottom: '2rem' }}>
        <h2>ボタン</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <PositiveButton size={size} disabled={isDisabled} onClick={() => console.log('Positive clicked')}>
            ポジティブ
          </PositiveButton>
          <NegativeButton size={size} disabled={isDisabled} onClick={() => console.log('Negative clicked')}>
            ネガティブ
          </NegativeButton>
          <SelectableButton
            size={size}
            disabled={isDisabled}
            isSelected={isSelected}
            onStateChange={setIsSelected}
          >
            選択可能
          </SelectableButton>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>
            サイズ:{' '}
            <select value={size} onChange={(e) => setSize(e.target.value as 'small' | 'medium' | 'large')}>
              <option value="small">小</option>
              <option value="medium">中</option>
              <option value="large">大</option>
            </select>
          </label>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>
            <input type="checkbox" checked={isDisabled} onChange={(e) => setIsDisabled(e.target.checked)} />
            無効
          </label>
        </div>
        <div>
          SelectableButtonの選択状態: {String(isSelected)}
        </div>
      </section>

      <section>
        <h2>ダイアログ</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button onClick={handleShowAlert}>アラート表示</Button>
          <Button onClick={handleShowConfirmation}>確認ダイアログ表示</Button>
        </div>
        {dialogResult && <p style={{ marginTop: '1rem' }}>最後のダイアログ結果: {dialogResult}</p>}
      </section>
    </div>
  );
}


export default function DebugPage() {
  // DialogProviderでラップすることが必須
  return (
    <DialogProvider>
      <DebugPageClient />
    </DialogProvider>
  );
}

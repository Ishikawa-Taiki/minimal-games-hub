'use client';

import React, { useState } from 'react';
import { PositiveButton } from '@/app/components/ui/PositiveButton';
import { NegativeButton } from '@/app/components/ui/NegativeButton';
import { SelectableButton } from '@/app/components/ui/SelectableButton';
import { useDialog } from '@/app/components/ui/DialogProvider';
import { ButtonSize } from '@/app/components/ui/BaseButton';

// --- Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2rem',
    fontFamily: 'sans-serif',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  },
  h1: {
    fontSize: '2rem', fontWeight: 'bold', color: '#111827',
    borderBottom: '1px solid #d1d5db', paddingBottom: '1rem', marginBottom: '2rem',
  },
  section: {
    padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px',
    backgroundColor: '#ffffff', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem',
  },
  h2: {
    fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginTop: 0,
    borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1.5rem',
  },
  controls: {
    display: 'flex', alignItems: 'center', gap: '1.5rem',
    padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px', marginBottom: '1.5rem',
  },
  label: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
  },
  select: {
    padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db',
  },
  buttonGroup: {
    display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
  },
  output: {
    marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f3f4f6',
    borderRadius: '8px', fontFamily: 'monospace', color: '#374151',
  },
};

export default function DebugPage() {
  const { alert, confirm } = useDialog();
  const [buttonSize, setButtonSize] = useState<ButtonSize>('medium');
  const [isDisabled, setIsDisabled] = useState(false);
  const [isSelectable, setIsSelectable] = useState(false);
  const [dialogResult, setDialogResult] = useState<string | null>(null);

  const handleAlert = async () => {
    setDialogResult(null);
    await alert({
      title: 'アラート',
      message: 'これはアラートダイアログです。',
    });
    setDialogResult('アラートダイアログが確認されました。');
  };

  const handleConfirm = async () => {
    setDialogResult(null);
    const result = await confirm({
      title: '確認',
      message: 'この操作を実行しますか？',
    });
    setDialogResult(`確認ダイアログの結果: ${result}`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.h1}>UIコンポーネント デバッグページ</h1>

      {/* --- ボタンセクション --- */}
      <section style={styles.section}>
        <h2 style={styles.h2}>ボタン</h2>
        <div style={styles.controls}>
          <label style={styles.label}>
            サイズ:
            <select
              style={styles.select}
              value={buttonSize}
              onChange={(e) => setButtonSize(e.target.value as ButtonSize)}
            >
              <option value="small">小</option>
              <option value="medium">中</option>
              <option value="large">大</option>
            </select>
          </label>
          <label style={styles.label}>
            <input
              type="checkbox"
              checked={isDisabled}
              onChange={(e) => setIsDisabled(e.target.checked)}
            />
            無効
          </label>
        </div>
        <div style={styles.buttonGroup}>
          <PositiveButton size={buttonSize} disabled={isDisabled} onClick={() => {}}>
            ポジティブ
          </PositiveButton>
          <NegativeButton size={buttonSize} disabled={isDisabled} onClick={() => {}}>
            ネガティブ
          </NegativeButton>
          <SelectableButton
            size={buttonSize}
            disabled={isDisabled}
            isSelected={isSelectable}
            onStateChange={setIsSelectable}
          >
            選択可能
          </SelectableButton>
        </div>
        <div style={styles.output}>
          SelectableButtonの選択状態: {isSelectable.toString()}
        </div>
      </section>

      {/* --- ダイアログセクション --- */}
      <section style={styles.section}>
        <h2 style={styles.h2}>ダイアログ</h2>
        <div style={styles.buttonGroup}>
          <PositiveButton onClick={handleAlert}>
            アラート表示
          </PositiveButton>
          <PositiveButton onClick={handleConfirm}>
            確認ダイアログ表示
          </PositiveButton>
        </div>
        {dialogResult && (
          <div style={styles.output}>
            最後のダイアログ結果: {dialogResult}
          </div>
        )}
      </section>
    </div>
  );
}
'use client';

import React from 'react';
import { useDialog } from '../hooks/useDialog';
import { PositiveButton, NegativeButton } from '../components/ui/buttons';
import StyleSheet from '../styles/StyleSheet';

const styles = StyleSheet.create({
  container: {
    padding: '2rem',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  subHeading: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginTop: '2rem',
    marginBottom: '1rem',
  },
  text: {
    marginBottom: '2rem',
  },
  componentBox: {
    marginBottom: '2rem',
  },
  buttonContainer: {
    display: 'flex',
    gap: '1rem',
  },
  docs: {
    backgroundColor: '#f3f4f6',
    padding: '1rem',
    borderRadius: '4px',
    whiteSpace: 'pre-wrap',
    fontFamily: 'monospace',
    fontSize: '12px',
    marginTop: '1rem',
  }
});

const DebugPage: React.FC = () => {
  const { confirm, alert } = useDialog();

  const handleOpenConfirmation = async () => {
    const isConfirmed = await confirm({
      title: 'アクションの確認',
      body: 'この操作を実行してもよろしいですか？この操作は元に戻せません。',
    });

    if (isConfirmed) {
      alert({
        title: '実行完了',
        body: 'アクションが実行されました。',
      });
    } else {
      alert({
        title: 'キャンセル',
        body: 'アクションはキャンセルされました。',
      });
    }
  };

  const handleOpenAlert = () => {
    alert({
      title: 'お知らせ',
      body: 'これは1ボタンのアラートダイアログです。',
    });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>UIコンポーネント デバッグページ</h1>
      <p style={styles.text}>このページは共通UIコンポーネントの開発とテストのために使用します。</p>

      <div style={styles.componentBox}>
        <h2 style={styles.subHeading}>ボタン</h2>
        <div style={styles.buttonContainer}>
          <PositiveButton
            labelText="決定アクション"
            onClick={() => alert({ title: '通知', body: '決定ボタンがクリックされました！' })}
          />
          <NegativeButton
            labelText="キャンセルアクション"
            onClick={() => alert({ title: '通知', body: 'キャンセルボタンがクリックされました！' })}
          />
        </div>
        <pre style={styles.docs}>{`
          --- ボタンコンポーネント仕様 ---
          プライマリ（決定・実行）およびセカンダリ（キャンセル・中断）のアクションに使用するために設計されています。

          コンポーネント:
          - PositiveButton: from '@/app/components/ui/buttons'
          - NegativeButton: from '@/app/components/ui/buttons'

          Props:
          - labelText: string (必須) - ボタンに表示するテキスト
          - onClick: () => void (必須) - ボタンクリック時に実行される関数
        `}</pre>
      </div>

      <div style={styles.componentBox}>
        <h2 style={styles.subHeading}>ダイアログ</h2>
        <div style={styles.buttonContainer}>
          <PositiveButton labelText="確認ダイアログを開く" onClick={handleOpenConfirmation} />
          <PositiveButton labelText="アラートダイアログを開く" onClick={handleOpenAlert} />
        </div>
        <pre style={styles.docs}>{`
          --- ダイアログ仕様 ---
          ユーザーへの通知やアクションの確認に使用する、カスタムフックで管理されるダイアログです。

          フック:
          - useDialog: from '@/app/hooks/useDialog'

          使い方:
          // 確認ダイアログ (Promiseはbooleanを返します)
          const { confirm } = useDialog();
          const isConfirmed = await confirm({ title: 'タイトル', body: '本文' });

          // アラートダイアログ (Promiseはvoidを返します)
          const { alert } = useDialog();
          await alert({ title: 'タイトル', body: '本文' });

          前提条件:
          - このフックを利用するコンポーネントは、上位の階層に <DialogProvider> が必要です。
          - この設定はルートレイアウトで完了済みです。
        `}</pre>
      </div>
    </div>
  );
};

export default DebugPage;

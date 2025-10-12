'use client';

import React, { useState } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Modal } from '@/app/components/ui/Modal';

// デモ用コンポーネント（開発時の動作確認用）
export function UIDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>共通UIコンポーネントデモ</h1>
      
      <section style={{ marginBottom: '2rem' }}>
        <h2>Buttonコンポーネント</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <Button variant="primary" onClick={() => console.log('Primary clicked')}>
            Primary
          </Button>
          <Button variant="secondary" onClick={() => console.log('Secondary clicked')}>
            Secondary
          </Button>
          <Button variant="danger" onClick={() => console.log('Danger clicked')}>
            Danger
          </Button>
          <Button variant="ghost" onClick={() => console.log('Ghost clicked')}>
            Ghost
          </Button>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <Button size="small" onClick={() => console.log('Small clicked')}>
            Small
          </Button>
          <Button size="medium" onClick={() => console.log('Medium clicked')}>
            Medium
          </Button>
          <Button size="large" onClick={() => console.log('Large clicked')}>
            Large
          </Button>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <Button fullWidth onClick={() => console.log('Full width clicked')}>
            Full Width Button
          </Button>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button disabled onClick={() => console.log('This should not fire')}>
            Disabled Button
          </Button>
        </div>
      </section>

      <section>
        <h2>Modalコンポーネント</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <Button onClick={() => setIsModalOpen(true)}>
            モーダルを開く
          </Button>
        </div>
        
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="デモモーダル"
          size="medium"
        >
          <p>これはモーダルのコンテンツです。</p>
          <p>ESCキーまたは外側をクリックして閉じることができます。</p>
          <div style={{ marginTop: '1rem' }}>
            <Button 
              variant="primary" 
              onClick={() => setIsModalOpen(false)}
            >
              閉じる
            </Button>
          </div>
        </Modal>
      </section>
    </div>
  );
}
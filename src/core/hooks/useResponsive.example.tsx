import React from 'react';
import { useResponsive } from './useResponsive';
import { isMobile, isDesktop } from '../types/game';

/**
 * useResponsiveフックの使用例
 * このコンポーネントは実装の参考として作成されています
 */
export function ResponsiveExample() {
  const responsiveState = useResponsive();

  return (
    <div>
      <h2>レスポンシブ状態の表示</h2>
      <p>現在の画面幅: {responsiveState.screenWidth}px</p>
      <p>レイアウトモード: {responsiveState.layoutMode}</p>
      
      {isMobile(responsiveState) && (
        <div style={{ backgroundColor: '#e3f2fd', padding: '16px', borderRadius: '8px' }}>
          <h3>📱 モバイルレイアウト</h3>
          <p>768px未満の画面サイズです</p>
          <ul>
            <li>縦向きのレイアウト</li>
            <li>タッチ操作に最適化</li>
            <li>コンパクトなUI要素</li>
          </ul>
        </div>
      )}
      
      {isDesktop(responsiveState) && (
        <div style={{ backgroundColor: '#f3e5f5', padding: '16px', borderRadius: '8px' }}>
          <h3>🖥️ デスクトップレイアウト</h3>
          <p>768px以上の画面サイズです</p>
          <ul>
            <li>横向きのレイアウト</li>
            <li>マウス操作に最適化</li>
            <li>詳細な情報表示</li>
          </ul>
        </div>
      )}
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>ブラウザのウィンドウサイズを変更して、レスポンシブ動作を確認してください。</p>
        <p>ブレークポイント: 768px</p>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { ResponsiveState } from '../types/game';

/**
 * レスポンシブデザインのためのカスタムフック
 * 768pxをブレークポイントとしてモバイル/デスクトップレイアウトを判定
 */
export function useResponsive(): ResponsiveState {
  const [responsiveState, setResponsiveState] = useState<ResponsiveState>(() => {
    // SSR対応: サーバーサイドでは安全なデフォルト値を返す
    if (typeof window === 'undefined') {
      return { layoutMode: 'desktop', screenWidth: 1024 };
    }
    
    // クライアントサイドでの初期値設定
    const width = window.innerWidth;
    return width < 768 
      ? { layoutMode: 'mobile', screenWidth: width }
      : { layoutMode: 'desktop', screenWidth: width };
  });

  useEffect(() => {
    // リサイズイベントハンドラー
    const handleResize = () => {
      const width = window.innerWidth;
      const newState: ResponsiveState = width < 768
        ? { layoutMode: 'mobile', screenWidth: width }
        : { layoutMode: 'desktop', screenWidth: width };
      
      setResponsiveState(newState);
    };

    // イベントリスナーの登録
    window.addEventListener('resize', handleResize);
    
    // 初回実行（マウント時の正確な値を取得）
    handleResize();

    // クリーンアップ
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return responsiveState;
}
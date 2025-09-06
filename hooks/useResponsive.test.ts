import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isMobile, isDesktop, ResponsiveState } from '../types/game';

// window.innerWidthをモック
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

// レスポンシブ状態を作成するヘルパー関数
const createResponsiveState = (width: number): ResponsiveState => {
  return width < 768 
    ? { layoutMode: 'mobile', screenWidth: width }
    : { layoutMode: 'desktop', screenWidth: width };
};

describe('レスポンシブシステム', () => {
  beforeEach(() => {
    // 各テスト前にデフォルト値をリセット
    mockInnerWidth(1024);
  });

  afterEach(() => {
    // モックをクリア
    vi.clearAllMocks();
  });

  describe('ResponsiveState型とヘルパー関数', () => {
    it('デスクトップサイズ（768px以上）で正しい状態を作成する', () => {
      const state = createResponsiveState(1024);
      
      expect(state.layoutMode).toBe('desktop');
      expect(state.screenWidth).toBe(1024);
      expect(isDesktop(state)).toBe(true);
      expect(isMobile(state)).toBe(false);
    });

    it('モバイルサイズ（768px未満）で正しい状態を作成する', () => {
      const state = createResponsiveState(375);
      
      expect(state.layoutMode).toBe('mobile');
      expect(state.screenWidth).toBe(375);
      expect(isMobile(state)).toBe(true);
      expect(isDesktop(state)).toBe(false);
    });

    it('ブレークポイント境界値（768px）でデスクトップとして扱う', () => {
      const state = createResponsiveState(768);
      
      expect(state.layoutMode).toBe('desktop');
      expect(state.screenWidth).toBe(768);
      expect(isDesktop(state)).toBe(true);
      expect(isMobile(state)).toBe(false);
    });

    it('ブレークポイント境界値（767px）でモバイルとして扱う', () => {
      const state = createResponsiveState(767);
      
      expect(state.layoutMode).toBe('mobile');
      expect(state.screenWidth).toBe(767);
      expect(isMobile(state)).toBe(true);
      expect(isDesktop(state)).toBe(false);
    });
  });

  describe('型安全性', () => {
    it('isMobile関数が正しい型ガードとして機能する', () => {
      const mobileState = createResponsiveState(375);
      const desktopState = createResponsiveState(1024);
      
      if (isMobile(mobileState)) {
        // TypeScriptの型チェックでlayoutModeが'mobile'として認識される
        expect(mobileState.layoutMode).toBe('mobile');
      }
      
      expect(isMobile(desktopState)).toBe(false);
    });

    it('isDesktop関数が正しい型ガードとして機能する', () => {
      const mobileState = createResponsiveState(375);
      const desktopState = createResponsiveState(1024);
      
      if (isDesktop(desktopState)) {
        // TypeScriptの型チェックでlayoutModeが'desktop'として認識される
        expect(desktopState.layoutMode).toBe('desktop');
      }
      
      expect(isDesktop(mobileState)).toBe(false);
    });
  });

  describe('エッジケース', () => {
    it('非常に小さい画面サイズでも正しく動作する', () => {
      const state = createResponsiveState(320);
      
      expect(state.layoutMode).toBe('mobile');
      expect(state.screenWidth).toBe(320);
      expect(isMobile(state)).toBe(true);
    });

    it('非常に大きい画面サイズでも正しく動作する', () => {
      const state = createResponsiveState(2560);
      
      expect(state.layoutMode).toBe('desktop');
      expect(state.screenWidth).toBe(2560);
      expect(isDesktop(state)).toBe(true);
    });

    it('ゼロサイズでもモバイルとして扱う', () => {
      const state = createResponsiveState(0);
      
      expect(state.layoutMode).toBe('mobile');
      expect(state.screenWidth).toBe(0);
      expect(isMobile(state)).toBe(true);
    });
  });

  describe('ブレークポイント境界値の詳細テスト', () => {
    const testCases = [
      { width: 767, expected: 'mobile' },
      { width: 768, expected: 'desktop' },
      { width: 769, expected: 'desktop' },
    ];

    testCases.forEach(({ width, expected }) => {
      it(`${width}pxで${expected}レイアウトになる`, () => {
        const state = createResponsiveState(width);
        expect(state.layoutMode).toBe(expected);
        expect(state.screenWidth).toBe(width);
      });
    });
  });
});
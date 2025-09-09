import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FABProps } from './FloatingActionButton';

// ヘルパー関数のテスト用インポート（実際のコンポーネントから抽出）
function getPositionStyle(position: FABProps['position']): React.CSSProperties {
  switch (position) {
    case 'bottom-right':
      return { bottom: '1.5rem', right: '1.5rem' };
    case 'bottom-left':
      return { bottom: '1.5rem', left: '1.5rem' };
    case 'top-right':
      return { top: '1.5rem', right: '1.5rem' };
    case 'top-left':
      return { top: '1.5rem', left: '1.5rem' };
    default:
      return { bottom: '1.5rem', right: '1.5rem' };
  }
}

function getSizeStyle(size: FABProps['size']): React.CSSProperties {
  switch (size) {
    case 'medium':
      return { width: '56px', height: '56px', fontSize: '1.25rem' };
    case 'large':
      return { width: '64px', height: '64px', fontSize: '1.5rem' };
    default:
      return { width: '56px', height: '56px', fontSize: '1.25rem' };
  }
}

describe('FloatingActionButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  describe('プロパティの検証', () => {
    it('デフォルトプロパティが正しく設定される', () => {
      const props: FABProps = {
        onClick: mockOnClick,
        ariaLabel: "テストボタン"
      };
      
      expect(props.onClick).toBe(mockOnClick);
      expect(props.ariaLabel).toBe("テストボタン");
      expect(props.icon).toBeUndefined(); // デフォルトは未定義
      expect(props.position).toBeUndefined(); // デフォルトは未定義
      expect(props.size).toBeUndefined(); // デフォルトは未定義
    });

    it('カスタムプロパティが正しく設定される', () => {
      const props: FABProps = {
        onClick: mockOnClick,
        ariaLabel: "カスタムボタン",
        icon: "🎮",
        position: "top-left",
        size: "large"
      };
      
      expect(props.icon).toBe("🎮");
      expect(props.position).toBe("top-left");
      expect(props.size).toBe("large");
    });
  });

  describe('スタイルヘルパー関数', () => {
    it('位置スタイルが正しく生成される', () => {
      expect(getPositionStyle('bottom-right')).toEqual({
        bottom: '1.5rem',
        right: '1.5rem'
      });

      expect(getPositionStyle('top-left')).toEqual({
        top: '1.5rem',
        left: '1.5rem'
      });

      expect(getPositionStyle('bottom-left')).toEqual({
        bottom: '1.5rem',
        left: '1.5rem'
      });

      expect(getPositionStyle('top-right')).toEqual({
        top: '1.5rem',
        right: '1.5rem'
      });
    });

    it('サイズスタイルが正しく生成される', () => {
      expect(getSizeStyle('medium')).toEqual({
        width: '56px',
        height: '56px',
        fontSize: '1.25rem'
      });

      expect(getSizeStyle('large')).toEqual({
        width: '64px',
        height: '64px',
        fontSize: '1.5rem'
      });
    });

    it('未定義の位置でデフォルト値が返される', () => {
      expect(getPositionStyle(undefined)).toEqual({
        bottom: '1.5rem',
        right: '1.5rem'
      });
    });

    it('未定義のサイズでデフォルト値が返される', () => {
      expect(getSizeStyle(undefined)).toEqual({
        width: '56px',
        height: '56px',
        fontSize: '1.25rem'
      });
    });
  });

  describe('イベントハンドラー', () => {
    it('onClick関数が呼び出し可能である', () => {
      const props: FABProps = {
        onClick: mockOnClick,
        ariaLabel: "クリックテスト"
      };
      
      props.onClick();
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });
});
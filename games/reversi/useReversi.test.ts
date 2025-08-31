import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useReversi } from './useReversi';

describe('useReversi Hook', () => {
  it('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useReversi());
    
    expect(result.current.gameState.currentPlayer).toBe('BLACK');
    expect(result.current.gameState.scores.BLACK).toBe(2);
    expect(result.current.gameState.scores.WHITE).toBe(2);
    expect(result.current.gameState.status).toBe('playing');
    expect(result.current.gameState.winner).toBeNull();
    expect(result.current.gameHistory.length).toBe(1);
    expect(result.current.currentHistoryIndex).toBe(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('有効な手を打つと履歴が追加される', () => {
    const { result } = renderHook(() => useReversi());
    
    act(() => {
      result.current.makeMove(2, 3); // 有効な手
    });
    
    expect(result.current.gameHistory.length).toBe(2);
    expect(result.current.currentHistoryIndex).toBe(1);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.gameState.currentPlayer).toBe('WHITE');
    expect(result.current.gameState.scores.BLACK).toBe(4);
    expect(result.current.gameState.scores.WHITE).toBe(1);
  });

  it('履歴を戻すことができる', () => {
    const { result } = renderHook(() => useReversi());
    
    // 手を打つ
    act(() => {
      result.current.makeMove(2, 3);
    });
    
    // 履歴を戻す
    act(() => {
      result.current.undoMove();
    });
    
    expect(result.current.currentHistoryIndex).toBe(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
    expect(result.current.gameState.currentPlayer).toBe('BLACK');
    expect(result.current.gameState.scores.BLACK).toBe(2);
    expect(result.current.gameState.scores.WHITE).toBe(2);
  });

  it('履歴を進めることができる', () => {
    const { result } = renderHook(() => useReversi());
    
    // 手を打つ
    act(() => {
      result.current.makeMove(2, 3);
    });
    
    // 履歴を戻す
    act(() => {
      result.current.undoMove();
    });
    
    // 履歴を進める
    act(() => {
      result.current.redoMove();
    });
    
    expect(result.current.currentHistoryIndex).toBe(1);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.gameState.currentPlayer).toBe('WHITE');
    expect(result.current.gameState.scores.BLACK).toBe(4);
  });

  it('特定の履歴位置にジャンプできる', () => {
    const { result } = renderHook(() => useReversi());
    
    // 複数手を打つ
    act(() => {
      result.current.makeMove(2, 3); // 1手目
    });
    act(() => {
      result.current.makeMove(2, 2); // 2手目
    });
    act(() => {
      result.current.makeMove(2, 4); // 3手目
    });
    
    expect(result.current.gameHistory.length).toBe(4);
    expect(result.current.currentHistoryIndex).toBe(3);
    
    // 最初に戻る
    act(() => {
      result.current.goToHistoryIndex(0);
    });
    
    expect(result.current.currentHistoryIndex).toBe(0);
    expect(result.current.gameState.currentPlayer).toBe('BLACK');
    expect(result.current.gameState.scores.BLACK).toBe(2);
    expect(result.current.gameState.scores.WHITE).toBe(2);
    
    // 2手目に移動
    act(() => {
      result.current.goToHistoryIndex(2);
    });
    
    expect(result.current.currentHistoryIndex).toBe(2);
    expect(result.current.gameState.currentPlayer).toBe('BLACK');
  });

  it('ゲームをリセットすると履歴もリセットされる', () => {
    const { result } = renderHook(() => useReversi());
    
    // 手を打つ
    act(() => {
      result.current.makeMove(2, 3);
    });
    
    expect(result.current.gameHistory.length).toBe(2);
    
    // リセット
    act(() => {
      result.current.resetGame();
    });
    
    expect(result.current.gameHistory.length).toBe(1);
    expect(result.current.currentHistoryIndex).toBe(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.gameState.currentPlayer).toBe('BLACK');
    expect(result.current.gameState.scores.BLACK).toBe(2);
    expect(result.current.gameState.scores.WHITE).toBe(2);
  });

  it('「おしえて！」機能が正しく動作する', () => {
    const { result } = renderHook(() => useReversi());

    // 初期状態は false
    expect(result.current.gameState.hintsEnabled).toBe(false);
    
    // ヒントを true に切り替え
    act(() => {
      result.current.setHints(true);
    });
    expect(result.current.gameState.hintsEnabled).toBe(true);
    
    // ヒントを false に戻す
    act(() => {
      result.current.setHints(false);
    });
    expect(result.current.gameState.hintsEnabled).toBe(false);
  });

  it('「おしえて！」モードで2回タップが必要', async () => {
    const { result } = renderHook(() => useReversi());
    
    // 「おしえて！」モードを有効にする
    act(() => {
      result.current.setHints(true);
    });
    
    // 1回目のタップ（セル選択）
    act(() => {
      result.current.makeMove(2, 3);
    });
    
    await waitFor(() => {
      expect(result.current.gameState.selectedHintCell).toEqual([2, 3]);
    });

    expect(result.current.gameHistory.length).toBe(1); // まだ手は打たれていない
    expect(result.current.gameState.currentPlayer).toBe('BLACK');
    
    // 2回目のタップ（実際の移動）
    act(() => {
      result.current.makeMove(2, 3);
    });
    
    await waitFor(() => {
      expect(result.current.gameState.selectedHintCell).toBeNull();
    });
    expect(result.current.gameHistory.length).toBe(2); // 手が打たれた
    expect(result.current.gameState.currentPlayer).toBe('WHITE');
  });
});
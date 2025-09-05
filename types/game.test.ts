import { describe, it, expect } from 'vitest';
import {
  Position,
  HintOverlayData,
  HintState,
  HintableGameState,
  HintableGameController,
  BaseGameState,
  BaseGameController,
  GameController,
} from './game';

type DummyAction = { type: 'DUMMY' };

describe('ヒント機能の型定義', () => {
  it('Position型が正しく定義されている', () => {
    const position: Position = { row: 1, col: 2 };
    expect(position.row).toBe(1);
    expect(position.col).toBe(2);
  });

  it('HintOverlayData型が正しく定義されている', () => {
    const hintData: HintOverlayData = {
      position: { row: 0, col: 0 },
      type: 'valid_move',
      content: '3',
      style: 'highlight'
    };
    expect(hintData.position.row).toBe(0);
    expect(hintData.type).toBe('valid_move');
    expect(hintData.content).toBe('3');
    expect(hintData.style).toBe('highlight');
  });

  it('HintState型が正しく定義されている', () => {
    const hintState: HintState = {
      enabled: true,
      highlightedCells: [{ row: 1, col: 1 }],
      overlayData: [{
        position: { row: 2, col: 2 },
        type: 'capturable',
        content: 5,
        style: 'warning'
      }],
      selectedCell: { row: 3, col: 3 }
    };
    expect(hintState.enabled).toBe(true);
    expect(hintState.highlightedCells).toHaveLength(1);
    expect(hintState.overlayData).toHaveLength(1);
    expect(hintState.selectedCell?.row).toBe(3);
  });

  it('HintableGameState型が正しく定義されている', () => {
    const gameState: HintableGameState = {
      status: 'playing',
      currentPlayer: 'player1',
      winner: null,
      hints: {
        enabled: true,
        highlightedCells: []
      }
    };
    expect(gameState.status).toBe('playing');
    expect(gameState.hints.enabled).toBe(true);
  });

  it('HintableGameController型が正しく定義されている', () => {
    // モックのコントローラーを作成
    const mockController: HintableGameController<HintableGameState, DummyAction> = {
      gameState: {
        status: 'playing',
        currentPlayer: 'player1',
        winner: null,
        hints: { enabled: false }
      },
      dispatch: () => {},
      resetGame: () => {},
      getDisplayStatus: () => 'dummy status',
      setHints: () => {},
      hintState: { enabled: false },
      clearHints: () => {}
    };

    expect(mockController.gameState.status).toBe('playing');
    expect(mockController.hintState.enabled).toBe(false);
    expect(typeof mockController.setHints).toBe('function');
    expect(typeof mockController.clearHints).toBe('function');
  });

  it('GameController型の型ガードが正しく動作する', () => {
    // ベースコントローラー
    const baseController: BaseGameController<BaseGameState, DummyAction> = {
      gameState: { status: 'waiting', currentPlayer: null, winner: null },
      dispatch: () => {},
      resetGame: () => {},
      getDisplayStatus: () => 'dummy status'
    };

    // ヒント機能付きコントローラー
    const hintController: HintableGameController<HintableGameState, DummyAction> = {
      gameState: {
        status: 'playing',
        currentPlayer: 'player1',
        winner: null,
        hints: { enabled: true }
      },
      dispatch: () => {},
      resetGame: () => {},
      getDisplayStatus: () => 'dummy status',
      setHints: () => {},
      hintState: { enabled: true }
    };

    // GameController型として扱える
    const controllers: GameController<BaseGameState, DummyAction>[] = [baseController, hintController];
    expect(controllers).toHaveLength(2);
  });
});
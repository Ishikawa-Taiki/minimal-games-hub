import { describe, it, expect } from 'vitest';
import {
  HintLevel,
  Position,
  HintOverlayData,
  HintState,
  HintableGameState,
  HintableGameController,
  BaseGameState,
  BaseGameController,
  GameController,
} from './game';

describe('ヒント機能の型定義', () => {
  it('HintLevel型が正しく定義されている', () => {
    const levels: HintLevel[] = ['off', 'basic', 'advanced'];
    expect(levels).toHaveLength(3);
  });

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
      level: 'basic',
      highlightedCells: [{ row: 1, col: 1 }],
      overlayData: [{
        position: { row: 2, col: 2 },
        type: 'capturable',
        content: 5,
        style: 'warning'
      }],
      selectedCell: { row: 3, col: 3 }
    };
    expect(hintState.level).toBe('basic');
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
        level: 'advanced',
        highlightedCells: []
      }
    };
    expect(gameState.status).toBe('playing');
    expect(gameState.hints.level).toBe('advanced');
  });

  it('HintableGameController型が正しく定義されている', () => {
    // モックのコントローラーを作成
    const mockController: HintableGameController<HintableGameState, any> = {
      gameState: {
        status: 'playing',
        currentPlayer: 'player1',
        winner: null,
        hints: { level: 'off' }
      },
      dispatch: () => {},
      resetGame: () => {},
      getDisplayStatus: () => 'dummy status',
      toggleHints: () => {},
      hintState: { level: 'off' },
      clearHints: () => {}
    };

    expect(mockController.gameState.status).toBe('playing');
    expect(mockController.hintState.level).toBe('off');
    expect(typeof mockController.toggleHints).toBe('function');
    expect(typeof mockController.clearHints).toBe('function');
  });

  it('GameController型の型ガードが正しく動作する', () => {
    // ベースコントローラー
    const baseController: BaseGameController<BaseGameState, any> = {
      gameState: { status: 'waiting', currentPlayer: null, winner: null },
      dispatch: () => {},
      resetGame: () => {},
      getDisplayStatus: () => 'dummy status'
    };

    // ヒント機能付きコントローラー
    const hintController: HintableGameController<HintableGameState, any> = {
      gameState: {
        status: 'playing',
        currentPlayer: 'player1',
        winner: null,
        hints: { level: 'basic' }
      },
      dispatch: () => {},
      resetGame: () => {},
      getDisplayStatus: () => 'dummy status',
      toggleHints: () => {},
      hintState: { level: 'basic' }
    };

    // GameController型として扱える
    const controllers: GameController<any, any>[] = [baseController, hintController];
    expect(controllers).toHaveLength(2);
  });
});
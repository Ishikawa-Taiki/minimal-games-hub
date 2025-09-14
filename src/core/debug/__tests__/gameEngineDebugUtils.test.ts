import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameEngine } from '../../hooks/useGameEngine';
import { GameEngineDebugUtils } from '../gameEngineDebugUtils';

// テスト用の状態とアクションの定義
interface TestState {
  count: number;
  message: string;
  isValid: boolean;
}

type TestAction =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET_MESSAGE'; message: string }
  | { type: 'TOGGLE_VALID' }
  | { type: 'INVALID_ACTION' }; // 無効なアクション（状態を変更しない）

// テスト用のreducer
const testReducer = (state: TestState, action: TestAction): TestState => {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    case 'SET_MESSAGE':
      return { ...state, message: action.message };
    case 'TOGGLE_VALID':
      return { ...state, isValid: !state.isValid };
    case 'INVALID_ACTION':
      // 意図的に状態を変更しない（無効なアクションをシミュレート）
      return state;
    default:
      return state;
  }
};

const initialState: TestState = {
  count: 0,
  message: 'initial',
  isValid: true,
};

describe('GameEngineDebugUtils', () => {
  let debugUtils: GameEngineDebugUtils<TestState, TestAction>;
  let gameEngine: ReturnType<typeof useGameEngine<TestState, TestAction>>;

  beforeEach(() => {
    const { result } = renderHook(() => 
      useGameEngine(testReducer, initialState)
    );
    gameEngine = result.current;
    debugUtils = new GameEngineDebugUtils(gameEngine);
  });

  describe('computeStateFromActions', () => {
    it('should compute state from empty action array', () => {
      const result = debugUtils.computeStateFromActions([]);
      expect(result).toEqual(initialState);
    });

    it('should compute state from action sequence', () => {
      const actions: TestAction[] = [
        { type: 'INCREMENT' },
        { type: 'SET_MESSAGE', message: 'test' },
        { type: 'INCREMENT' },
      ];

      const result = debugUtils.computeStateFromActions(actions);
      
      expect(result).toEqual({
        count: 2,
        message: 'test',
        isValid: true,
      });
    });

    it('should handle complex action sequences', () => {
      const actions: TestAction[] = [
        { type: 'INCREMENT' },
        { type: 'INCREMENT' },
        { type: 'DECREMENT' },
        { type: 'TOGGLE_VALID' },
        { type: 'SET_MESSAGE', message: 'complex' },
      ];

      const result = debugUtils.computeStateFromActions(actions);
      
      expect(result).toEqual({
        count: 1,
        message: 'complex',
        isValid: false,
      });
    });
  });

  describe('computeStateAtIndex', () => {
    it('should compute state at index 0 (initial state)', () => {
      const { result } = renderHook(() => 
        useGameEngine(testReducer, initialState)
      );
      
      act(() => {
        result.current.dispatch({ type: 'INCREMENT' });
        result.current.dispatch({ type: 'SET_MESSAGE', message: 'step1' });
        result.current.dispatch({ type: 'INCREMENT' });
      });
      
      const testDebugUtils = new GameEngineDebugUtils(result.current);
      const stateResult = testDebugUtils.computeStateAtIndex(0);
      expect(stateResult).toEqual(initialState);
    });

    it('should compute state at specific index', () => {
      const { result } = renderHook(() => 
        useGameEngine(testReducer, initialState)
      );
      
      act(() => {
        result.current.dispatch({ type: 'INCREMENT' });
        result.current.dispatch({ type: 'SET_MESSAGE', message: 'step1' });
        result.current.dispatch({ type: 'INCREMENT' });
      });
      
      const testDebugUtils = new GameEngineDebugUtils(result.current);
      expect(result.current.actions).toHaveLength(3); // アクションが追加されていることを確認
      const stateResult = testDebugUtils.computeStateAtIndex(1);
      expect(stateResult).toEqual({
        count: 1,
        message: 'initial',
        isValid: true,
      });
    });

    it('should compute state at final index', () => {
      const { result } = renderHook(() => 
        useGameEngine(testReducer, initialState)
      );
      
      act(() => {
        result.current.dispatch({ type: 'INCREMENT' });
        result.current.dispatch({ type: 'SET_MESSAGE', message: 'step1' });
        result.current.dispatch({ type: 'INCREMENT' });
      });
      
      const testDebugUtils = new GameEngineDebugUtils(result.current);
      expect(result.current.actions).toHaveLength(3); // アクションが追加されていることを確認
      const stateResult = testDebugUtils.computeStateAtIndex(3);
      expect(stateResult).toEqual({
        count: 2,
        message: 'step1',
        isValid: true,
      });
    });

    it('should throw error for invalid index', () => {
      const { result } = renderHook(() => 
        useGameEngine(testReducer, initialState)
      );
      
      act(() => {
        result.current.dispatch({ type: 'INCREMENT' });
        result.current.dispatch({ type: 'SET_MESSAGE', message: 'step1' });
        result.current.dispatch({ type: 'INCREMENT' });
      });
      
      const testDebugUtils = new GameEngineDebugUtils(result.current);
      const actionsLength = result.current.actions.length;
      expect(() => testDebugUtils.computeStateAtIndex(-1)).toThrow('Invalid index: -1');
      expect(() => testDebugUtils.computeStateAtIndex(actionsLength + 1)).toThrow(`Invalid index: ${actionsLength + 1}`);
    });
  });

  describe('validateActionSequence', () => {
    it('should validate empty action sequence', () => {
      const result = debugUtils.validateActionSequence([]);
      
      expect(result.isValid).toBe(true);
      expect(result.finalState).toEqual(initialState);
      expect(result.errorIndex).toBeUndefined();
      expect(result.errorMessage).toBeUndefined();
    });

    it('should validate valid action sequence', () => {
      const actions: TestAction[] = [
        { type: 'INCREMENT' },
        { type: 'SET_MESSAGE', message: 'valid' },
        { type: 'TOGGLE_VALID' },
      ];

      const result = debugUtils.validateActionSequence(actions);
      
      expect(result.isValid).toBe(true);
      expect(result.finalState).toEqual({
        count: 1,
        message: 'valid',
        isValid: false,
      });
    });

    it('should detect invalid action in sequence', () => {
      const actions: TestAction[] = [
        { type: 'INCREMENT' },
        { type: 'INVALID_ACTION' }, // この無効なアクションが検出されるべき
        { type: 'INCREMENT' },
      ];

      const result = debugUtils.validateActionSequence(actions);
      
      expect(result.isValid).toBe(false);
      expect(result.errorIndex).toBe(1);
      expect(result.errorMessage).toContain('Action at index 1 did not change state');
    });

    it('should handle reducer errors', () => {
      // エラーを投げるreducerを使用
      const errorReducer = (state: TestState, action: TestAction): TestState => {
        if (action.type === 'INCREMENT') {
          throw new Error('Test error');
        }
        return testReducer(state, action);
      };

      const { result } = renderHook(() => 
        useGameEngine(errorReducer, initialState)
      );
      const errorDebugUtils = new GameEngineDebugUtils(result.current);

      const actions: TestAction[] = [{ type: 'INCREMENT' }];
      const validationResult = errorDebugUtils.validateActionSequence(actions);
      
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errorMessage).toBe('Test error');
    });
  });

  describe('analyzeStateDiff', () => {
    it('should detect no changes between identical states', () => {
      const stateA = { count: 1, message: 'test', isValid: true };
      const stateB = { count: 1, message: 'test', isValid: true };

      const result = debugUtils.analyzeStateDiff(stateA, stateB);
      
      expect(result.hasChanges).toBe(false);
      expect(result.changedFields).toEqual([]);
      expect(result.summary).toBe('No changes detected');
    });

    it('should detect single field change', () => {
      const stateA = { count: 1, message: 'test', isValid: true };
      const stateB = { count: 2, message: 'test', isValid: true };

      const result = debugUtils.analyzeStateDiff(stateA, stateB);
      
      expect(result.hasChanges).toBe(true);
      expect(result.changedFields).toEqual(['count']);
      expect(result.summary).toBe('Changed fields: count');
    });

    it('should detect multiple field changes', () => {
      const stateA = { count: 1, message: 'test', isValid: true };
      const stateB = { count: 2, message: 'changed', isValid: false };

      const result = debugUtils.analyzeStateDiff(stateA, stateB);
      
      expect(result.hasChanges).toBe(true);
      expect(result.changedFields).toContain('count');
      expect(result.changedFields).toContain('message');
      expect(result.changedFields).toContain('isValid');
      expect(result.summary).toContain('Changed fields:');
    });
  });

  describe('getEngineInfo', () => {
    it('should return correct engine info for empty state', () => {
      const info = debugUtils.getEngineInfo();
      
      expect(info.actionsCount).toBe(0);
      expect(info.currentState).toEqual(initialState);
      expect(info.initialState).toEqual(initialState);
      expect(info.actionHistory).toEqual([]);
    });

    it('should return correct engine info after actions', () => {
      const { result } = renderHook(() => 
        useGameEngine(testReducer, initialState)
      );
      
      act(() => {
        result.current.dispatch({ type: 'INCREMENT' });
        result.current.dispatch({ type: 'SET_MESSAGE', message: 'info' });
      });

      const testDebugUtils = new GameEngineDebugUtils(result.current);
      const info = testDebugUtils.getEngineInfo();
      
      expect(info.actionsCount).toBe(2);
      expect(info.currentState).toEqual({
        count: 1,
        message: 'info',
        isValid: true,
      });
      expect(info.initialState).toEqual(initialState);
      expect(info.actionHistory).toEqual([
        { type: 'INCREMENT' },
        { type: 'SET_MESSAGE', message: 'info' },
      ]);
    });

    it('should return independent copy of action history', () => {
      const { result } = renderHook(() => 
        useGameEngine(testReducer, initialState)
      );
      
      act(() => {
        result.current.dispatch({ type: 'INCREMENT' });
      });

      const testDebugUtils = new GameEngineDebugUtils(result.current);
      const info = testDebugUtils.getEngineInfo();
      
      // 返された配列を変更しても元の履歴に影響しないことを確認
      info.actionHistory.push({ type: 'DECREMENT' });
      
      const info2 = testDebugUtils.getEngineInfo();
      expect(info2.actionHistory).toHaveLength(1);
      expect(info2.actionHistory).toEqual([{ type: 'INCREMENT' }]);
    });
  });
});
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameEngine } from '../useGameEngine';

// テスト用の簡単な状態とアクションの定義
interface TestState {
  count: number;
  message: string;
}

type TestAction =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET_MESSAGE'; message: string }
  | { type: 'RESET' };

// テスト用のreducer
const testReducer = (state: TestState, action: TestAction): TestState => {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    case 'SET_MESSAGE':
      return { ...state, message: action.message };
    case 'RESET':
      return { count: 0, message: 'reset' };
    default:
      return state;
  }
};

const initialState: TestState = {
  count: 0,
  message: 'initial',
};

describe('useGameEngine', () => {
  it('should initialize with initial state', () => {
    const { result } = renderHook(() => 
      useGameEngine(testReducer, initialState)
    );

    expect(result.current.gameState).toEqual(initialState);
    expect(result.current.actions).toEqual([]);
    expect(result.current.initialState).toEqual(initialState);
    expect(result.current.reducer).toBe(testReducer);
  });

  it('should compute state from actions', () => {
    const { result } = renderHook(() => 
      useGameEngine(testReducer, initialState)
    );

    act(() => {
      result.current.dispatch({ type: 'INCREMENT' });
    });

    expect(result.current.gameState.count).toBe(1);
    expect(result.current.actions).toEqual([{ type: 'INCREMENT' }]);

    act(() => {
      result.current.dispatch({ type: 'INCREMENT' });
    });

    expect(result.current.gameState.count).toBe(2);
    expect(result.current.actions).toEqual([
      { type: 'INCREMENT' },
      { type: 'INCREMENT' }
    ]);
  });

  it('should handle multiple action types', () => {
    const { result } = renderHook(() => 
      useGameEngine(testReducer, initialState)
    );

    act(() => {
      result.current.dispatch({ type: 'INCREMENT' });
      result.current.dispatch({ type: 'SET_MESSAGE', message: 'hello' });
      result.current.dispatch({ type: 'DECREMENT' });
    });

    expect(result.current.gameState).toEqual({
      count: 0,
      message: 'hello',
    });
    expect(result.current.actions).toHaveLength(3);
  });

  it('should reset to initial state', () => {
    const { result } = renderHook(() => 
      useGameEngine(testReducer, initialState)
    );

    // 状態を変更
    act(() => {
      result.current.dispatch({ type: 'INCREMENT' });
      result.current.dispatch({ type: 'SET_MESSAGE', message: 'changed' });
    });

    expect(result.current.gameState.count).toBe(1);
    expect(result.current.gameState.message).toBe('changed');

    // リセット
    act(() => {
      result.current.reset();
    });

    expect(result.current.gameState).toEqual(initialState);
    expect(result.current.actions).toEqual([]);
  });

  it('should maintain referential stability of functions', () => {
    const { result, rerender } = renderHook(() => 
      useGameEngine(testReducer, initialState)
    );

    const firstDispatch = result.current.dispatch;
    const firstReset = result.current.reset;

    rerender();

    expect(result.current.dispatch).toBe(firstDispatch);
    expect(result.current.reset).toBe(firstReset);
  });

  it('should provide readonly access to actions and initial state', () => {
    const { result } = renderHook(() => 
      useGameEngine(testReducer, initialState)
    );

    act(() => {
      result.current.dispatch({ type: 'INCREMENT' });
    });

    // actions配列は読み取り専用であることを確認
    // TypeScriptの型システムで読み取り専用が保証されているため、
    // 実際の配列操作は可能だが、型レベルで制限されている
    expect(result.current.actions).toHaveLength(1);

    // initialStateは変更されないことを確認
    expect(result.current.initialState).toEqual(initialState);
    expect(result.current.initialState).not.toBe(result.current.gameState);
  });

  it('should handle complex action sequences correctly', () => {
    const { result } = renderHook(() => 
      useGameEngine(testReducer, initialState)
    );

    const actions: TestAction[] = [
      { type: 'INCREMENT' },
      { type: 'INCREMENT' },
      { type: 'SET_MESSAGE', message: 'test' },
      { type: 'DECREMENT' },
      { type: 'INCREMENT' },
    ];

    act(() => {
      actions.forEach(action => result.current.dispatch(action));
    });

    // 最終状態を手動で計算して確認
    const expectedState = actions.reduce(testReducer, initialState);
    expect(result.current.gameState).toEqual(expectedState);
    expect(result.current.actions).toEqual(actions);
  });

  it('should recompute state when reducer changes', () => {
    const alternativeReducer = (state: TestState, action: TestAction): TestState => {
      switch (action.type) {
        case 'INCREMENT':
          return { ...state, count: state.count + 2 }; // 2倍の増加
        default:
          return testReducer(state, action);
      }
    };

    const { result, rerender } = renderHook(
      ({ reducer }) => useGameEngine(reducer, initialState),
      { initialProps: { reducer: testReducer } }
    );

    act(() => {
      result.current.dispatch({ type: 'INCREMENT' });
    });

    expect(result.current.gameState.count).toBe(1);

    // reducerを変更
    rerender({ reducer: alternativeReducer });

    // 同じアクションでも異なる結果になることを確認
    expect(result.current.gameState.count).toBe(2);
  });
});
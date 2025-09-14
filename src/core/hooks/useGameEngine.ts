import { useState, useCallback, useMemo } from 'react';

/**
 * ゲームエンジンが返すコントローラーオブジェクトのインターフェース
 */
export interface GameEngine<TState, TAction> {
  /** 現在のゲーム状態（アクション列から計算される） */
  gameState: TState;
  /** アクションを実行する関数 */
  dispatch: (action: TAction) => void;
  /** ゲームを初期状態にリセットする関数 */
  reset: () => void;
  /** 実行されたアクションの履歴（読み取り専用） */
  readonly actions: readonly TAction[];
  /** 初期状態（読み取り専用） */
  readonly initialState: TState;
  /** 使用されているreducer関数（読み取り専用） */
  readonly reducer: (state: TState, action: TAction) => TState;
}

/**
 * 汎用ゲームエンジンフック
 * 
 * 「初期状態 + アクション列の合成」による状態管理を提供する。
 * 状態はメモリ効率の良いアクション配列として保持し、
 * 現在の状態は都度計算することで導出する。
 * 
 * @param reducer - 状態遷移を定義する純粋関数
 * @param initialState - ゲームの初期状態
 * @returns GameEngine インターフェースを実装したコントローラー
 */
export function useGameEngine<TState, TAction>(
  reducer: (state: TState, action: TAction) => TState,
  initialState: TState
): GameEngine<TState, TAction> {
  // アクション履歴を状態として保持
  const [actions, setActions] = useState<TAction[]>([]);

  // 現在の状態をアクション列から計算
  const gameState = useMemo(() => {
    return actions.reduce(reducer, initialState);
  }, [actions, reducer, initialState]);

  // アクションを実行する関数
  const dispatch = useCallback((action: TAction) => {
    setActions(prevActions => [...prevActions, action]);
  }, []);

  // ゲームをリセットする関数
  const reset = useCallback(() => {
    setActions([]);
  }, []);

  return {
    gameState,
    dispatch,
    reset,
    actions,
    initialState,
    reducer,
  };
}
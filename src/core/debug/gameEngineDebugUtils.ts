import { GameEngine } from '../hooks/useGameEngine';

/**
 * ゲームエンジンのデバッグユーティリティクラス
 * 
 * アクション列の検証、状態の再現、差分分析などの
 * デバッグ機能を提供する。
 */
export class GameEngineDebugUtils<TState, TAction> {
  constructor(
    private engine: GameEngine<TState, TAction>
  ) {}

  /**
   * 指定されたアクション列から状態を計算する
   * 
   * @param actions - 実行するアクション列
   * @returns 計算された状態
   */
  computeStateFromActions(actions: TAction[]): TState {
    return actions.reduce(this.engine.reducer, this.engine.initialState);
  }

  /**
   * 指定されたインデックス時点での状態を計算する
   * 
   * @param index - アクション履歴のインデックス（0から開始）
   * @returns 指定時点での状態
   */
  computeStateAtIndex(index: number): TState {
    if (index < 0 || index > this.engine.actions.length) {
      throw new Error(`Invalid index: ${index}. Valid range: 0-${this.engine.actions.length}`);
    }
    
    const actionsUpToIndex = this.engine.actions.slice(0, index);
    return this.computeStateFromActions(actionsUpToIndex);
  }

  /**
   * アクション列の妥当性を検証する
   * 
   * @param actions - 検証するアクション列
   * @returns 検証結果オブジェクト
   */
  validateActionSequence(actions: TAction[]): {
    isValid: boolean;
    errorIndex?: number;
    errorMessage?: string;
    finalState?: TState;
  } {
    try {
      let currentState = this.engine.initialState;
      
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        const newState = this.engine.reducer(currentState, action);
        
        // reducer が同じ状態を返した場合は無効なアクションとみなす
        // （ゲームによってはこの判定ロジックを調整する必要がある）
        if (newState === currentState && this.isStateChangeExpected()) {
          return {
            isValid: false,
            errorIndex: i,
            errorMessage: `Action at index ${i} did not change state: ${JSON.stringify(action)}`,
          };
        }
        
        currentState = newState;
      }
      
      return {
        isValid: true,
        finalState: currentState,
      };
    } catch (error) {
      return {
        isValid: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 2つの状態の差分を分析する
   * 
   * @param stateA - 比較元の状態
   * @param stateB - 比較先の状態
   * @returns 差分分析結果
   */
  analyzeStateDiff(stateA: TState, stateB: TState): {
    hasChanges: boolean;
    changedFields: string[];
    summary: string;
  } {
    const changedFields: string[] = [];
    
    // 簡単な差分検出（深い比較は行わない）
    const keysA = Object.keys(stateA as Record<string, unknown>);
    const keysB = Object.keys(stateB as Record<string, unknown>);
    
    // 新しいフィールドまたは削除されたフィールドをチェック
    const allKeys = new Set([...keysA, ...keysB]);
    
    for (const key of allKeys) {
      const valueA = (stateA as Record<string, unknown>)[key];
      const valueB = (stateB as Record<string, unknown>)[key];
      
      if (JSON.stringify(valueA) !== JSON.stringify(valueB)) {
        changedFields.push(key);
      }
    }
    
    const hasChanges = changedFields.length > 0;
    const summary = hasChanges 
      ? `Changed fields: ${changedFields.join(', ')}`
      : 'No changes detected';
    
    return {
      hasChanges,
      changedFields,
      summary,
    };
  }

  /**
   * 現在のエンジン状態の詳細情報を取得する
   * 
   * @returns デバッグ情報オブジェクト
   */
  getEngineInfo(): {
    actionsCount: number;
    currentState: TState;
    initialState: TState;
    actionHistory: TAction[];
  } {
    return {
      actionsCount: this.engine.actions.length,
      currentState: this.engine.gameState,
      initialState: this.engine.initialState,
      actionHistory: [...this.engine.actions],
    };
  }

  /**
   * アクションが状態変化を期待されるかどうかを判定する
   * 
   * この実装はシンプルな判定を行うが、
   * 各ゲーム固有のロジックに応じてオーバーライドできる。
   * 
   * @returns 状態変化が期待される場合はtrue
   */
  private isStateChangeExpected(): boolean {
    // デフォルトでは、すべてのアクションが状態変化を期待されるとみなす
    // 各ゲーム固有の判定が必要な場合は、この関数を拡張する
    return true;
  }
}
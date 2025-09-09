import { useEffect, useRef } from 'react';
import { BaseGameState } from '../types/game';

interface LogEntry {
  timestamp: number;
  component: string;
  event: string;
  data: unknown;
  stackTrace?: string;
}

class GameStateLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  log(component: string, event: string, data: unknown) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      component,
      event,
      data: JSON.parse(JSON.stringify(data)), // Deep clone to avoid reference issues
      stackTrace: new Error().stack
    };
    
    this.logs.push(entry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    
    // Console output for development
    console.log(`[GameStateLogger] ${component}:${event}`, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsForComponent(component: string): LogEntry[] {
    return this.logs.filter(log => log.component === component);
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Singleton instance
const gameStateLogger = new GameStateLogger();

// React hook for logging game state changes
export function useGameStateLogger(
  component: string,
  gameState: BaseGameState | Record<string, unknown>,
  additionalData?: unknown
) {
  const prevStateRef = useRef<unknown>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      gameStateLogger.log(component, 'COMPONENT_MOUNTED', {
        initialState: gameState,
        additionalData
      });
      mountedRef.current = true;
    }

    // Log state changes
    if (prevStateRef.current && JSON.stringify(prevStateRef.current) !== JSON.stringify(gameState)) {
      gameStateLogger.log(component, 'STATE_CHANGED', {
        previousState: prevStateRef.current,
        currentState: gameState,
        additionalData
      });
    }

    prevStateRef.current = JSON.parse(JSON.stringify(gameState));
  }, [component, gameState, additionalData]);

  useEffect(() => {
    return () => {
      gameStateLogger.log(component, 'COMPONENT_UNMOUNTED', {
        finalState: gameState,
        additionalData
      });
    };
  }, [component, gameState, additionalData]);

  return {
    log: (event: string, data: unknown) => gameStateLogger.log(component, event, data),
    getLogs: () => gameStateLogger.getLogs(),
    getComponentLogs: () => gameStateLogger.getLogsForComponent(component),
    clearLogs: () => gameStateLogger.clearLogs(),
    exportLogs: () => gameStateLogger.exportLogs()
  };
}

// Hook for manual logging
export function useGameLogger(component: string) {
  return {
    log: (event: string, data: unknown) => gameStateLogger.log(component, event, data),
    getLogs: () => gameStateLogger.getLogs(),
    getComponentLogs: () => gameStateLogger.getLogsForComponent(component),
    clearLogs: () => gameStateLogger.clearLogs(),
    exportLogs: () => gameStateLogger.exportLogs()
  };
}

export { gameStateLogger };
'use client';

import React, { useState, useEffect } from 'react';
import { useGameLogger } from '@/core/hooks/useGameStateLogger';

interface GameStateDebuggerProps {
  isVisible?: boolean;
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
}

const GameStateDebugger: React.FC<GameStateDebuggerProps> = ({
  isVisible = false,
  position = 'bottom-right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const logger = useGameLogger('GameStateDebugger');
  const [logs, setLogs] = useState(logger.getLogs());
  const [copyButtonText, setCopyButtonText] = useState('コピー');

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLogs(logger.getLogs());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, logger]);

  const handleRefresh = () => {
    setLogs(logger.getLogs());
  };

  const handleClear = () => {
    logger.clearLogs();
    setLogs([]);
  };

  const handleExport = () => {
    const logsJson = logger.exportLogs();
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-state-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const logsJson = logger.exportLogs();
    navigator.clipboard.writeText(logsJson).then(() => {
      setCopyButtonText('コピーしました!');
      setTimeout(() => setCopyButtonText('コピー'), 2000);
    }, () => {
      setCopyButtonText('失敗');
      setTimeout(() => setCopyButtonText('コピー'), 2000);
    });
  };

  if (!isVisible) return null;

  const positionStyles = {
    'top-right': { top: '10px', right: '10px' },
    'bottom-right': { bottom: '10px', right: '10px' },
    'bottom-left': { bottom: '10px', left: '10px' },
    'top-left': { top: '10px', left: '10px' }
  };

  const debuggerStyle: React.CSSProperties = {
    position: 'fixed',
    ...positionStyles[position],
    zIndex: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    color: 'white',
    borderRadius: '8px',
    padding: '10px',
    fontFamily: 'monospace',
    fontSize: '12px',
    maxWidth: '400px',
    maxHeight: '500px',
    overflow: 'hidden',
    border: '1px solid #333'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    borderBottom: '1px solid #333',
    paddingBottom: '5px'
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#333',
    color: 'white',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '10px',
    margin: '0 2px'
  };

  const logContainerStyle: React.CSSProperties = {
    maxHeight: '350px',
    overflowY: 'auto',
    border: '1px solid #333',
    padding: '5px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  };

  const logEntryStyle: React.CSSProperties = {
    marginBottom: '8px',
    padding: '4px',
    borderLeft: '2px solid #666',
    paddingLeft: '8px'
  };

  return (
    <div style={debuggerStyle} data-testid="game-debugger">
      <div style={headerStyle}>
        <span>🐛 Game State Debugger</span>
        <button
          style={buttonStyle}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? '−' : '+'}
        </button>
      </div>
      
      {isOpen && (
        <>
          <div style={{ marginBottom: '10px' }}>
            <button style={buttonStyle} onClick={handleRefresh}>
              更新
            </button>
            <button style={buttonStyle} onClick={handleClear}>
              クリア
            </button>
            <button style={buttonStyle} onClick={handleExport}>
              エクスポート
            </button>
            <button style={buttonStyle} onClick={handleCopy}>
              {copyButtonText}
            </button>
            <label style={{ marginLeft: '10px', fontSize: '10px' }}>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                style={{ marginRight: '4px' }}
              />
              自動更新
            </label>
          </div>
          
          <div style={logContainerStyle}>
            {logs.length === 0 ? (
              <div style={{ color: '#666' }}>ログがありません</div>
            ) : (
              logs.slice(-20).reverse().map((log, index) => (
                <div key={index} style={logEntryStyle}>
                  <div style={{ color: '#4CAF50', fontSize: '10px' }}>
                    {new Date(log.timestamp).toLocaleTimeString()} - {log.component}:{log.event}
                  </div>
                  <div style={{ color: '#FFF', fontSize: '10px', marginTop: '2px' }}>
                    {JSON.stringify(log.data, null, 1).substring(0, 200)}
                    {JSON.stringify(log.data).length > 200 && '...'}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GameStateDebugger;
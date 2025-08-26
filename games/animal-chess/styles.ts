import StyleSheet from '../../app/styles/StyleSheet';
import { CSSProperties } from 'react';
import { BOARD_COLS } from './core';

export const styles: { [key: string]: CSSProperties } = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '2rem',
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: '2.25rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
  },
  board: {
    display: 'grid',
    gridTemplateColumns: `repeat(${BOARD_COLS}, 1fr)`,
    gap: '4px',
    backgroundColor: '#4b5563',
    padding: '4px',
    borderRadius: '0.5rem',
  },
  cell: {
    width: 'clamp(70px, 18vw, 120px)',
    height: 'clamp(70px, 18vw, 120px)',
    backgroundColor: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.875rem',
    fontWeight: 'bold',
    borderRadius: '0.375rem',
    border: '1px solid #9ca3af',
    position: 'relative', // For move indicators
  },
  selectedCell: {
    backgroundColor: '#bfdbfe',
  },
  validMoveCell: {
    backgroundColor: '#dcfce7',
  },
  validDropCell: {
    backgroundColor: '#fef9c3',
  },
  capturableCell: {
    backgroundColor: '#fecaca', // Light red
  },
  threatenedCell: {
    // Using an inset box-shadow allows combining with other background colors
    boxShadow: 'inset 0 0 0 4px #d8b4fe', // Light purple
  },
  selectablePiece: {
    // A subtle white glow, using a lighter border
    outline: '2px solid rgba(255, 255, 255, 0.8)',
    outlineOffset: '-2px',
  },
  controls: {
    marginTop: '1rem',
    display: 'flex',
    gap: '1rem',
  },
  button: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '0.25rem',
    border: 'none',
    cursor: 'pointer',
  },
  statusText: {
    marginBottom: '1rem',
    fontSize: '1.25rem',
    fontWeight: 'bold',
  },
  capturedPiecesContainer: {
    display: 'flex',
    marginTop: '2rem',
    gap: '2rem',
  },
  capturedPiecesBox: {
    border: '1px solid #d1d5db',
    padding: '1rem',
    borderRadius: '0.5rem',
    backgroundColor: '#ffffff',
  },
  capturedPiecesTitle: {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  capturedPiecesList: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  capturedPiece: {
    width: 'clamp(50px, 12vw, 80px)',
    height: 'clamp(50px, 12vw, 80px)',
    padding: 0,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCapturedPiece: {
    backgroundColor: '#bfdbfe',
    boxShadow: '0 0 0 2px #3b82f6',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '0.5rem',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  modalText: {
    fontSize: '1.125rem',
    marginBottom: '1.5rem',
  },
  modalButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '0.25rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  // Move Indicators
  moveIndicator: {
    position: 'absolute',
    width: '14px',
    height: '14px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    pointerEvents: 'none',
  },
  indicatorN: {
    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
    top: '3px', left: '50%', transform: 'translateX(-50%)',
  },
  indicatorNE: {
    clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
    top: '3px', right: '3px',
  },
  indicatorE: {
    clipPath: 'polygon(100% 50%, 0 0, 0 100%)',
    top: '50%', right: '3px', transform: 'translateY(-50%)',
  },
  indicatorSE: {
    clipPath: 'polygon(100% 100%, 0 100%, 100% 0)',
    bottom: '3px', right: '3px',
  },
  indicatorS: {
    clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
    bottom: '3px', left: '50%', transform: 'translateX(-50%)',
  },
  indicatorSW: {
    clipPath: 'polygon(0 100%, 0 0, 100% 0)',
    bottom: '3px', left: '3px',
  },
  indicatorW: {
    clipPath: 'polygon(0 50%, 100% 100%, 100% 0)',
    top: '50%', left: '3px', transform: 'translateY(-50%)',
  },
  indicatorNW: {
    clipPath: 'polygon(0 0, 0 100%, 100% 100%)',
    top: '3px', left: '3px',
  },
});

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
    width: '80px',
    height: '80px',
    backgroundColor: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.875rem',
    fontWeight: 'bold',
    borderRadius: '0.375rem',
    border: '1px solid #9ca3af',
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
    marginTop: '1rem',
    fontSize: '1.125rem',
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
    fontSize: '1.5rem',
    padding: '0.25rem 0.5rem',
    backgroundColor: '#f3f4f6',
    borderRadius: '0.25rem',
    border: 'none',
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
});

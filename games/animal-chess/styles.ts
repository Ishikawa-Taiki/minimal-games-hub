import { CSSProperties } from 'react';
import { BOARD_ROWS, BOARD_COLS } from './core';

export const styles: { [key: string]: CSSProperties } = {
  gameContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: 'sans-serif',
  },
  board: {
    display: 'grid',
    gridTemplateRows: `repeat(${BOARD_ROWS}, 100px)`,
    border: '2px solid black',
    backgroundColor: '#f0d9b5',
    margin: '10px 0',
  },
  boardRow: {
    display: 'grid',
    gridTemplateColumns: `repeat(${BOARD_COLS}, 100px)`,
  },
  cell: {
    width: '100px',
    height: '100px',
    border: '1px solid #b58863',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  hintCell: {
    backgroundColor: 'rgba(0, 255, 0, 0.3)',
  },
  piece: {
    width: '90%',
    height: '90%',
  },
  selectedPiece: {
    backgroundColor: 'rgba(255, 255, 0, 0.5)',
    borderRadius: '10px',
  },
  captureArea: {
    width: `${BOARD_COLS * 100}px`,
    minHeight: '100px',
    padding: '5px',
    border: '2px solid #ccc',
    borderRadius: '5px',
    backgroundColor: '#eee',
  },
  captureBox: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
    height: '100%',
  },
  activePlayerArea: {
    borderColor: 'gold',
    boxShadow: '0 0 10px gold',
  },
  controls: {
    textAlign: 'center',
    marginTop: '10px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    margin: '5px',
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
    padding: '20px 40px',
    borderRadius: '10px',
    textAlign: 'center',
  },
};

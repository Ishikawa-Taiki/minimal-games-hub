import StyleSheet from '@/app/styles/StyleSheet';
import { CSSProperties } from 'react';

export const styles: { [key: string]: CSSProperties } = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#f7fafc',
    userSelect: 'none', // Disable text selection
  },
  title: {
    fontSize: '2.25rem',
    fontWeight: 'bold',
    marginBottom: '1rem'
  },
  scoreBoard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: '28rem',
    marginBottom: '1rem'
  },
  score: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  winningScore: {
    color: '#f56565', // Red color for winning score
  },
  turnIndicator: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  turnIndicatorDisc: {
    width: '1.2rem',
    height: '1.2rem',
    marginRight: '0.4rem',
  },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '0.25rem',
    backgroundColor: '#2f855a',
    padding: '0.5rem',
    borderRadius: '0.375rem',
    width: '100%',
    maxWidth: '560px',
    aspectRatio: '1 / 1',
  },
  cellContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#48bb78',
    borderRadius: '0.125rem',
    cursor: 'pointer',
    position: 'relative',
    perspective: '1000px',
    transition: 'background-color 0.2s, border 0.2s',
    border: '2px solid transparent',
  },
  disc: {
    width: '83.3333%',
    height: '83.3333%',
    borderRadius: '9999px',
    transition: 'transform 0.3s',
    transformStyle: 'preserve-3d'
  },
  discIcon: {
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: '9999px',
    marginRight: '0.5rem',
    border: '1px solid #ccc',
  },
  moveHint: {
    position: 'absolute',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  },
  skippedMessage: {
    marginTop: '1rem',
    fontSize: '1.125rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  gameOverModal: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '0.5rem',
    textAlign: 'center'
  },
  gameOverTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem'
  },
  winnerText: {
    fontSize: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#4299e1',
    color: 'white',
    borderRadius: '0.25rem'
  },
  resetButtonLarge: {
    margin: '1rem 0',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#e53e3e', // Red color
    color: 'white',
    borderRadius: '0.375rem',
    fontSize: '1.125rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    lineHeight: 1.2,
    minWidth: '140px', // Consistent width
    minHeight: '60px', // Consistent height
    display: 'flex', // Use flex to center content
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintButton: {
    margin: '1rem 0 1rem 0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    minWidth: '140px', // Consistent width
    minHeight: '60px', // Consistent height
    transition: 'background-color 0.3s',
    lineHeight: 1.2,
    display: 'flex', // Use flex to center content
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintButtonNone: {
    backgroundColor: '#a0aec0', // Gray
    color: 'white',
  },
  hintButtonPlaceable: {
    backgroundColor: '#4299e1', // Blue
    color: 'white',
  },
  hintButtonFull: {
    backgroundColor: '#f6ad55', // Orange
    color: 'white',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '1rem 0',
  },
  placeableHint: {
    width: '50%',
    height: '50%',
    borderRadius: '9999px',
    position: 'absolute',
  },
  highlightedCell: {
    backgroundColor: '#f472b6', // Bright Pink
  },
  dimmedCell: {
    backgroundColor: '#4a5568', // Darker Green-Gray
  },
  selectedHintPreviewCell: {
    border: '2px solid #ec4899', // Hot Pink border
  },
  historyControls: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '1rem',
    marginBottom: '1rem',
  },
  historyButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#63b3ed',
    color: 'white',
    borderRadius: '0.25rem',
    border: 'none',
    cursor: 'pointer',
    margin: '0 0.25rem',
    fontSize: '0.9rem',
    fontWeight: 'bold',
  },
  historyText: {
    fontSize: '1rem',
    fontWeight: 'bold',
    margin: '0 0.5rem',
  },
});

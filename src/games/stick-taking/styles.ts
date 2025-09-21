import StyleSheet from '@/app/styles/StyleSheet';
import { CSSProperties } from 'react';

export const styles: { [key: string]: CSSProperties } = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    fontFamily: 'sans-serif',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1.5rem',
    marginBottom: '2rem',
  },
  difficultyButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  button: {
    padding: '1rem 2rem',
    fontSize: '1.2rem',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#4a90e2',
    color: 'white',
  },
  turnIndicator: {
    fontSize: '1.8rem',
    marginBottom: '1rem',
    fontWeight: 'bold',
    transition: 'color 0.3s',
  },
  board: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '2rem',
    width: '100%',
    maxWidth: '500px',
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    position: 'relative',
  },
  rowContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  hintChunkText: {
    fontSize: '0.9rem',
    color: '#666',
    fontFamily: 'monospace',
    minHeight: '1.2rem', // 常に高さを確保
  },
  hintChunkVisualization: {
    position: 'absolute',
    top: '2px',
    bottom: '2px',
    backgroundColor: 'rgba(0, 116, 217, 0.2)',
    borderRadius: '4px',
    pointerEvents: 'none',
  },
  stick: {
    height: '60px',
    backgroundColor: '#8B4513',
    flex: '0 1 44px',
    minWidth: '44px',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    position: 'relative',
  },
  takenStick: {
    backgroundColor: '#d3d3d3',
  },
  selectedStick: {
    backgroundColor: '#ffcc00',
  },
  strikeThrough: {
      position: 'absolute',
      top: '50%',
      left: '-5px',
      right: '-5px',
      height: '4px',
      // backgroundColor is now set dynamically
      transform: 'translateY(-50%)',
  },
  gameOverOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverModal: {
    backgroundColor: 'white',
    padding: '2rem 3rem',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  },
  gameOverTitle: {
    fontSize: '2rem',
    marginBottom: '1rem',
  },
  winnerText: {
    fontSize: '1.5rem',
    margin: '0.5rem 0',
    fontWeight: 'bold',
  },
  reasonText: {
      fontSize: '1rem',
      color: '#666',
      marginBottom: '1.5rem',
  },
  modalButtons: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '1rem',
  },
  nimSumStatus: {
    minHeight: '24px', // 常に高さを確保
    fontSize: '1.1rem',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});

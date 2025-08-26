import StyleSheet from '../../app/styles/StyleSheet';
import { CSSProperties } from 'react';

export const styles: { [key: string]: CSSProperties } = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
  },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '4px',
    backgroundColor: '#d1d5db',
    padding: '4px',
    borderRadius: '8px',
  },
  cell: {
    width: '80px',
    height: '80px',
    border: '1px solid #9ca3af',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    position: 'relative',
    color: '#000000',
  },
  winningCell: {
    backgroundColor: '#dcfce7', // light green
  },
  bothReachingCell: {
    backgroundColor: '#fecaca', // light red
  },
  reachingCell: {
    backgroundColor: '#fef9c3', // light yellow
  },
  faintMark: {
    position: 'absolute',
    color: 'rgba(0, 0, 0, 0.1)',
  },
  status: {
    marginTop: '1rem',
    fontSize: '1.25rem',
  },
  resetButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '0.25rem',
    border: 'none',
    cursor: 'pointer',
  },
  toggleButton: {
    marginTop: '1rem',
    marginLeft: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#6b7280',
    color: 'white',
    borderRadius: '0.25rem',
    border: 'none',
    cursor: 'pointer',
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
    alignItems: 'center',
  },
  gameOverModal: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '0.5rem',
    textAlign: 'center',
  },
  gameOverTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  gameControls: {
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
  },
});

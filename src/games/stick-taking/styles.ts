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
  board: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0',
    marginBottom: '2rem',
    width: '100%',
    maxWidth: '500px',
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0', // Let the groups handle spacing
    minHeight: '78px', // stick height + hint height
  },
  stickGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0',
    padding: '0 6px', // Horizontal padding to not cut off border
  },
  stickGroupSticks: {
    display: 'flex',
    gap: '12px',
  },
  hintBorder: {
    border: '2px solid rgba(0, 116, 217, 0.5)',
    borderRadius: '6px',
    padding: '4px',
  },
  hintText: {
    minHeight: '1.2rem',
    color: '#666',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    fontWeight: 'bold',
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
      transform: 'translateY(-50%)',
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0',
    marginBottom: '1rem',
  },
});

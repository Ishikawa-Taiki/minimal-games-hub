import StyleSheet from '@/app/styles/StyleSheet';

const player1Color = '#ef4444'; // red-500
const player2Color = '#3b82f6'; // blue-500
const player1ColorRgb = '239, 68, 68';
const player2ColorRgb = '59, 130, 246';

export const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    padding: '1rem',
    boxSizing: 'border-box',
  },
  board: {
    position: 'relative',
    display: 'grid',
    backgroundColor: '#e5e7eb', // gray-200
    padding: '1rem',
    borderRadius: '8px',
  },
  dot: {
    width: '12px',
    height: '12px',
    backgroundColor: '#9ca3af', // gray-400
    borderRadius: '50%',
  },
  line: {
    position: 'absolute',
    backgroundColor: '#d1d5db', // gray-300
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#e5e7eb', // gray-200
    },
  },
  hLine: {
    height: '8px',
  },
  vLine: {
    width: '8px',
  },
  lineOwned: {
    cursor: 'default',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  line_player1: {
    backgroundColor: player1Color,
    '&:hover': {
      backgroundColor: player1Color,
    },
  },
  line_player2: {
    backgroundColor: player2Color,
    '&:hover': {
      backgroundColor: player2Color,
    },
  },
  line_preview: {
    opacity: 0.5,
  },
  box: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.3s ease',
  },
  box_player1: {
    backgroundColor: `rgba(${player1ColorRgb}, 0.3)`,
  },
  box_player2: {
    backgroundColor: `rgba(${player2ColorRgb}, 0.3)`,
  },
  hintNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    opacity: 0.2,
    color: '#6b7280', // gray-500
    pointerEvents: 'none',
    transition: 'color 0.3s, opacity 0.3s',
  },
  hintNumber_preview_player1: {
    color: player1Color,
    opacity: 0.7,
  },
  hintNumber_preview_player2: {
    color: player2Color,
    opacity: 0.7,
  },
  previewHighlight_player1: {
    backgroundColor: `rgba(${player1ColorRgb}, 0.2)`,
  },
  previewHighlight_player2: {
    backgroundColor: `rgba(${player2ColorRgb}, 0.2)`,
  },
  difficultySelector: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  scoreBoard: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: '400px',
    marginBottom: '1rem',
    padding: '0.5rem',
    borderRadius: '8px',
    backgroundColor: '#f9fafb', // gray-50
  },
  scoreItem: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  score_player1: {
    color: player1Color,
  },
  score_player2: {
    color: player2Color,
  },
});
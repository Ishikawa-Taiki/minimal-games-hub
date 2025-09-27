import StyleSheet from '@/app/styles/StyleSheet';

const player1Color = 'var(--color-player1)';
const player2Color = 'var(--color-player2)';

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
    backgroundColor: 'var(--color-surface-container-highest)',
    padding: '1rem',
    borderRadius: '8px',
  },
  dot: {
    width: '12px',
    height: '12px',
    backgroundColor: 'var(--color-outline-variant)',
    borderRadius: '50%',
  },
  line: {
    position: 'absolute',
    backgroundColor: 'var(--color-surface-container-highest)',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: 'var(--color-surface-container-low)',
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
    backgroundColor: `rgba(var(--color-player1-rgb), 0.3)`,
  },
  box_player2: {
    backgroundColor: `rgba(var(--color-player2-rgb), 0.3)`,
  },
  hintNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    opacity: 0.2,
    color: 'var(--color-on-surface)',
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
     backgroundColor: `rgba(var(--color-player1-rgb), 0.2)`,
  },
    previewHighlight_player2: {
     backgroundColor: `rgba(var(--color-player2-rgb), 0.2)`,
  },
  difficultySelector: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
});
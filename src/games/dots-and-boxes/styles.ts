import StyleSheet from '@/app/styles/StyleSheet';

// --- Color Palette ---
const player1Color = '#ef4444'; // red-500
const player2Color = '#3b82f6'; // blue-500
const player1ColorRgb = '239, 68, 68';
const player2ColorRgb = '59, 130, 246';
const defaultLineColor = '#d1d5db'; // gray-300
const hoverLineColor = '#f3f4f6'; // gray-100
const dotColor = '#9ca3af'; // gray-400
const hintTextColor = '#6b7280'; // gray-500

export const styles = StyleSheet.create({
  // --- Game Container ---
  gameContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    padding: '1rem',
    boxSizing: 'border-box',
    gap: '1rem',
  },

  // --- Difficulty Selector ---
  difficultySelector: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },

  // --- Board Layout (Grid Based) ---
  board: {
    display: 'grid',
    alignItems: 'center',
    justifyItems: 'center',
  },

  // --- Grid Items ---
  dot: {
    width: '12px',
    height: '12px',
    backgroundColor: dotColor,
    borderRadius: '50%',
    zIndex: 2, // Dots should be on top of lines
  },
  line: {
    backgroundColor: defaultLineColor,
    transition: 'background-color 0.2s ease',
    width: '100%',
    height: '100%',
    cursor: 'pointer',
  },
  lineHover: {
    backgroundColor: hoverLineColor,
  },
  lineOwned: {
    cursor: 'default',
  },
  line_player1: {
    backgroundColor: player1Color,
  },
  line_player2: {
    backgroundColor: player2Color,
  },
  line_preview: {
    opacity: 0.5,
  },
  box: {
    width: '100%',
    height: '100%',
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

  // --- Hint and Preview Styles ---
  hintNumber: {
    fontSize: 'clamp(1rem, 8vw, 2rem)', // Responsive font size
    fontWeight: 'bold',
    color: hintTextColor,
    opacity: 0.25,
    pointerEvents: 'none',
    transition: 'color 0.3s, opacity 0.3s',
  },
  previewHighlight: {
    // This style is for the box's background during preview
  },
  previewHighlight_player1: {
    backgroundColor: `rgba(${player1ColorRgb}, 0.2)`,
  },
  previewHighlight_player2: {
    backgroundColor: `rgba(${player2ColorRgb}, 0.2)`,
  },
  hintNumber_preview: {
    // This style is for the hint number during preview
  },
  hintNumber_preview_player1: {
    color: player1Color,
    opacity: 0.7,
  },
  hintNumber_preview_player2: {
    color: player2Color,
    opacity: 0.7,
  },

  // --- Scoreboard ---
  scoreBoard: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: '400px',
    padding: '0.5rem',
    borderRadius: '8px',
    backgroundColor: '#f9fafb', // gray-50
    border: '1px solid #e5e7eb', // gray-200
  },
  scoreItem: {
    fontSize: '1.25rem', // 20px
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
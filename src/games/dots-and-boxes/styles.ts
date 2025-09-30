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

  // --- Pre-Game Screen ---
  preGameContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    gap: '1.5rem',
  },
  preGameTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  preGameButtonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%',
    maxWidth: '300px',
  },

  // --- Board Layout (Grid Based) ---
  board: {
    display: 'grid',
    alignItems: 'center',
    justifyItems: 'center',
    width: '100%',
    maxWidth: '600px', // Prevent the board from becoming excessively large on wide screens
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
    transition: 'all 0.2s ease',
    width: '100%',
    height: '100%',
    cursor: 'pointer',
    borderRadius: '9999px',
    boxSizing: 'border-box',
  },
  lineHover: {
    backgroundColor: hoverLineColor,
  },
  lineOwned: {
    cursor: 'default',
    border: '1.5px solid #1f2937', // dark gray/black border
    // The transform makes it pop out a bit, fulfilling "少し太め"
    transform: 'scale(1.1)',
  },
  line_player1: {
    backgroundColor: player1Color,
  },
  line_player2: {
    backgroundColor: player2Color,
  },
  line_preview: {
    // The preview line is made thinner via transform in the component.
    // The opacity makes the color less intense.
    opacity: 0.8,
  },
  box: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.3s ease, transform 0.3s ease-out',
  },
  box_player1: {
    backgroundColor: `rgba(${player1ColorRgb}, 0.3)`,
  },
  box_player2: {
    backgroundColor: `rgba(${player2ColorRgb}, 0.3)`,
  },
  box_newlyCompleted: {
    transform: 'scale(1.15)',
    backgroundColor: `rgba(255, 215, 0, 0.6)`,
    // アニメーション中は背景色のトランジションを無効にし、即座に色が変わるようにする
    transition: 'transform 0.3s ease-out',
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
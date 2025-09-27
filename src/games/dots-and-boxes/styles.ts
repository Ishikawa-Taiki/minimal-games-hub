import StyleSheet from '@/app/styles/StyleSheet';

export const CELL_SIZE = 60;
export const DOT_SIZE = 16;
export const LINE_THICKNESS = 8;

const styles = StyleSheet.create({
  // Difficulty selection
  difficultyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    height: '100%',
  },
  difficultyTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937', // gray-800
  },
  difficultyButtonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },

  // Game container
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  boardWrapper: {
    position: 'relative',
  },
  board: {
    display: 'grid',
    gap: CELL_SIZE,
    padding: DOT_SIZE / 2,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: '50%',
    backgroundColor: '#374151', // gray-700
    zIndex: 2,
  },
  linesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  line: {
    position: 'absolute',
    backgroundColor: '#d1d5db', // gray-300
    transition: 'background-color 0.2s ease-in-out',
  },
  lineClickable: {
    cursor: 'pointer',
  },
  lineHover: {
    backgroundColor: '#f3f4f6', // gray-100
  },
  hLine: {
    height: LINE_THICKNESS,
    top: -LINE_THICKNESS / 2,
    width: CELL_SIZE,
  },
  vLine: {
    width: LINE_THICKNESS,
    left: -LINE_THICKNESS / 2,
    height: CELL_SIZE,
  },
  player1Line: {
    backgroundColor: '#ef4444', // red-500
  },
  player2Line: {
    backgroundColor: '#3b82f6', // blue-500
  },
  boxesContainer: {
    position: 'absolute',
    top: DOT_SIZE / 2,
    left: DOT_SIZE / 2,
    display: 'grid',
    gap: LINE_THICKNESS,
    zIndex: 0,
  },
  box: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.3s',
  },
  player1Box: {
    backgroundColor: 'rgba(254, 202, 202, 0.5)', // red-200 with 0.5 opacity
  },
  player2Box: {
    backgroundColor: 'rgba(191, 219, 254, 0.5)', // blue-200 with 0.5 opacity
  },
  hintNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9ca3af', // gray-400
    pointerEvents: 'none',
  },
  // Preview hint styles
  player1PreviewBox: {
    backgroundColor: '#fee2e2', // red-100
  },
  player2PreviewBox: {
    backgroundColor: '#dbeafe', // blue-100
  },
  player1PreviewHintNumber: {
    color: '#fca5a5', // red-300
  },
  player2PreviewHintNumber: {
    color: '#93c5fd', // blue-300
  },
});

export default styles;
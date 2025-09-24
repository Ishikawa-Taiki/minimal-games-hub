import StyleSheet from '@/app/styles/StyleSheet';
import { CSSProperties } from 'react';

export const styles: { [key: string]: CSSProperties } = StyleSheet.create({
    gameContent: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    margin: '0 auto',
    padding: '0',
    boxSizing: 'border-box',
    overflowY: 'auto',
    flex: 1,
    minHeight: '100%',
  },
  difficultySelector: {
    marginBottom: '1.5rem',
    padding: '1rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f7fafc',
    width: 'auto',
    boxSizing: 'border-box',
    flexShrink: 0,
  },
  difficultyTitle: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  radioGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    cursor: 'pointer',
  },
  statusBar: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    padding: '10px 0',
    marginBottom: '10px',
  },
  scoreBox: {
    textAlign: 'center',
    padding: '5px 15px',
    borderRadius: '8px',
    minWidth: '100px',
    border: '2px solid transparent',
    transition: 'all 0.3s',
  },
  scoreText: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  scoreBoxPlayer1: {
    backgroundColor: 'rgba(255, 182, 193, 0.5)',
    borderColor: '#ff69b4',
  },
  scoreBoxPlayer2: {
    backgroundColor: 'rgba(173, 216, 230, 0.5)',
    borderColor: '#1e90ff',
  },
  turnBox: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    width: '100%',
    overflow: 'hidden',
  },
  board: {
    display: 'grid',
    gap: '5px',
    // gridTemplateColumns and other properties will be set dynamically
  },
  card: {
    width: '100%',
    aspectRatio: '2 / 3',
    backgroundColor: '#4a90e2',
    border: '2px solid #357abd',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'transform 0.3s, background-color 0.3s',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFace: {
    backgroundColor: '#ffffff',
  },
  cardSelected: {
    boxShadow: '0 0 0 4px #3b82f6',
    borderColor: '#3b82f6',
  },
  cardMatchedPlayer1: {
    backgroundColor: 'rgba(255, 182, 193, 0.5)', // Light Pink with transparency
    border: '2px solid #ff69b4', // Hot Pink
  },
  cardMatchedPlayer2: {
    backgroundColor: 'rgba(173, 216, 230, 0.5)', // Light Blue with transparency
    border: '2px solid #1e90ff', // Dodger Blue
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    fontWeight: 'bold',
  },
  cardSuit: {
    // このスタイルはサイジングには使用されませんが、将来他のプロパティで使用する可能性があるため残しています。
    // fontSizeは不要になったため削除します。
  },
  resetButton: {
    padding: '10px 20px',
    fontSize: '1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
  },
  toggleButton: {
    padding: '10px 20px',
    fontSize: '1rem',
    backgroundColor: '#6b7280',
    color: 'white',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
  },
  buttonContainer: {
    display: 'flex',
    gap: '1rem',
    marginTop: '20px',
  },
  cardHint: {
    backgroundColor: '#fef9c3', // light yellow
  },
  cardHintStrong: {
    backgroundColor: '#a7f3d0', // light green
  },
  gameOverOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  gameOverModal: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '0.5rem',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  gameOverTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  winnerText: {
    fontSize: '1.25rem',
    marginBottom: '1.5rem',
  },
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
  scoreBoard: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    padding: '10px 20px',
    marginBottom: '15px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    boxSizing: 'border-box',
  },
  score: {
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'background-color 0.3s',
  },
  activePlayerScore: {
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'background-color 0.3s',
    backgroundColor: 'rgba(255, 255, 0, 0.3)', // yellow highlight
  },
});

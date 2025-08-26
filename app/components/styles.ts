import StyleSheet from '../styles/StyleSheet';

export const gameLayoutStyles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f3f4f6', // bg-gray-100
  },
  header: {
    backgroundColor: '#ffffff', // bg-white
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // shadow-md
    padding: '1rem', // p-4
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: '1.25rem', // text-xl
    fontWeight: 'bold', // font-bold
  },
  linksContainer: {
    display: 'flex',
    gap: '1rem', // gap-4
  },
  link: {
    padding: '0.5rem 1rem', // px-4 py-2
    color: '#ffffff', // text-white
    borderRadius: '0.25rem', // rounded
    textDecoration: 'none',
  },
  rulesLink: {
    backgroundColor: '#3b82f6', // bg-blue-500
  },
  homeLink: {
    backgroundColor: '#d1d5db', // bg-gray-300
    color: '#000000',
  },
  main: {
    flexGrow: 1,
    padding: '1rem', // p-4
    overflowY: 'auto',
  },
});

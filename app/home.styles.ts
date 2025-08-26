import StyleSheet from './styles/StyleSheet';

export const homePageStyles = StyleSheet.create({
  main: {
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem 4rem', // p-8 md:p-16 lg:p-24
  },
  header: {
    position: 'relative',
    display: 'flex',
    placeItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '4rem', // text-4xl md:text-6xl
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gamesSection: {
    width: '100%',
    maxWidth: '64rem', // max-w-5xl
  },
  gamesTitle: {
    fontSize: '2rem', // text-2xl md:text-3xl
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  gamesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
    gap: '1.5rem',
  },
  gameLink: {
    display: 'block',
    borderRadius: '0.5rem',
    border: '1px solid #e5e7eb', // border-gray-200
    backgroundColor: '#ffffff', // bg-white
    padding: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // shadow-md
    transition: 'transform 0.2s',
    textDecoration: 'none',
  },
  gameTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#111827',
  },
  gameDescription: {
    color: '#4b5563',
    fontSize: '0.875rem',
  },
});

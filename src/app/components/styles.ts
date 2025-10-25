import StyleSheet from '@/core/styles/StyleSheet';

export const gameLayoutStyles = StyleSheet.create({
  // レガシースタイル（後方互換性のため保持）
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
    padding: 0, // p-4
    overflowY: 'auto',
  },

  // 新しいレスポンシブレイアウト用スタイル
  
  // PCレイアウト（サイドバー）
  desktopContainer: {
    display: 'flex',
    height: '100vh',
    backgroundColor: 'rgb(243, 244, 246)',
  },
  sidebar: {
    width: '300px',
    backgroundColor: '#ffffff',
    boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  sidebarHeader: {
    padding: '1.5rem 1rem 1rem',
    borderBottom: '1px solid #e5e7eb',
  },
  sidebarTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0,
  },
  desktopMain: {
    flex: 1,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // モバイルレイアウト（ミニマル）
  mobileContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: 'rgb(243, 244, 246)',
    position: 'relative',
  },
  mobileHeader: {
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    padding: '0.75rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: '60px',
  },
  mobileHeaderTitle: {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0,
  },
  mobileStatus: {
    fontSize: '0.875rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  mobileMain: {
    flex: 1,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 0, // flexboxの伸長に関する問題を解決
  },

  // コントロールパネル
  controlPanel: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  controlPanelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #e5e7eb',
  },
  controlPanelTitle: {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '0.25rem',
  },
  statusSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#374151',
    margin: 0,
  },
  statusText: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0,
    padding: '0.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.375rem',
    border: '1px solid #e5e7eb',
  },
  actionsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  controlButton: {
    padding: '0.75rem 1rem',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'none',
    display: 'block',
    transition: 'background-color 0.2s',
  },
  scoreInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  scoreDisplay: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.375rem',
    border: '1px solid #e5e7eb',
    fontSize: '0.875rem',
    color: '#374151',
  },
  // フローティングアクションボタン（FAB）
  fab: {
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.5rem',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },

  // ボトムシート
  bottomSheetOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: '1rem',
    borderTopRightRadius: '1rem',
    width: '100%',
    maxHeight: '70vh',
    overflowY: 'auto',
    animation: 'slideUp 0.3s ease-out',
  },
});

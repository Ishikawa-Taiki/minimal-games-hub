'use client';

import React from 'react';

const DebugPage: React.FC = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div>
      <h1>Debug Page</h1>
      <p>This page is for debugging UI components.</p>
    </div>
  );
};

export default DebugPage;

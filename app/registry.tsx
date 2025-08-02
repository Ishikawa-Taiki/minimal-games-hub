"use client";

import React from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

export default function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const cache = React.useMemo(() => {
    const emotionCache = createCache({ key: 'emotion', prepend: true });
    emotionCache.compat = true;
    return emotionCache;
  }, []);

  useServerInsertedHTML(() => {
    return (
      <style
        data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: Object.values(cache.inserted).join(' '),
        }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      {children}
    </CacheProvider>
  );
}
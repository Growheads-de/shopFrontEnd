import createCache from '@emotion/cache';

export default function createEmotionCache() {
  return createCache({ 
    key: 'css', 
    speedy: false // Disable speedy mode for SSR - matches working test
  });
} 
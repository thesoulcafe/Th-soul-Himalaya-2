#!/bin/bash
find src -name "*.tsx" -exec sed -i -e "s/console.error(err);/if (err.name !== 'AbortError') console.error(err);/g" {} +
find src -name "*.tsx" -exec sed -i -e "s/console.log('Error sharing:', err);/if (err.name !== 'AbortError') console.log('Error sharing:', err);/g" {} +
find src -name "*.tsx" -exec sed -i -e "s/navigator.share(shareData).catch(console.error);/navigator.share(shareData).catch(err => { if (err.name !== 'AbortError') console.error(err); });/g" {} +

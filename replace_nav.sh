#!/bin/bash
sed -i -e "s/if (window.location.pathname !== '\/admin') {/if (window.location.pathname !== '\/admin') {\n        if (pendingCartItem) {\n          navigate('\/cart');\n        } else {/g" src/components/AuthModal.tsx
sed -i -e "s/navigate('\/dashboard');/navigate('\/dashboard');\n        }/g" src/components/AuthModal.tsx

#!/bin/bash
sed -i -e "s/} else {/\} else if (window.location.pathname === '\/checkout' || window.location.pathname === '\/cart') {\n          \/\/ stay\n        } else {/g" src/components/AuthModal.tsx

#!/bin/bash
sed -i -e "s/if (pendingCartItem) {/if (!!pendingCartItem) {/g" src/components/AuthModal.tsx

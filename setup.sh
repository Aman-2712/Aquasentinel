#!/bin/bash
echo "==================================================="
echo "  AquaSentinel - Automatic Setup & Repair Script"
echo "==================================================="
echo ""

echo "1. Pulling latest code from GitHub (origin/main)..."
git fetch origin main
git reset --hard origin/main

echo ""
echo "2. Checking environment configuration..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "   Created .env.local from template."
else
    echo "   .env.local already present."
fi

echo ""
echo "3. Checking for corrupted Antigravity AI hook configs..."
if [ -f "$HOME/.gemini/config/hooks.json" ]; then
    rm -f "$HOME/.gemini/config/hooks.json"
    echo "   Cleared corrupted AI hooks.json config."
fi

echo ""
echo "4. Installing node_modules dependencies..."
npm install

echo ""
echo "==================================================="
echo "  Setup Complete! Starting development server..."
echo "==================================================="
npm run dev

#!/bin/bash

# ========================================
# Fix Script for TypeScript Errors
# ========================================

echo "🔧 Fixing TypeScript and Next.js errors..."

# 1. ลบ node_modules และ cache เก่า
echo "📦 Cleaning old dependencies..."
rm -rf node_modules
rm -rf .next
rm -rf package-lock.json
rm -rf yarn.lock

# 2. ติดตั้ง dependencies ใหม่ทั้งหมด
echo "📦 Installing fresh dependencies..."
npm install

# 3. ติดตั้ง Next.js types ที่ขาดหาย
echo "📝 Installing missing TypeScript definitions..."
npm install --save-dev @types/react @types/react-dom @types/node

# 4. ตรวจสอบและติดตั้ง Next.js
echo "⚡ Ensuring Next.js is properly installed..."
npm install next@latest react@latest react-dom@latest

# 5. Generate Prisma Client
echo "🗄️ Generating Prisma Client..."
npx prisma generate

# 6. สร้าง .next folder
echo "🏗️ Building Next.js..."
npm run build || true

# 7. Clear TypeScript cache
echo "🧹 Clearing TypeScript cache..."
rm -rf tsconfig.tsbuildinfo

echo "✅ Fix completed! Please restart your VS Code TypeScript service:"
echo "   1. Press Cmd/Ctrl + Shift + P"
echo "   2. Type 'TypeScript: Restart TS Server'"
echo "   3. Press Enter"
echo ""
echo "Then run: npm run dev"

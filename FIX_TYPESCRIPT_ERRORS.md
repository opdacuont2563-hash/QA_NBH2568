# 🔧 วิธีแก้ไข TypeScript Errors

## ❌ Error ที่พบ:
1. Cannot find module 'next/image'
2. JSX element implicitly has type 'any' 
3. TypeScript configuration issues

## ✅ วิธีแก้ไข

### 📋 Step 1: Copy ไฟล์ที่จำเป็น

Copy ไฟล์เหล่านี้ไปยัง root ของโปรเจค:
- `tsconfig.json` → root folder
- `next-env.d.ts` → root folder  
- `next.config.js` → root folder
- `global.d.ts` → `src/types/global.d.ts`

### 📋 Step 2: รันคำสั่งแก้ไข

#### สำหรับ Windows (PowerShell):
```powershell
# 1. ลบ dependencies เก่า
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .next
Remove-Item -Force package-lock.json

# 2. Clear npm cache
npm cache clean --force

# 3. ติดตั้ง dependencies ใหม่
npm install

# 4. ติดตั้ง types ที่ขาด
npm install --save-dev @types/react@latest @types/react-dom@latest @types/node@latest

# 5. Generate Prisma
npx prisma generate

# 6. Build project
npm run build
```

#### สำหรับ Mac/Linux (Terminal):
```bash
# 1. ลบ dependencies เก่า
rm -rf node_modules .next package-lock.json

# 2. Clear npm cache
npm cache clean --force

# 3. ติดตั้ง dependencies ใหม่
npm install

# 4. ติดตั้ง types ที่ขาด
npm install --save-dev @types/react@latest @types/react-dom@latest @types/node@latest

# 5. Generate Prisma
npx prisma generate

# 6. Build project
npm run build
```

### 📋 Step 3: Restart TypeScript Service ใน VS Code

1. กด `Cmd/Ctrl + Shift + P`
2. พิมพ์ `TypeScript: Restart TS Server`
3. กด Enter
4. รอสักครู่ให้ VS Code reload

### 📋 Step 4: ตรวจสอบ package.json

ตรวจสอบว่ามี dependencies เหล่านี้:
```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "typescript": "^5.3.3"
  }
}
```

### 📋 Step 5: ตรวจสอบโครงสร้างโฟลเดอร์

```
your-project/
├── node_modules/
├── public/
├── src/
│   ├── app/
│   │   └── layout.tsx
│   │   └── page.tsx
│   └── types/
│       └── global.d.ts
├── .env.local
├── next-env.d.ts
├── next.config.js
├── package.json
└── tsconfig.json
```

## 🚨 หากยังมีปัญหา

### 1. ตรวจสอบ Node.js version
```bash
node --version  # ต้องเป็น v18.17.0 หรือสูงกว่า
```

### 2. ลองใช้ Yarn แทน NPM
```bash
# ลบ node_modules
rm -rf node_modules package-lock.json

# ติดตั้งด้วย yarn
yarn install
yarn dev
```

### 3. Clear VS Code Cache
- Windows: `%APPDATA%\Code\Cache`
- Mac: `~/Library/Application Support/Code/Cache`
- Linux: `~/.config/Code/Cache`

### 4. สร้างไฟล์ src/app/layout.tsx ใหม่
```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
```

### 5. สร้างไฟล์ src/app/page.tsx ใหม่
```typescript
export default function Home() {
  return (
    <main>
      <h1>SurgiBot - โรงพยาบาลหนองบัวลำภู</h1>
    </main>
  )
}
```

## ✅ ทดสอบว่าทำงานได้
```bash
npm run dev
# เปิด http://localhost:3000
```

## 📞 หากยังแก้ไม่ได้

ส่ง error message มาให้ผมดูเพิ่มเติมได้ครับ โดยรัน:
```bash
npx next info
```

แล้ว copy ผลลัพธ์มาให้ดู พร้อมกับ error messages ทั้งหมด

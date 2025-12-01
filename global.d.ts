// src/types/global.d.ts
// Global type definitions

/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace NodeJS {
  interface ProcessEnv {
    // Database
    DATABASE_URL: string;
    DATABASE_URL_NON_POOLING?: string;
    
    // Authentication
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    
    // Encryption (PDPA)
    ENCRYPTION_KEY: string;
    ENCRYPTION_IV: string;
    
    // Session
    SESSION_SECRET: string;
    SESSION_MAX_AGE?: string;
    
    // WebSocket
    WEBSOCKET_PORT?: string;
    WEBSOCKET_CORS_ORIGIN?: string;
    
    // Hospital Settings
    HOSPITAL_NAME?: string;
    HOSPITAL_CODE?: string;
    DEFAULT_TIMEZONE?: string;
    
    // Features
    ENABLE_TTS?: string;
    ENABLE_GOOGLE_SHEETS?: string;
    ENABLE_QR_CODE?: string;
    ENABLE_BARCODE_SCANNER?: string;
    ENABLE_AUTO_DELETE?: string;
    ENABLE_AUTO_DISCHARGE?: string;
    
    // Auto Flow Settings
    AUTO_DISCHARGE_DELAY_MIN?: string;
    AUTO_DELETE_AFTER_DISCHARGE_MIN?: string;
    RECOVERY_DURATION_MIN?: string;
    ANNOUNCE_INTERVAL_MIN?: string;
    
    // PDPA Compliance
    ENABLE_DATA_ENCRYPTION?: string;
    ENABLE_AUDIT_LOG?: string;
    DATA_RETENTION_DAYS?: string;
    MASK_PATIENT_DATA?: string;
  }
}

// Module declarations
declare module "*.svg" {
  import React from "react";
  const SVG: React.FC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

// Extend Window interface if needed
interface Window {
  // Add any window extensions here
}

// Global variables
declare global {
  var prisma: import('@prisma/client').PrismaClient | undefined;
}

export {};

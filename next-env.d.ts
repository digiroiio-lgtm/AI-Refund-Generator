/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
declare namespace NodeJS {
  interface ProcessEnv {
    STRIPE_SECRET_KEY?: string;
    STRIPE_PUBLISHABLE_KEY?: string;
    OPENAI_API_KEY?: string;
    DATABASE_URL?: string;
  }
}

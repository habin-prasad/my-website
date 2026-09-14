/// <reference path="../.astro/types.d.ts" />
/// <reference types="@astrojs/cloudflare" />

declare namespace App {
  interface Locals {
    runtime: {
      env: {
        TURSO_HTTP_URL?: string;
        TURSO_AUTH_TOKEN?: string;
        [key: string]: any;
      };
      cf: Record<string, any>;
      ctx: {
        waitUntil: (promise: Promise<any>) => void;
        passThroughOnException: () => void;
      };
    };
  }
}
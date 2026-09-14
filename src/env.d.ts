interface ImportMetaEnv {
  readonly TURSO_HTTP_URL: string;
  readonly TURSO_AUTH_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
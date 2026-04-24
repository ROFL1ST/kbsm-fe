/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly KBBU_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

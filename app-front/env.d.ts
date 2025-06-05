/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NUVEMSHOP_APP_ID: string;
  // Adicione mais variáveis de ambiente conforme necessário
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

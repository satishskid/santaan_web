interface VectorizeIndex {}
interface R2Bucket {
  put(
    key: string,
    value: string | ReadableStream | ArrayBuffer | ArrayBufferView | Blob,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<void>;
}
interface Ai {}

declare namespace Cloudflare {
  interface Env {
    APP_ENV: "development";
    VECTOR_INDEX_NAME: "santaan-content-index";
    DRAFTS_BUCKET_NAME: "santaan-content-drafts";
    ASSETS_BUCKET_NAME: "santaan-content-assets";
    MEDIA_BUCKET_NAME: "santaan-content-media";
    CF_CONTENT_ENGINE_TOKEN?: string;
    TURSO_DATABASE_URL?: string;
    TURSO_AUTH_TOKEN?: string;
    GEMINI_API_KEY?: string;
    CONTENT_VECTORIZE?: VectorizeIndex;
    CONTENT_DRAFTS?: R2Bucket;
    CONTENT_ASSETS?: R2Bucket;
    CONTENT_MEDIA?: R2Bucket;
    AI: Ai;
  }
}

interface Env extends Cloudflare.Env {}

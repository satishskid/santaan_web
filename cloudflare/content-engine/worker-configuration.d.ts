type VectorizeMetadata = Record<string, string | number | boolean | null>;

interface VectorizeVector {
  id: string;
  values: number[];
  metadata?: VectorizeMetadata;
  namespace?: string;
}

interface VectorizeMatch {
  id: string;
  score?: number;
  metadata?: VectorizeMetadata;
  values?: number[];
  namespace?: string;
}

interface VectorizeQueryResult {
  count?: number;
  matches?: VectorizeMatch[];
}

interface VectorizeIndex {
  upsert(vectors: VectorizeVector[]): Promise<{ count?: number } | void>;
  query(
    vector: number[],
    options?: {
      topK?: number;
      returnMetadata?: boolean | "all";
      returnValues?: boolean;
      namespace?: string;
      filter?: Record<string, unknown>;
    }
  ): Promise<VectorizeQueryResult>;
}

interface R2ObjectBody {
  text(): Promise<string>;
  json<T>(): Promise<T>;
  arrayBuffer(): Promise<ArrayBuffer>;
}

interface R2Object {
  key: string;
  size: number;
  etag: string;
  version: string;
  httpEtag: string;
  uploaded: Date;
  body?: ReadableStream;
  text(): Promise<string>;
  json<T>(): Promise<T>;
  arrayBuffer(): Promise<ArrayBuffer>;
}

interface R2Objects {
  objects: Array<{ key: string; size: number }>;
  truncated: boolean;
  cursor?: string;
}

interface R2Bucket {
  put(
    key: string,
    value: string | ReadableStream | ArrayBuffer | ArrayBufferView | Blob,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<void>;
  get(key: string): Promise<R2ObjectBody | R2Object | null>;
  list(options?: { prefix?: string; cursor?: string; limit?: number }): Promise<R2Objects>;
}

interface Ai {
  run(model: string, inputs: Record<string, unknown>): Promise<unknown>;
}

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

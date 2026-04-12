import { S3Client } from "@aws-sdk/client-s3";
import { getStorageConfig, type StorageConfig } from "@/lib/env";

export function createStorageClient(config: StorageConfig = getStorageConfig()) {
  return new S3Client({
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    region: config.region,
  });
}

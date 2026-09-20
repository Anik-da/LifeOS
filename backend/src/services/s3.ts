import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const region = process.env.AWS_REGION || 'us-east-1';
const bucketName = process.env.S3_BUCKET_NAME || 'lifeos-documents';

const s3Client = new S3Client({ region });

export const s3Service = {
  getOriginalS3Key(userId: string, documentId: string, filename: string): string {
    const safeFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
    return `users/${userId}/documents/${documentId}/original/${safeFilename}`;
  },

  getProcessedS3Key(userId: string, documentId: string): string {
    return `users/${userId}/documents/${documentId}/processed/extracted.json`;
  },

  async generateUploadPresignedUrl(s3Key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      ContentType: contentType,
    });
    return getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 min expiration
  },

  async getObjectBytes(s3Key: string): Promise<Uint8Array> {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    });
    const response = await s3Client.send(command);
    if (!response.Body) {
      throw new Error(`Empty body for S3 key: ${s3Key}`);
    }
    return response.Body.transformToByteArray();
  },

  async putProcessedJson(s3Key: string, data: any): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json',
    });
    await s3Client.send(command);
  },

  async deleteDocumentObjects(userId: string, documentId: string): Promise<void> {
    const prefix = `users/${userId}/documents/${documentId}/`;
    // Attempt standard cleanup
    try {
      await s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: `${prefix}processed/extracted.json` }));
    } catch {}
  }
};

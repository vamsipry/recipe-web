import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: process.env.BUCKET_REGION });

export const handler = async (event) => {
  const body = JSON.parse(event.body || '{}');
  const contentType = body.contentType || 'image/jpeg';
  const key = `${crypto.randomUUID()}`;
  const url = await getSignedUrl(s3, new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    ContentType: contentType
  }), { expiresIn: 60 * 5 });
  return { statusCode: 200, body: JSON.stringify({ uploadUrl: url, key }) };
};

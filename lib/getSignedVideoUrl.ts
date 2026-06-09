import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function getSignedVideoUrl(s3Key: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.VIDEO_BUCKET_NAME,
    Key: s3Key,   // e.g. "videos/modcon-cdu.mp4"
  });

  // URL expires in 1 hour
  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return signedUrl;
}
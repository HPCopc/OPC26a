import { getCurrentUser } from "aws-amplify/auth/server";
import { redirect } from "next/navigation";
import { getSignedVideoUrl } from "@/lib/getSignedVideoUrl";

export default async function VideoPage({ params }: { params: { id: string } }) {

  const client = generateServerClientUsingCookies<Schema>({ config, cookies });

  // 1. Fetch the video
  const { data: video } = await client.models.Video.get({ id: params.id });
  if (!video || !video.isPublished) redirect("/topics/videos");

  // 2. If not public — check login
  if (!video.isPublic) {
    try {
      await getCurrentUser({ serverContext: { cookies } });
    } catch {
      redirect("/login?redirect=/videos/" + params.id);
    }
  }

  // 3. Generate signed S3 URL (works for both public and protected)
  const videoUrl = await getSignedVideoUrl(video.s3Key);

  return <VideoPlayer video={video} url={videoUrl} />;
}
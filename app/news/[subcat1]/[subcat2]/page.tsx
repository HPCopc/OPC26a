import NewsSubcat2Page from "./NewsSubcat2Page";

export default async function Page({
  params,
}: {
  params: Promise<{ subcat1: string; subcat2: string }>;
}) {
  const { subcat1, subcat2 } = await params;
  return <NewsSubcat2Page subcat1={subcat1} subcat2={subcat2} />;
}
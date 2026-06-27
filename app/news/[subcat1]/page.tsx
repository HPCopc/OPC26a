import NewsSubcat1Page from "./NewsSubcat1Page";

export default async function Page({ params }: { params: Promise<{ subcat1: string }> }) {
  const { subcat1 } = await params;
  return <NewsSubcat1Page subcat1={subcat1} />;
}
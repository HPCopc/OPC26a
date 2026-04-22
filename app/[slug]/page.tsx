 import { getPageBySlug } from "@/lib/db/content"
import ContentSection from "@/app/components/ContentSection"

interface Props {
  params: Promise<{ slug: string }>  // ← now a Promise in Next.js 15
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params  // ← must await it

  const page = await getPageBySlug(slug)

  if (!page) return <div>Page not found</div>

  return (
    <ContentSection
      title={page.title}
      sections={page.sections}
    />
  )
}
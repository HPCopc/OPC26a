import { getPageBySlug } from "@/lib/db/content"
import ContentSection from "@/app/components/ContentSection"

interface Props {
  params: { slug: string }
}

export default async function DynamicPage({ params }: Props) {
  const page = await getPageBySlug(params.slug)

  if (!page) return <div>Page not found</div>

  return (
    <ContentSection
      title={page.title}
      sections={page.sections}  // JSON array of sections
    />
  )
}
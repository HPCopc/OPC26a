import { getPageBySlug } from "@/lib/db/content"
import ContentSection from "@/app/components/ContentSection"

interface Section {
  heading: string
  body: string
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params

  const page = await getPageBySlug(slug)

  if (!page) return <div>Page not found</div>

  const sections = (
    typeof page.sections === 'string'
      ? JSON.parse(page.sections)
      : page.sections
  ) as Section[]

  return (
    <ContentSection
      title={page.title}
      sections={sections}
    />
  )
}
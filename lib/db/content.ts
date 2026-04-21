import { generateClient } from "aws-amplify/data"
import type { Schema } from "@/amplify/data/resource"

const client = generateClient<Schema>()

export async function getPageBySlug(slug: string) {
  const { data } = await client.models.Page.list({
    filter: { slug: { eq: slug } }
  })
  return data[0]
}
import { generateClient } from "aws-amplify/data"
import type { Schema } from "@/amplify/data/resource"
import { Amplify } from "aws-amplify"
import outputs from "@/amplify_outputs.json"

Amplify.configure(outputs)

const client = generateClient<Schema>({ authMode: 'apiKey' })

export async function getPageBySlug(slug: string) {
  const { data } = await client.models.Page.list({
    filter: { slug: { eq: slug } }
  })
  return data[0]
}
import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID?.trim() || 'cqjhux75'
const dataset = import.meta.env.VITE_SANITY_DATASET?.trim() || 'production'
const apiVersion = '2025-04-23'

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
})

const imageBuilder = createImageUrlBuilder(sanityClient)

export function urlForImage(source: SanityImageSource) {
  return imageBuilder.image(source)
}

export type ImageWithAlt = {
  alt?: string
  caption?: string
  asset?: {
    _ref?: string
    url?: string
  }
}

export type GalleryItem = {
  _key: string
  photo?: ImageWithAlt
  name: string
  followers?: string
}

export type LandingPageContent = {
  hero?: {
    badge?: string
    headline?: string
  }
  galleryItems?: GalleryItem[]
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: ImageWithAlt
  }
}

const imageProjection = `{
  alt,
  caption,
  asset->{
    url
  }
}`

export async function getLandingPage(): Promise<LandingPageContent | null> {
  return sanityClient.fetch<LandingPageContent | null>(`
    *[_type == "landingPage" && _id == "landingPage"][0]{
      hero{
        badge,
        headline
      },
      galleryItems[]{
        _key,
        photo ${imageProjection},
        name,
        followers
      },
      seo{
        metaTitle,
        metaDescription,
        ogImage ${imageProjection}
      }
    }
  `)
}

export function getImageUrl(image: ImageWithAlt | undefined, width: number): string | undefined {
  if (!image?.asset) return undefined
  return urlForImage(image as SanityImageSource).width(width).auto('format').fit('max').url()
}

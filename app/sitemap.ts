import type { MetadataRoute } from 'next'

// Sistema interno (acesso exclusivo por login). Sitemap vazio para não expor URLs.
export default function sitemap(): MetadataRoute.Sitemap {
  return []
}

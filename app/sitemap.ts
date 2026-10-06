import type { MetadataRoute } from "next";
import { listArtworks } from "@/lib/artworks";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  const artworks = await listArtworks({});

  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/artworks`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/artist`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/inquiry`, changeFrequency: "yearly", priority: 0.4 },
    ...artworks.map((art) => ({
      url: `${base}/artworks/${art.id}`,
      lastModified: new Date(art.createdAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
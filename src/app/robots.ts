import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://allkit.dev";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/v1/"],
        disallow: ["/api/ai/", "/api/stripe/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

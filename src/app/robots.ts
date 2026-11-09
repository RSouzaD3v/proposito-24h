import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/writer", "/reader/area", "/reader/account", "/app", "/redirector", "/api"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}

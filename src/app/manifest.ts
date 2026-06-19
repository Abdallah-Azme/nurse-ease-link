import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CareConnect",
    short_name: "CareConnect",
    description: "Connected care for patients and clinical teams.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fcfb",
    theme_color: "#338b89",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/notification-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}

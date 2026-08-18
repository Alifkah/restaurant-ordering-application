import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nusantara Artisan Kitchen & Lounge",
    short_name: "Nusantara",
    description:
      "Aplikasi pemesanan hidangan autentik nusantara dengan pelacakan realtime.",
    start_url: "/",
    display: "standalone",
    background_color: "#F9F6F0",
    theme_color: "#D9531E",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SpeakGround",
    short_name: "SpeakGround",
    description: "A daily English set built for your level.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfdfc",
    theme_color: "#1f8a76",
  };
}

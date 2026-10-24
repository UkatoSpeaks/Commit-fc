import { ImageResponse } from "next/og";
import { ShieldIcon } from "@/components/ui/shield-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS rounds the corners itself, so the background is a full square.
export default function AppleIcon() {
  return new ImageResponse(<ShieldIcon size={size.width} radius={0} />, size);
}

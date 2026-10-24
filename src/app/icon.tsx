import { ImageResponse } from "next/og";
import { ShieldIcon } from "@/components/ui/shield-icon";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<ShieldIcon size={size.width} radius={6} />, size);
}

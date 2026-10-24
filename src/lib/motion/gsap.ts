"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

// Register once. useGSAP reverts every tween/timeline it creates on unmount.
gsap.registerPlugin(useGSAP);

export { gsap, useGSAP };

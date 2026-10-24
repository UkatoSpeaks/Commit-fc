import { Suspense } from "react";
import { DebugCards } from "./DebugCards";

export default function DebugCardsPage() {
  return (
    <Suspense>
      <DebugCards />
    </Suspense>
  );
}

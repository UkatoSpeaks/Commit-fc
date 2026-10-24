import { Logo } from "@/components/ui/Logo";
import { UsernameForm } from "@/components/ui/UsernameForm";

export function PageNav() {
  return (
    <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
      <Logo />
      <UsernameForm variant="compact" />
    </header>
  );
}

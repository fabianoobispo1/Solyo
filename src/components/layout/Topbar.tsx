import { Button } from "@/components/ui/Button";

export interface TopbarProps {
  greetingName: string;
}

export function Topbar({ greetingName }: TopbarProps) {
  return (
    <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-neutral-border bg-neutral-surface px-8">
      <h1 className="font-display text-lg font-semibold tracking-[-0.3px] text-neutral-heading">
        Bem-vindo(a) de volta, {greetingName}
      </h1>
      <Button variant="primary" size="sm">
        + Novo cliente
      </Button>
    </header>
  );
}

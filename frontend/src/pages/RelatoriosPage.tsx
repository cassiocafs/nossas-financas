import { EmptyState } from "@/components/shared/EmptyState";

export function RelatoriosPage() {
  return (
    <div className="pt-4 sm:pt-6 lg:pt-8">
      <EmptyState mood="thinking" title="Em breve">
        Os relatórios detalhados ainda estão a caminho.
      </EmptyState>
    </div>
  );
}

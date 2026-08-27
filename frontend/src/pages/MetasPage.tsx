import { EmptyState } from "@/components/shared/EmptyState";

export function MetasPage() {
  return (
    <div className="pt-4 sm:pt-6 lg:pt-8">
      <EmptyState mood="thinking" title="Em breve">
        A gestão completa de metas ainda está a caminho. Por enquanto, acompanhe o resumo na tela
        inicial.
      </EmptyState>
    </div>
  );
}

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { importarTransacoesXls, type ResultadoImportacao } from "@/api/importacao";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function ImportarExtratoSection() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null);

  const mutation = useMutation({
    mutationFn: importarTransacoesXls,
    onSuccess: (dados) => {
      setResultado(dados);
      queryClient.invalidateQueries({ queryKey: ["contas"] });
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      queryClient.invalidateQueries({ queryKey: ["transacoes"] });
    },
  });

  function onArquivoSelecionado(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setResultado(null);
    mutation.mutate(arquivo);
    e.target.value = "";
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink dark:text-paper">
          Importar transações
        </h2>
        <p className="text-sm text-ink/50 dark:text-paper/50">
          Envie um extrato em XLS/XLSX com as colunas Data Ocorrência, Descrição, Valor,
          Categoria e Conta. Contas e categorias novas são criadas automaticamente, e
          transações já importadas anteriormente são ignoradas.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".xls,.xlsx"
        onChange={onArquivoSelecionado}
        className="hidden"
      />
      <Button onClick={() => inputRef.current?.click()} disabled={mutation.isPending}>
        {mutation.isPending ? "Importando..." : "Escolher arquivo"}
      </Button>

      {mutation.isError && (
        <p className="text-sm text-vermelho dark:text-vermelho-night">
          {mutation.error instanceof Error ? mutation.error.message : "Erro ao importar arquivo"}
        </p>
      )}

      {resultado && (
        <Card className="space-y-2 p-4 text-sm">
          <p className="text-ink dark:text-paper">
            <span className="font-medium">{resultado.importadas}</span> de{" "}
            {resultado.totalLinhas} transações importadas.
          </p>
          {resultado.duplicadasIgnoradas > 0 && (
            <p className="text-ink/60 dark:text-paper/60">
              {resultado.duplicadasIgnoradas} já existiam e foram ignoradas.
            </p>
          )}
          {resultado.contasCriadas.length > 0 && (
            <p className="text-ink/60 dark:text-paper/60">
              Contas criadas: {resultado.contasCriadas.join(", ")}
            </p>
          )}
          {resultado.categoriasCriadas.length > 0 && (
            <p className="text-ink/60 dark:text-paper/60">
              Categorias criadas: {resultado.categoriasCriadas.join(", ")}
            </p>
          )}
          {resultado.erros.length > 0 && (
            <div className="text-vermelho dark:text-vermelho-night">
              <p>{resultado.erros.length} linha(s) não importada(s):</p>
              <ul className="ml-4 list-disc">
                {resultado.erros.slice(0, 10).map((erro) => (
                  <li key={erro.linha}>
                    Linha {erro.linha}: {erro.motivo}
                  </li>
                ))}
              </ul>
              {resultado.erros.length > 10 && (
                <p>e mais {resultado.erros.length - 10}...</p>
              )}
            </div>
          )}
        </Card>
      )}
    </section>
  );
}

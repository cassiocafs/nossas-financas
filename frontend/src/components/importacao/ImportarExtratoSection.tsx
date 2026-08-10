import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  importarTransacoesXls,
  previewImportacaoXls,
  type PreviewImportacao,
  type ResultadoImportacao,
} from "@/api/importacao";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Valor } from "@/components/ui/Valor";
import { formatarData } from "@/lib/format";

const LIMITE_LINHAS_EXIBIDAS = 100;

const rotuloStatus: Record<PreviewImportacao["linhas"][number]["status"], string> = {
  nova: "Nova",
  invalida: "Inválida",
};

const corStatus: Record<PreviewImportacao["linhas"][number]["status"], string> = {
  nova: "text-primary",
  invalida: "text-destructive",
};

export function ImportarExtratoSection() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [previewAberto, setPreviewAberto] = useState(false);
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null);
  const [progresso, setProgresso] = useState<{ processadas: number; total: number } | null>(
    null,
  );

  const previewMutation = useMutation({
    mutationFn: previewImportacaoXls,
    onSuccess: () => setPreviewAberto(true),
  });

  const importMutation = useMutation({
    mutationFn: (arquivos: File[]) =>
      importarTransacoesXls(arquivos, (processadas, total) =>
        setProgresso({ processadas, total }),
      ),
    onSuccess: (dados) => {
      setResultado(dados);
      setPreviewAberto(false);
      setArquivos([]);
      setProgresso(null);
      queryClient.invalidateQueries({ queryKey: ["contas"] });
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      queryClient.invalidateQueries({ queryKey: ["transacoes"] });
    },
    onError: () => setProgresso(null),
  });

  function onArquivoSelecionado(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivosSelecionados = Array.from(e.target.files ?? []);
    if (arquivosSelecionados.length === 0) return;
    setResultado(null);
    setArquivos(arquivosSelecionados);
    importMutation.reset();
    previewMutation.mutate(arquivosSelecionados);
    e.target.value = "";
  }

  function cancelarPreview() {
    setPreviewAberto(false);
    setArquivos([]);
    previewMutation.reset();
    importMutation.reset();
  }

  function confirmarImportacao() {
    if (arquivos.length === 0) return;
    setProgresso({ processadas: 0, total: preview?.totalLinhas ?? 0 });
    importMutation.mutate(arquivos);
  }

  const preview = previewMutation.data;
  const multiplosArquivos = arquivos.length > 1;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Importar transações
        </h2>
        <p className="text-sm text-muted-foreground">
          Envie um ou mais extratos em XLS/XLSX com as colunas Data Ocorrência, Descrição,
          Valor, Categoria e Conta. Contas e categorias novas são criadas automaticamente.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".xls,.xlsx"
        multiple
        onChange={onArquivoSelecionado}
        className="hidden"
      />
      <Button
        onClick={() => inputRef.current?.click()}
        disabled={previewMutation.isPending || importMutation.isPending}
      >
        {previewMutation.isPending ? "Analisando arquivos..." : "Escolher arquivo(s)"}
      </Button>

      {previewMutation.isPending && <ProgressBar label="Analisando arquivo(s)..." />}

      {previewMutation.isError && (
        <p className="text-sm text-destructive">
          {previewMutation.error instanceof Error
            ? previewMutation.error.message
            : "Erro ao analisar arquivo"}
        </p>
      )}

      {resultado && (
        <Card className="space-y-2 p-4 text-sm">
          <p className="text-foreground">
            <span className="font-medium">{resultado.importadas}</span> de{" "}
            {resultado.totalLinhas} transações importadas.
          </p>
          {resultado.contasCriadas.length > 0 && (
            <p className="text-muted-foreground">
              Contas criadas: {resultado.contasCriadas.join(", ")}
            </p>
          )}
          {resultado.categoriasCriadas.length > 0 && (
            <p className="text-muted-foreground">
              Categorias criadas: {resultado.categoriasCriadas.join(", ")}
            </p>
          )}
          {resultado.erros.length > 0 && (
            <div className="text-destructive">
              <p>{resultado.erros.length} linha(s) não importada(s):</p>
              <ul className="ml-4 list-disc">
                {resultado.erros.slice(0, 10).map((erro) => (
                  <li key={`${erro.arquivo}-${erro.linha}`}>
                    {erro.arquivo ? `${erro.arquivo} — ` : ""}
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

      {previewAberto && preview && (
        <Card className="space-y-4 p-4">
          <h3 className="text-base font-semibold text-foreground">
            Confirme a importação
          </h3>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground/70">
              <span>
                <span className="font-medium text-primary">
                  {preview.novas}
                </span>{" "}
                nova(s)
              </span>
              {preview.invalidas > 0 && (
                <span>
                  <span className="font-medium text-destructive">
                    {preview.invalidas}
                  </span>{" "}
                  inválida(s)
                </span>
              )}
              <span>de {preview.totalLinhas} linha(s) no total</span>
            </div>

            {preview.contasNovas.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Contas novas: {preview.contasNovas.join(", ")}
              </p>
            )}
            {preview.categoriasNovas.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Categorias novas: {preview.categoriasNovas.join(", ")}
              </p>
            )}

            <div className="max-h-80 overflow-y-auto rounded-md border border-input">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-input text-muted-foreground">
                    {multiplosArquivos && (
                      <th className="px-3 py-2 font-medium">Arquivo</th>
                    )}
                    <th className="px-3 py-2 font-medium">Data</th>
                    <th className="px-3 py-2 font-medium">Descrição</th>
                    <th className="px-3 py-2 font-medium">Conta</th>
                    <th className="px-3 py-2 font-medium">Categoria</th>
                    <th className="px-3 py-2 text-right font-medium">Valor</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.linhas.slice(0, LIMITE_LINHAS_EXIBIDAS).map((linha) => (
                    <tr
                      key={`${linha.arquivo}-${linha.linha}`}
                      className="border-b border-input/60 last:border-0/60"
                    >
                      {multiplosArquivos && (
                        <td className="whitespace-nowrap px-3 py-2 text-foreground/80">
                          {linha.arquivo}
                        </td>
                      )}
                      <td className="whitespace-nowrap px-3 py-2 text-foreground/80">
                        {linha.data ? formatarData(linha.data) : "—"}
                      </td>
                      <td className="px-3 py-2 text-foreground/80">
                        {linha.descricao || "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-foreground/80">
                        {linha.conta || "—"}
                        {linha.contaNova && (
                          <span className="ml-1 text-xs text-primary">
                            (nova)
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-foreground/80">
                        {linha.categoria ?? "—"}
                        {linha.categoriaNova && (
                          <span className="ml-1 text-xs text-primary">
                            (nova)
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right">
                        <Valor valor={linha.valor} />
                      </td>
                      <td className={`whitespace-nowrap px-3 py-2 ${corStatus[linha.status]}`}>
                        {rotuloStatus[linha.status]}
                        {linha.motivo && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({linha.motivo})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.linhas.length > LIMITE_LINHAS_EXIBIDAS && (
              <p className="text-sm text-muted-foreground">
                e mais {preview.linhas.length - LIMITE_LINHAS_EXIBIDAS} linha(s)...
              </p>
            )}

            {importMutation.isPending && progresso && (
              <ProgressBar
                label={`Importando ${progresso.processadas} de ${progresso.total} linha(s)...`}
                progresso={
                  progresso.total > 0 ? (progresso.processadas / progresso.total) * 100 : 0
                }
              />
            )}

            {importMutation.isError && (
              <p className="text-sm text-destructive">
                {importMutation.error instanceof Error
                  ? importMutation.error.message
                  : "Erro ao importar arquivo"}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={cancelarPreview} disabled={importMutation.isPending}>
                Cancelar
              </Button>
              <Button
                onClick={confirmarImportacao}
                disabled={preview.novas === 0 || importMutation.isPending}
              >
                {importMutation.isPending
                  ? "Importando..."
                  : `Importar ${preview.novas} transação(ões)`}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </section>
  );
}

import { ChevronLeft } from "lucide-react";
import { Link } from "react-router";
import logoHorizontal from "@/assets/brand/logo-horizontal.png";

const ATUALIZADO_EM = "25 de agosto de 2026";

export function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Voltar
          </Link>
          <img src={logoHorizontal} alt="Poupeu" className="h-8 w-auto" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Política de Privacidade</h1>
          <p className="text-sm text-muted-foreground">Última atualização: {ATUALIZADO_EM}</p>
        </div>

        <div className="card-surface space-y-6 p-6 text-sm leading-relaxed text-foreground/90 sm:p-8">
          <p>
            O Poupeu é um aplicativo de gestão financeira pessoal e familiar. Esta política
            explica quais dados coletamos, como usamos, com quem compartilhamos e quais direitos
            você tem sobre eles, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei
            nº 13.709/2018).
          </p>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">1. Quem trata seus dados</h2>
            <p>
              O Poupeu é o responsável (controlador) pelo tratamento dos dados descritos nesta
              política. Dúvidas ou solicitações podem ser enviadas para{" "}
              <a href="mailto:privacidade@nossasfinancas.app" className="underline">
                privacidade@nossasfinancas.app
              </a>
              .
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">2. Quais dados coletamos</h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong>Dados de cadastro:</strong> nome, e-mail e senha, usados para criar e
                autenticar sua conta. A senha é gerenciada pelo Supabase Auth — nunca temos acesso
                a ela em texto simples.
              </li>
              <li>
                <strong>Dados financeiros que você informa:</strong> contas, transações,
                categorias, orçamentos e regras de categorização cadastrados por você para o
                funcionamento do app.
              </li>
              <li>
                <strong>Arquivos de extrato importados:</strong> planilhas ou extratos enviados
                para importação são processados em memória apenas para gerar as transações
                sugeridas e não ficam armazenados em nossos servidores após o processamento.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">3. Como usamos seus dados</h2>
            <p>Usamos os dados coletados exclusivamente para:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Autenticar seu acesso e manter sua sessão;</li>
              <li>Exibir, organizar e calcular suas informações financeiras (saldos, orçamento, categorização automática);</li>
              <li>Processar a importação de extratos bancários que você envia;</li>
              <li>
                Enviar e-mails transacionais, como convites para um Espaço Financeiro
                compartilhado ou recuperação de senha.
              </li>
            </ul>
            <p>
              Não utilizamos seus dados para publicidade, não vendemos dados a terceiros e não
              usamos ferramentas de rastreamento ou analytics de terceiros dentro do app.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">4. Compartilhamento com terceiros</h2>
            <p>Compartilhamos dados apenas com prestadores de serviço essenciais ao funcionamento do app:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong>Supabase:</strong> autenticação e hospedagem do banco de dados
                (PostgreSQL) onde suas informações ficam armazenadas.
              </li>
              <li>
                <strong>Resend:</strong> envio de e-mails transacionais (convites, recuperação de
                senha).
              </li>
            </ul>
            <p>Esses prestadores tratam os dados em nosso nome e não podem usá-los para fins próprios.</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">5. Compartilhamento entre usuários</h2>
            <p>
              O Poupeu permite criar Espaços Financeiros compartilhados. Ao convidar outra pessoa
              para um Espaço, os dados financeiros daquele Espaço (contas, transações, categorias
              e orçamento) ficam visíveis para os membros convidados. Você controla quem participa
              de cada Espaço.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">6. Armazenamento e segurança</h2>
            <p>
              Seus dados são armazenados em banco de dados hospedado no Supabase, com conexões
              criptografadas (HTTPS/TLS). A autenticação é feita por tokens gerenciados pelo
              Supabase Auth. Adotamos medidas técnicas razoáveis para proteger seus dados contra
              acesso não autorizado, perda ou alteração indevida.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">7. Retenção e exclusão</h2>
            <p>
              Mantemos seus dados enquanto sua conta estiver ativa. Você pode solicitar a exclusão
              da sua conta e dos dados associados a qualquer momento pelo canal de contato
              informado acima; a exclusão é realizada em prazo razoável, ressalvadas informações
              que precisemos manter por obrigação legal.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">8. Seus direitos (LGPD)</h2>
            <p>Você pode, a qualquer momento, solicitar:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Confirmação de que tratamos seus dados e acesso a eles;</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
              <li>Portabilidade dos dados a outro fornecedor de serviço;</li>
              <li>Eliminação dos dados tratados com seu consentimento;</li>
              <li>Informação sobre com quem compartilhamos seus dados;</li>
              <li>Revogação do consentimento e exclusão da conta.</li>
            </ul>
            <p>
              Para exercer qualquer um desses direitos, entre em contato pelo e-mail informado na
              seção 1.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">9. Cookies e armazenamento local</h2>
            <p>
              Usamos apenas armazenamento local técnico necessário para manter sua sessão
              autenticada (via Supabase Auth). Não usamos cookies de rastreamento ou publicidade.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">10. Menores de idade</h2>
            <p>O Poupeu não é direcionado a menores de 18 anos sem supervisão de um responsável legal.</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">11. Alterações nesta política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Mudanças relevantes serão
              comunicadas dentro do app. A data no topo desta página indica a última atualização.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

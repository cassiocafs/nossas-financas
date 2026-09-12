import { ChevronLeft } from "lucide-react";
import { Link } from "react-router";
import logoHorizontal from "@/assets/brand/logo-horizontal.png";

const ATUALIZADO_EM = "12 de setembro de 2026";

export function TermosPage() {
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
          <h1 className="text-2xl font-semibold text-foreground">Termos de Uso</h1>
          <p className="text-sm text-muted-foreground">Última atualização: {ATUALIZADO_EM}</p>
        </div>

        <div className="card-surface space-y-6 p-6 text-sm leading-relaxed text-foreground/90 sm:p-8">
          <p>
            Estes Termos de Uso regulam o acesso e uso do Poupeu, aplicativo de gestão financeira
            pessoal e familiar. Ao criar uma conta ou usar o app, você concorda com os termos
            abaixo. Se você não concordar, não utilize o Poupeu.
          </p>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">1. Descrição do serviço</h2>
            <p>
              O Poupeu é uma ferramenta para organização de finanças pessoais: registro de contas,
              transações, categorias, orçamento e metas, incluindo importação de extratos
              bancários para facilitar o lançamento de transações. O uso das funcionalidades pode
              ser ampliado ou alterado ao longo do tempo.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">2. Cadastro e conta</h2>
            <p>
              Para usar o Poupeu é necessário criar uma conta com nome, e-mail e senha, ou entrar
              com sua conta Google. Você é responsável por manter suas credenciais em sigilo e por
              todas as atividades realizadas na sua conta. Informe dados verdadeiros e mantenha-os
              atualizados.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">3. Uso adequado</h2>
            <p>Ao usar o Poupeu, você concorda em não:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Utilizar o app para fins ilícitos ou fraudulentos;</li>
              <li>Tentar acessar contas de outros usuários ou dados aos quais não tenha permissão;</li>
              <li>Interferir no funcionamento do app ou tentar contornar suas medidas de segurança;</li>
              <li>Enviar arquivos de importação que não sejam extratos ou planilhas legítimas.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">4. Espaços financeiros compartilhados</h2>
            <p>
              O Poupeu permite criar Espaços Financeiros e convidar outras pessoas para
              compartilhá-los. Ao convidar alguém, você autoriza que essa pessoa visualize e, a
              depender da permissão concedida, edite os dados financeiros daquele Espaço. Você é
              responsável por decidir quem convida e por gerenciar essas permissões.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">5. Importação de extratos</h2>
            <p>
              A importação de extratos é um recurso de apoio para agilizar o lançamento de
              transações. As transações sugeridas a partir do arquivo importado podem ser revisadas
              e corrigidas por você antes de serem confirmadas; o Poupeu não garante que a leitura
              automática do arquivo será livre de erros.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">6. Não é aconselhamento financeiro</h2>
            <p>
              O Poupeu é uma ferramenta de organização e visualização de dados financeiros
              informados por você. Ele não presta consultoria, recomendação de investimentos ou
              qualquer forma de aconselhamento financeiro, contábil ou tributário. Decisões
              financeiras tomadas com base nas informações do app são de sua exclusiva
              responsabilidade.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">7. Disponibilidade do serviço</h2>
            <p>
              Fazemos esforços razoáveis para manter o Poupeu disponível e funcionando
              corretamente, mas não garantimos operação ininterrupta ou livre de falhas. O app pode
              passar por manutenções, instabilidades ou indisponibilidades temporárias.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">8. Propriedade intelectual</h2>
            <p>
              O nome Poupeu, sua marca, layout, código e demais elementos do app são de propriedade
              do Poupeu ou de seus licenciadores. Estes Termos não transferem a você nenhum direito
              de propriedade intelectual sobre o app, apenas uma licença de uso pessoal e não
              exclusiva enquanto sua conta estiver ativa.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">9. Seus dados</h2>
            <p>
              O tratamento dos seus dados pessoais e financeiros é descrito na nossa{" "}
              <Link to="/privacidade" className="underline">
                Política de Privacidade
              </Link>
              , que integra estes Termos de Uso.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">10. Cancelamento e encerramento</h2>
            <p>
              Você pode encerrar sua conta a qualquer momento pelas configurações do app ou pelo
              canal de contato informado na Política de Privacidade. Podemos suspender ou encerrar
              contas que violem estes Termos, mediante aviso quando possível.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">11. Alterações nestes termos</h2>
            <p>
              Podemos atualizar estes Termos periodicamente. Mudanças relevantes serão comunicadas
              dentro do app. A data no topo desta página indica a última atualização. O uso
              continuado do Poupeu após uma alteração implica concordância com os novos termos.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">12. Contato</h2>
            <p>
              Dúvidas sobre estes Termos podem ser enviadas para{" "}
              <a href="mailto:privacidade@poupeu.app" className="underline">
                privacidade@poupeu.app
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

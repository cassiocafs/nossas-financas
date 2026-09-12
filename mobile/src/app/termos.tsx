import { Feather } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const ATUALIZADO_EM = '12 de setembro de 2026';

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <ThemedView style={styles.secao}>
      <ThemedText type="smallBold">{titulo}</ThemedText>
      {children}
    </ThemedView>
  );
}

export default function TermosScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <ThemedView style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/login'))}
            hitSlop={12}
            style={styles.voltarBotao}>
            <Feather name="chevron-left" size={22} color={theme.text} />
            <ThemedText type="default">Voltar</ThemedText>
          </Pressable>
        </ThemedView>

        <ScrollView contentContainerStyle={styles.scroll}>
          <ThemedText type="title">Termos de Uso</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Última atualização: {ATUALIZADO_EM}
          </ThemedText>

          <ThemedText type="small" style={styles.paragrafo}>
            Estes Termos de Uso regulam o acesso e uso do Poupeu, aplicativo de gestão financeira
            pessoal e familiar. Ao criar uma conta ou usar o app, você concorda com os termos
            abaixo. Se você não concordar, não utilize o Poupeu.
          </ThemedText>

          <Secao titulo="1. Descrição do serviço">
            <ThemedText type="small" style={styles.paragrafo}>
              O Poupeu é uma ferramenta para organização de finanças pessoais: registro de contas,
              transações, categorias, orçamento e metas, incluindo importação de extratos
              bancários para facilitar o lançamento de transações. O uso das funcionalidades pode
              ser ampliado ou alterado ao longo do tempo.
            </ThemedText>
          </Secao>

          <Secao titulo="2. Cadastro e conta">
            <ThemedText type="small" style={styles.paragrafo}>
              Para usar o Poupeu é necessário criar uma conta com nome, e-mail e senha, ou entrar
              com sua conta Google. Você é responsável por manter suas credenciais em sigilo e por
              todas as atividades realizadas na sua conta. Informe dados verdadeiros e mantenha-os
              atualizados.
            </ThemedText>
          </Secao>

          <Secao titulo="3. Uso adequado">
            <ThemedText type="small" style={styles.paragrafo}>
              Ao usar o Poupeu, você concorda em não: utilizar o app para fins ilícitos ou
              fraudulentos; tentar acessar contas de outros usuários ou dados aos quais não tenha
              permissão; interferir no funcionamento do app ou tentar contornar suas medidas de
              segurança; enviar arquivos de importação que não sejam extratos ou planilhas
              legítimas.
            </ThemedText>
          </Secao>

          <Secao titulo="4. Espaços financeiros compartilhados">
            <ThemedText type="small" style={styles.paragrafo}>
              O Poupeu permite criar Espaços Financeiros e convidar outras pessoas para
              compartilhá-los. Ao convidar alguém, você autoriza que essa pessoa visualize e, a
              depender da permissão concedida, edite os dados financeiros daquele Espaço. Você é
              responsável por decidir quem convida e por gerenciar essas permissões.
            </ThemedText>
          </Secao>

          <Secao titulo="5. Importação de extratos">
            <ThemedText type="small" style={styles.paragrafo}>
              A importação de extratos é um recurso de apoio para agilizar o lançamento de
              transações. As transações sugeridas a partir do arquivo importado podem ser
              revisadas e corrigidas por você antes de serem confirmadas; o Poupeu não garante que
              a leitura automática do arquivo será livre de erros.
            </ThemedText>
          </Secao>

          <Secao titulo="6. Não é aconselhamento financeiro">
            <ThemedText type="small" style={styles.paragrafo}>
              O Poupeu é uma ferramenta de organização e visualização de dados financeiros
              informados por você. Ele não presta consultoria, recomendação de investimentos ou
              qualquer forma de aconselhamento financeiro, contábil ou tributário. Decisões
              financeiras tomadas com base nas informações do app são de sua exclusiva
              responsabilidade.
            </ThemedText>
          </Secao>

          <Secao titulo="7. Disponibilidade do serviço">
            <ThemedText type="small" style={styles.paragrafo}>
              Fazemos esforços razoáveis para manter o Poupeu disponível e funcionando
              corretamente, mas não garantimos operação ininterrupta ou livre de falhas. O app pode
              passar por manutenções, instabilidades ou indisponibilidades temporárias.
            </ThemedText>
          </Secao>

          <Secao titulo="8. Propriedade intelectual">
            <ThemedText type="small" style={styles.paragrafo}>
              O nome Poupeu, sua marca, layout, código e demais elementos do app são de
              propriedade do Poupeu ou de seus licenciadores. Estes Termos não transferem a você
              nenhum direito de propriedade intelectual sobre o app, apenas uma licença de uso
              pessoal e não exclusiva enquanto sua conta estiver ativa.
            </ThemedText>
          </Secao>

          <Secao titulo="9. Seus dados">
            <ThemedText type="small" style={styles.paragrafo}>
              O tratamento dos seus dados pessoais e financeiros é descrito na nossa{' '}
              <Link href="/privacidade">
                <ThemedText type="linkPrimary">Política de Privacidade</ThemedText>
              </Link>
              , que integra estes Termos de Uso.
            </ThemedText>
          </Secao>

          <Secao titulo="10. Cancelamento e encerramento">
            <ThemedText type="small" style={styles.paragrafo}>
              Você pode encerrar sua conta a qualquer momento pelas configurações do app ou pelo
              canal de contato informado na Política de Privacidade. Podemos suspender ou encerrar
              contas que violem estes Termos, mediante aviso quando possível.
            </ThemedText>
          </Secao>

          <Secao titulo="11. Alterações nestes termos">
            <ThemedText type="small" style={styles.paragrafo}>
              Podemos atualizar estes Termos periodicamente. Mudanças relevantes serão comunicadas
              dentro do app. A data no topo desta tela indica a última atualização. O uso
              continuado do Poupeu após uma alteração implica concordância com os novos termos.
            </ThemedText>
          </Secao>

          <Secao titulo="12. Contato">
            <ThemedText type="small" style={styles.paragrafo}>
              Dúvidas sobre estes Termos podem ser enviadas para privacidade@poupeu.app.
            </ThemedText>
          </Secao>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  voltarBotao: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  scroll: { padding: Spacing.four, gap: Spacing.two, paddingBottom: Spacing.six * 2 },
  secao: { gap: Spacing.one, marginTop: Spacing.three },
  paragrafo: { marginTop: 2 },
});

import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const ATUALIZADO_EM = '25 de agosto de 2026';

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <ThemedView style={styles.secao}>
      <ThemedText type="smallBold">{titulo}</ThemedText>
      {children}
    </ThemedView>
  );
}

export default function PrivacidadeScreen() {
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
          <ThemedText type="title">Política de Privacidade</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Última atualização: {ATUALIZADO_EM}
          </ThemedText>

          <ThemedText type="small" style={styles.paragrafo}>
            O Poupeu é um aplicativo de gestão financeira pessoal e familiar. Esta política
            explica quais dados coletamos, como usamos, com quem compartilhamos e quais direitos
            você tem sobre eles, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei
            nº 13.709/2018).
          </ThemedText>

          <Secao titulo="1. Quem trata seus dados">
            <ThemedText type="small" style={styles.paragrafo}>
              O Poupeu é o responsável (controlador) pelo tratamento dos dados descritos nesta
              política. Dúvidas ou solicitações podem ser enviadas para privacidade@nossasfinancas.app.
            </ThemedText>
          </Secao>

          <Secao titulo="2. Quais dados coletamos">
            <ThemedText type="small" style={styles.paragrafo}>
              • Dados de cadastro: nome, e-mail e senha, usados para criar e autenticar sua conta.
              A senha é gerenciada pelo Supabase Auth — nunca temos acesso a ela em texto simples.
              {'\n\n'}• Dados financeiros que você informa: contas, transações, categorias,
              orçamentos e regras de categorização cadastrados por você para o funcionamento do
              app.
              {'\n\n'}• Arquivos de extrato importados: planilhas ou extratos enviados para
              importação são processados em memória apenas para gerar as transações sugeridas e
              não ficam armazenados em nossos servidores após o processamento.
            </ThemedText>
          </Secao>

          <Secao titulo="3. Como usamos seus dados">
            <ThemedText type="small" style={styles.paragrafo}>
              Usamos os dados coletados para autenticar seu acesso, exibir e calcular suas
              informações financeiras (saldos, orçamento, categorização automática), processar a
              importação de extratos e enviar e-mails transacionais (convites para um Espaço
              Financeiro compartilhado, recuperação de senha).
              {'\n\n'}Não utilizamos seus dados para publicidade, não vendemos dados a terceiros e
              não usamos ferramentas de rastreamento ou analytics de terceiros dentro do app.
            </ThemedText>
          </Secao>

          <Secao titulo="4. Compartilhamento com terceiros">
            <ThemedText type="small" style={styles.paragrafo}>
              Compartilhamos dados apenas com prestadores de serviço essenciais ao funcionamento
              do app: Supabase (autenticação e hospedagem do banco de dados) e Resend (envio de
              e-mails transacionais). Esses prestadores tratam os dados em nosso nome e não podem
              usá-los para fins próprios.
            </ThemedText>
          </Secao>

          <Secao titulo="5. Compartilhamento entre usuários">
            <ThemedText type="small" style={styles.paragrafo}>
              O Poupeu permite criar Espaços Financeiros compartilhados. Ao convidar outra pessoa
              para um Espaço, os dados financeiros daquele Espaço ficam visíveis para os membros
              convidados. Você controla quem participa de cada Espaço.
            </ThemedText>
          </Secao>

          <Secao titulo="6. Armazenamento e segurança">
            <ThemedText type="small" style={styles.paragrafo}>
              Seus dados são armazenados em banco de dados hospedado no Supabase, com conexões
              criptografadas (HTTPS/TLS). Adotamos medidas técnicas razoáveis para proteger seus
              dados contra acesso não autorizado, perda ou alteração indevida.
            </ThemedText>
          </Secao>

          <Secao titulo="7. Retenção e exclusão">
            <ThemedText type="small" style={styles.paragrafo}>
              Mantemos seus dados enquanto sua conta estiver ativa. Você pode solicitar a exclusão
              da sua conta e dos dados associados a qualquer momento pelo e-mail de contato; a
              exclusão é realizada em prazo razoável, ressalvadas informações que precisemos
              manter por obrigação legal.
            </ThemedText>
          </Secao>

          <Secao titulo="8. Seus direitos (LGPD)">
            <ThemedText type="small" style={styles.paragrafo}>
              Você pode solicitar, a qualquer momento: confirmação do tratamento e acesso aos
              dados; correção de dados incompletos ou desatualizados; anonimização, bloqueio ou
              eliminação de dados desnecessários; portabilidade a outro fornecedor; eliminação dos
              dados tratados com consentimento; informação sobre compartilhamento; e revogação do
              consentimento com exclusão da conta. Basta entrar em contato pelo e-mail informado
              na seção 1.
            </ThemedText>
          </Secao>

          <Secao titulo="9. Armazenamento local no dispositivo">
            <ThemedText type="small" style={styles.paragrafo}>
              O app usa armazenamento local apenas para manter sua sessão autenticada e um cache
              offline das suas informações, permitindo uso sem conexão. Não usamos rastreamento ou
              publicidade.
            </ThemedText>
          </Secao>

          <Secao titulo="10. Menores de idade">
            <ThemedText type="small" style={styles.paragrafo}>
              O Poupeu não é direcionado a menores de 18 anos sem supervisão de um responsável
              legal.
            </ThemedText>
          </Secao>

          <Secao titulo="11. Alterações nesta política">
            <ThemedText type="small" style={styles.paragrafo}>
              Podemos atualizar esta política periodicamente. Mudanças relevantes serão
              comunicadas dentro do app. A data no topo desta tela indica a última atualização.
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

/**
 * O Supabase Auth devolve mensagens de erro em inglês (vindas do GoTrue). Esse
 * mapa traduz as mais comuns para português; o que não bate com nada cai no
 * `fallback` passado pelo chamador.
 */
const MAPA_ERROS: { teste: RegExp; mensagem: string }[] = [
  { teste: /invalid login credentials/i, mensagem: 'E-mail ou senha inválidos.' },
  { teste: /email not confirmed/i, mensagem: 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.' },
  { teste: /user already registered/i, mensagem: 'Este e-mail já está cadastrado.' },
  { teste: /password should be at least/i, mensagem: 'A senha deve ter pelo menos 6 caracteres.' },
  { teste: /unable to validate email address/i, mensagem: 'E-mail inválido.' },
  { teste: /email rate limit exceeded/i, mensagem: 'Muitas tentativas. Aguarde um instante e tente novamente.' },
  { teste: /for security purposes/i, mensagem: 'Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.' },
  { teste: /user not found/i, mensagem: 'Usuário não encontrado.' },
  { teste: /email link is invalid or has expired/i, mensagem: 'Este link expirou ou é inválido.' },
  { teste: /token has expired or is invalid/i, mensagem: 'Sessão expirada. Tente novamente.' },
  { teste: /network request failed|failed to fetch/i, mensagem: 'Sem conexão com a internet. Verifique sua rede e tente novamente.' },
  { teste: /access_denied/i, mensagem: 'Login cancelado.' },
  { teste: /unable to exchange external code/i, mensagem: 'Não foi possível concluir o login com o Google. Tente novamente em instantes.' },
];

export function traduzirErroAuth(err: unknown, fallback: string): string {
  const mensagemOriginal = err instanceof Error ? err.message : String(err);
  const encontrado = MAPA_ERROS.find((m) => m.teste.test(mensagemOriginal));
  return encontrado ? encontrado.mensagem : fallback;
}

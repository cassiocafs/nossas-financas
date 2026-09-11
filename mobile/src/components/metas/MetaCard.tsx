import { Alert } from 'react-native';

import type { Meta } from '@/api/metas';
import { GoalCard } from '@/components/ui/GoalCard';
import { IconButton } from '@/components/ui/IconButton';
import { useFormatarValor } from '@/hooks/use-formatar-valor';
import { noteDaMeta, toneDaMeta } from '@/lib/metas';

interface MetaCardProps {
  meta: Meta;
  onAbrir?: () => void;
  onEditar?: () => void;
  onAportar?: () => void;
  onArquivar?: () => void;
  onExcluir?: () => void;
}

export function MetaCard({ meta, onAbrir, onEditar, onAportar, onArquivar, onExcluir }: MetaCardProps) {
  const formatarValor = useFormatarValor();
  const temAcoes = onEditar || onAportar || onArquivar || onExcluir;

  function abrirMenu() {
    const botoes: { text: string; style?: 'destructive' | 'cancel'; onPress?: () => void }[] = [];
    if (onAportar) botoes.push({ text: 'Registrar aporte', onPress: onAportar });
    if (onEditar) botoes.push({ text: 'Editar', onPress: onEditar });
    if (onArquivar) botoes.push({ text: meta.arquivada ? 'Desarquivar' : 'Arquivar', onPress: onArquivar });
    if (onExcluir) botoes.push({ text: 'Excluir', style: 'destructive', onPress: onExcluir });
    botoes.push({ text: 'Cancelar', style: 'cancel' });
    Alert.alert(meta.nome, 'O que você quer fazer com esta meta?', botoes);
  }

  return (
    <GoalCard
      name={meta.nome}
      emoji={meta.emoji}
      current={meta.valorAtual}
      target={meta.valorAlvo}
      note={noteDaMeta(meta, formatarValor)}
      tone={toneDaMeta(meta.estado)}
      onPress={onAbrir}
      action={temAcoes ? <IconButton icon="more-vertical" label="Ações da meta" size={32} onPress={abrirMenu} /> : undefined}
    />
  );
}

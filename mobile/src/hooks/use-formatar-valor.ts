import { usePreferences } from '@/contexts/PreferencesContext';
import { formatarValor } from '@/lib/format';

/** Formata valores em BRL respeitando a preferência "ocultar valores" (mostra `R$ ••••••` quando ativa). */
export function useFormatarValor() {
  const { hideValues } = usePreferences();
  return (valor: number) => (hideValues ? 'R$ ••••••' : formatarValor(valor));
}

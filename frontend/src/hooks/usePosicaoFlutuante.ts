import { useEffect, useState, type RefObject } from "react";

interface PosicaoFlutuante {
  top: number;
  left: number;
  width: number;
}

/**
 * Calcula a posição (viewport) de um elemento ancorado, para uso em conteúdo
 * renderizado via portal (ex.: dropdowns que precisam escapar de ancestrais
 * com backdrop-filter/transform, que criam stacking contexts e quebram z-index).
 */
export function usePosicaoFlutuante(
  ancoraRef: RefObject<HTMLElement | null>,
  ativo: boolean,
): PosicaoFlutuante | null {
  const [posicao, setPosicao] = useState<PosicaoFlutuante | null>(null);

  useEffect(() => {
    if (!ativo) {
      setPosicao(null);
      return;
    }

    function atualizar() {
      const el = ancoraRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPosicao({ top: rect.bottom, left: rect.left, width: rect.width });
    }

    atualizar();
    window.addEventListener("scroll", atualizar, true);
    window.addEventListener("resize", atualizar);
    return () => {
      window.removeEventListener("scroll", atualizar, true);
      window.removeEventListener("resize", atualizar);
    };
  }, [ativo, ancoraRef]);

  return posicao;
}

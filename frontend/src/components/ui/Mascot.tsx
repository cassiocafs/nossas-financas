import mascotHappy from "@/assets/mascot/happy.png";
import mascotEncouraging from "@/assets/mascot/encouraging.png";
import mascotThinking from "@/assets/mascot/thinking.png";
import mascotWelcome from "@/assets/mascot/welcome.png";
import mascotStanding from "@/assets/mascot/standing.png";
import mascotCelebrating from "@/assets/mascot/celebrating.png";
import mascotSurprised from "@/assets/mascot/surprised.png";

const MASCOT = {
  happy: mascotHappy,
  encouraging: mascotEncouraging,
  thinking: mascotThinking,
  welcome: mascotWelcome,
  standing: mascotStanding,
  celebrating: mascotCelebrating,
  surprised: mascotSurprised,
} as const;

export type MascotState = keyof typeof MASCOT;

interface MascotProps {
  state?: MascotState;
  size?: number;
  className?: string;
}

/** Mascote do Poupeu. ~200×208px de origem — boa nitidez até ~96px de exibição. */
export function Mascot({ state = "happy", size = 64, className = "" }: MascotProps) {
  return (
    <img
      src={MASCOT[state]}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`shrink-0 object-contain ${className}`}
    />
  );
}

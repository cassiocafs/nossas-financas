import { Image, type ImageStyle, type StyleProp } from 'react-native';

export type MascotState =
  | 'happy'
  | 'encouraging'
  | 'celebrating'
  | 'surprised'
  | 'thinking'
  | 'welcome'
  | 'standing';

const SOURCES: Record<MascotState, number> = {
  happy: require('../../../assets/images/mascot/happy.png'),
  encouraging: require('../../../assets/images/mascot/encouraging.png'),
  celebrating: require('../../../assets/images/mascot/celebrating.png'),
  surprised: require('../../../assets/images/mascot/surprised.png'),
  thinking: require('../../../assets/images/mascot/thinking.png'),
  welcome: require('../../../assets/images/mascot/welcome.png'),
  standing: require('../../../assets/images/mascot/standing.png'),
};

/**
 * O mascote do Poupeu (vira-lata caramelo). Usar só em estados vazios e momentos pontuais
 * (nunca como decoração de interface). Recortes de ~200px — servem bem até ~96 de exibição.
 */
export function Mascot({ state = 'happy', size = 72, style }: { state?: MascotState; size?: number; style?: StyleProp<ImageStyle> }) {
  return <Image source={SOURCES[state]} style={[{ width: size, height: size }, style]} resizeMode="contain" />;
}

import { Feather } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const AVATAR = require('../../../assets/images/mascot/happy.png');

type AppHeaderProps =
  | {
      variant?: 'greeting';
      greeting: string;
      subtitle?: string;
      initial?: string;
      onPressAvatar?: () => void;
      notifications?: number;
      onPressNotifications?: () => void;
      title?: never;
    }
  | {
      variant: 'title';
      title: string;
      greeting?: never;
      subtitle?: never;
      notifications?: number;
      onPressNotifications?: () => void;
    };

/** Cabeçalho do app: avatar do mascote + saudação + subtítulo, ou só um título. */
export function AppHeader(props: AppHeaderProps) {
  const theme = useTheme();

  if (props.variant === 'title') {
    return (
      <View style={[styles.row, styles.titleRow]}>
        <ThemedText type="title">{props.title}</ThemedText>
        {props.notifications !== undefined ? <Bell {...props} /> : null}
      </View>
    );
  }

  const { greeting, subtitle, initial, onPressAvatar } = props;

  return (
    <View style={styles.row}>
      <Pressable onPress={onPressAvatar} accessibilityRole={onPressAvatar ? 'button' : undefined} style={styles.left}>
        <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
          {initial ? (
            <ThemedText type="smallBold" themeColor="primary">
              {initial}
            </ThemedText>
          ) : (
            <Image source={AVATAR} style={styles.avatarImg} resizeMode="contain" />
          )}
        </View>
        <View style={styles.texts}>
          <ThemedText type="subtitle">{greeting}</ThemedText>
          {subtitle ? (
            <ThemedText type="small" themeColor="textSecondary">
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
      </Pressable>
      {props.notifications !== undefined ? <Bell {...props} /> : null}
    </View>
  );
}

function Bell({
  notifications,
  onPressNotifications,
}: {
  notifications?: number;
  onPressNotifications?: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPressNotifications} accessibilityLabel="Notificações" hitSlop={8} style={styles.bell}>
      <Feather name="bell" size={20} color={theme.text} />
      {notifications ? (
        <View style={[styles.badge, { backgroundColor: theme.moneyAlert, borderColor: theme.background }]}>
          <ThemedText type="caption" style={styles.badgeText}>
            {notifications > 9 ? '9+' : String(notifications)}
          </ThemedText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  titleRow: { minHeight: 44 },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flex: 1 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: 40, height: 40 },
  texts: { flex: 1, gap: 1 },
  bell: { padding: 4 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: { color: '#FFFFFF', fontSize: 9, letterSpacing: 0 },
});

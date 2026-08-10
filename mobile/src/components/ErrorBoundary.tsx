import { Component, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Spacing } from '@/constants/theme';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

type ErrorFallbackProps = {
  onReset: () => void;
};

function ErrorFallback({ onReset }: ErrorFallbackProps) {
  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle" style={styles.title}>
          Algo deu errado
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.description}>
          Encontramos um erro inesperado nesta tela. Você pode tentar novamente.
        </ThemedText>

        <Button title="Tentar novamente" onPress={onReset} style={styles.button} />
      </SafeAreaView>
    </ThemedView>
  );
}

/**
 * Error Boundary de render. Precisa ser um class component: é a única forma
 * suportada pelo React para capturar erros lançados durante a renderização
 * dos componentes filhos.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary] erro de renderização capturado:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return <ErrorFallback onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  button: {
    marginTop: Spacing.five,
    paddingHorizontal: Spacing.five,
  },
});

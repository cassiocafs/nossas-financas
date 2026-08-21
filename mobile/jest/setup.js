// Mock global do AsyncStorage para os testes: o módulo nativo não existe fora do app real,
// e vários hooks/contextos de baixo nível (ex.: PreferencesContext) dependem dele.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

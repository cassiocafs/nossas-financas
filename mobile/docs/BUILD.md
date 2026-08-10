# Build e publicação com EAS (Expo Application Services)

> Ver `README.md` para a visão geral do projeto. Este documento cobre apenas a
> infraestrutura de build/publicação do app mobile (Expo Router, Expo ~57).

Este projeto ainda **não está conectado a nenhuma conta Expo/EAS real**. Os
arquivos `mobile/eas.json`, os campos de build em `mobile/app.json` e os
scripts de `mobile/package.json` já estão prontos, mas contêm *placeholders*
(`SEU_USUARIO_EXPO_AQUI`, `SEU_PROJECT_ID_AQUI`, etc.) que precisam ser
substituídos por valores reais na primeira configuração. Este guia mostra o
passo a passo.

## 1. Pré-requisitos

- Node.js e npm instalados (mesma versão usada no restante do monorepo).
- Uma conta gratuita em https://expo.dev (crie uma se ainda não tiver).
- Para builds/publicação iOS: uma conta Apple Developer paga
  (https://developer.apple.com/programs/).
- Para builds/publicação Android: uma conta Google Play Console
  (pagamento único).

## 2. Instalar o EAS CLI

Não é obrigatório instalar globalmente — dá para usar `npx eas-cli` em todo
comando. Mas para uso frequente, instalar global é mais prático:

```bash
npm install -g eas-cli
```

Verifique a versão instalada (o `eas.json` deste projeto exige
`cli.version": ">= 13.2.0"`; ajuste esse mínimo no `eas.json` se a versão
instalada for diferente):

```bash
eas --version
```

## 3. Login na conta Expo

```bash
cd mobile
eas login
```

Isso abre um prompt para usuário/senha (ou token) da conta criada em
expo.dev. Confirme com:

```bash
eas whoami
```

## 4. Configurar o projeto (`eas build:configure`)

Rode a partir da pasta `mobile/`:

```bash
eas build:configure
```

Esse comando:

- Cria um projeto EAS vinculado à sua conta (ou organização) e gera um
  `projectId` real.
- **Substitui automaticamente** o placeholder `extra.eas.projectId` em
  `app.json` pelo ID real gerado.
- Pode também preencher/perguntar sobre o campo `owner` — se preferir, edite
  manualmente `app.json` e troque `"owner": "SEU_USUARIO_EXPO_AQUI"` pelo seu
  usuário ou slug da organização Expo (ex.: `"owner": "nossas-financas"`).
- Detecta as plataformas do projeto e pode ajustar `eas.json` se necessário
  (o `eas.json` já commitado aqui segue o formato atual esperado pelo
  `eas-cli`, então normalmente não deve sobrescrever nada inesperado).

Depois desse passo, confira `app.json` e `eas.json` e faça commit das
mudanças (os IDs gerados não são segredo, podem ir para o repositório).

### Sobre `android.package` e `ios.bundleIdentifier`

Já deixamos `com.nossasfinancas.app` configurado para ambos em `app.json`.
Esse valor é **só um ponto de partida razoável** — ajuste para o identificador
que vocês realmente vão registrar na Play Store / App Store antes do primeiro
envio (depois de publicado, esse identificador não pode mais ser trocado
sem recriar o app na loja).

## 5. Profiles de build disponíveis (`mobile/eas.json`)

| Profile       | Uso                                              | Distribution | Android         | iOS                     |
|---------------|---------------------------------------------------|--------------|-----------------|-------------------------|
| `development` | Dev client (Expo Dev Client) para debugar no device | `internal`   | `.apk`          | build de desenvolvimento |
| `preview`     | Build interno para QA/testers, sem passar pela loja | `internal`   | `.apk`          | build interno (ad hoc)   |
| `production`  | Build final para publicar nas lojas                | `store`      | `.aab` (App Bundle, exigido pela Play Store) | build para App Store |

Scripts equivalentes em `mobile/package.json`:

```bash
npm run build:dev:android         # eas build --profile development --platform android
npm run build:dev:ios             # eas build --profile development --platform ios
npm run build:android             # eas build --profile preview --platform android (gera .apk p/ teste)
npm run build:ios                 # eas build --profile preview --platform ios
npm run build:production:android  # eas build --profile production --platform android (gera .aab)
npm run build:production:ios      # eas build --profile production --platform ios
npm run build:all                 # eas build --profile production --platform all
```

Você também pode rodar os comandos `eas build` diretamente sem passar pelo
`npm run`, se quiser outras combinações de profile/plataforma.

## 6. Credenciais de assinatura

### Android (keystore)

Por padrão, ao rodar o primeiro `eas build --platform android`, o EAS
pergunta se você quer que ele **gere e gerencie a keystore automaticamente**
(recomendado — fica guardada com segurança nos servidores da Expo). Também é
possível fazer upload de uma keystore existente:

```bash
eas credentials
```

Esse comando abre um menu interativo para gerenciar (ver, gerar, trocar,
fazer download de) a keystore Android e as credenciais iOS.

### iOS (certificado + provisioning profile)

Da mesma forma, no primeiro `eas build --platform ios`, o EAS pode gerar e
gerenciar automaticamente o certificado de distribuição e o provisioning
profile, desde que você informe as credenciais da sua conta Apple Developer
quando solicitado (login Apple ID + autenticação de dois fatores). Também dá
para gerenciar manualmente via `eas credentials`.

## 7. Publicação nas lojas (`eas submit`)

A seção `submit.production` de `mobile/eas.json` já está pronta, mas com
placeholders que precisam ser preenchidos com dados reais antes de usar:

```json
"submit": {
  "production": {
    "android": {
      "serviceAccountKeyPath": "./secrets/google-service-account.json",
      "track": "internal",
      "releaseStatus": "draft"
    },
    "ios": {
      "appleId": "SEU_APPLE_ID_AQUI@example.com",
      "ascAppId": "SEU_ASC_APP_ID_AQUI",
      "appleTeamId": "SEU_APPLE_TEAM_ID_AQUI"
    }
  }
}
```

### Android (Google Play)

1. Crie uma conta de serviço no Google Cloud Console vinculada ao Google Play
   Console, com permissão de "Release Manager" (veja o guia oficial:
   https://docs.expo.dev/submit/android/).
2. Baixe o JSON da conta de serviço e salve **fora do controle de versão**
   (ex.: `mobile/secrets/google-service-account.json` — adicione essa pasta
   ao `.gitignore` caso ainda não esteja coberta).
3. Ajuste `serviceAccountKeyPath` em `eas.json` para apontar para esse
   arquivo.
4. Ajuste `track` conforme o canal desejado (`internal`, `alpha`, `beta`,
   `production`).
5. Rode:

   ```bash
   npm run submit:android
   # equivalente a: eas submit --profile production --platform android
   ```

### iOS (App Store)

1. Substitua os placeholders `appleId`, `ascAppId` e `appleTeamId` em
   `eas.json` pelos dados reais da sua conta Apple Developer / App Store
   Connect (veja: https://docs.expo.dev/submit/ios/).
   - `appleId`: e-mail da conta Apple Developer.
   - `ascAppId`: ID numérico do app no App Store Connect (criado
     previamente lá, ainda que sem build enviado).
   - `appleTeamId`: ID do time na Apple Developer.
2. Como alternativa (recomendada para CI, sem precisar de 2FA interativo),
   use uma API Key do App Store Connect via `ascApiKeyPath` no lugar de
   `appleId`/`appleTeamId`.
3. Rode:

   ```bash
   npm run submit:ios
   # equivalente a: eas submit --profile production --platform ios
   ```

## 8. Fluxo resumido (primeira vez)

```bash
cd mobile
npm install -g eas-cli   # ou use npx eas-cli em cada comando
eas login
eas build:configure      # gera projectId real e ajusta app.json
eas credentials          # opcional: configurar keystore/certificados manualmente

# build de teste (apk interno)
npm run build:android

# build de produção para as lojas
npm run build:production:android
npm run build:production:ios

# publicar nas lojas (após configurar credenciais de submit no eas.json)
npm run submit:android
npm run submit:ios
```

## 9. Referências oficiais

- EAS Build: https://docs.expo.dev/build/introduction/
- eas.json (schema completo): https://docs.expo.dev/eas/json/
- EAS Submit: https://docs.expo.dev/submit/introduction/
- Credenciais Android: https://docs.expo.dev/app-signing/app-credentials/
- Credenciais iOS: https://docs.expo.dev/app-signing/app-credentials/
- Documentação versionada do Expo ~57 usada neste projeto:
  https://docs.expo.dev/versions/v57.0.0/

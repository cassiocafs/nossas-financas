# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

<!-- Publica também para iOS (mesmo bundle/app), mas por decisão explícita do usuário o produto usa uma linguagem visual customizada única em ambas as plataformas, sem adotar convenções nativas específicas de cada SO (Material no Android / HIG no iOS). Tratar como marca cross-platform, não como app nativo por SO. -->

## Users

Pessoas organizando as próprias finanças pessoais — tanto uso individual quanto casais/famílias que compartilham o controle do orçamento doméstico (o "Poupeu"). Usuárias e usuários que querem clareza sobre para onde o dinheiro vai, sem depender de integração bancária automática.

## Product Purpose

Gestão manual de fluxo financeiro pessoal no bolso: contas, transações, categorias, orçamento e regras de categorização, com acesso rápido no dia a dia (registrar um gasto, checar saldo, ver progresso do orçamento). Sucesso é o uso recorrente e rápido, sem fricção, mantendo o registro atualizado.

## Positioning

Simplicidade e controle manual: entrada e categorização de transações feitas pela própria pessoa (com apoio de regras automáticas de categorização), sem sincronização bancária automática (open finance/agregadores). O diferencial é a clareza do registro manual e a transparência total sobre os dados, não a automação de captura.

## Operating Context

App Expo/React Native (Expo Router, `app/(tabs)` + `app/(auth)`), publicado para iOS e Android a partir da mesma base, com a mesma API/backend (Express + Prisma + Supabase) do app web. Fluxos principais: autenticação, home, transações, relatórios, perfil. Há uma contraparte web (React/Vite) do mesmo produto, com paridade de funcionalidades e hoje com o mesmo sistema visual (cores, fontes) do mobile.

## Capabilities and Constraints

- Navegação por abas (Expo Router `(tabs)`) + fluxo de autenticação separado (`(auth)`).
- CRUD de contas, categorias, transações, regras de categorização; relatórios; perfil.
- Fontes customizadas carregadas via `expo-font` (atualmente Poppins).
- Suporte a tema claro/escuro já modelado em `Colors.light` / `Colors.dark`.
- Deliberadamente **não** segue Material Design (Android) nem HIG (iOS) — usa uma linguagem visual de marca única e consistente nas duas plataformas.
- Stack fixo (Expo/React Native, Expo Router) — redesenho deve trabalhar dentro dessa stack, não trocá-la.

## Brand Commitments

Nome do produto agora é **Poupeu** (decisão do usuário durante o redesenho; "Nossas Finanças" era o nome anterior). Identidade visual adotada a partir do design system Poupeu: paleta verde/amarelo/creme (`#0D5B2E` primário), tipografia Poppins, mascote (vira-lata caramelo, usado só em estados vazios/momentos pontuais, nunca decorativo), ícones Feather (base visual do Lucide, mantido sem nova dependência). Regra semântica adotada: despesa comum usa texto neutro, vermelho fica reservado para alertas reais (saldo negativo). Consistente com o app web (mesma marca, dois clientes). `android.package`/`ios.bundleIdentifier` mantidos como `com.nossasfinancas.app` deliberadamente, para não quebrar builds/lojas já publicadas.

## Evidence on Hand

Design system "Poupeu" (tokens, ~40 componentes de referência, assets de marca e mascote) importado via `claude_design` MCP e aplicado sobre a stack existente (`src/constants` com `Colors`/`Fonts`/`Spacing`/`Radius`, `src/components/ui`, `src/app`) — tokens remapeados sem trocar a stack (Expo/React Native). Nenhum outro material de marca além do design system confirmado até o momento.

## Product Principles

1. Clareza antes de estética: qualquer redesenho deve manter ou melhorar a legibilidade de valores monetários e status financeiro (positivo/negativo/neutro).
2. Confiança visual: o produto lida com dinheiro real das pessoas — o design deve transmitir precisão e seriedade, evitando estética "genérica de SaaS".
3. Marca única cross-platform: a mesma linguagem visual deve funcionar em iOS e Android sem adotar idiomas nativos de cada SO, e deve ser compatível com o design pensado para o app web.
4. Uso individual e compartilhado: a linguagem visual deve funcionar tanto para quem usa sozinho quanto para casais/famílias vendo o orçamento em conjunto.

## Accessibility & Inclusion

Nenhum requisito específico confirmado além de contraste adequado para leitura de valores financeiros e suporte a tema claro/escuro já existente.

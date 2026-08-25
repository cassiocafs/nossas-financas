# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pessoas organizando as próprias finanças pessoais — tanto uso individual quanto casais/famílias que compartilham o controle do orçamento doméstico (o "Poupeu"). Usuárias e usuários que querem clareza sobre para onde o dinheiro vai, sem depender de integração bancária automática.

## Product Purpose

Gestão manual de fluxo financeiro pessoal: contas, transações, categorias, orçamento e regras de categorização. Sucesso é o usuário entender rapidamente sua situação financeira (entradas, saídas, saldo por conta, progresso do orçamento) e manter o registro atualizado sem fricção.

## Positioning

Simplicidade e controle manual: entrada e categorização de transações feitas pela própria pessoa (com apoio de regras automáticas de categorização e importação de extratos), sem sincronização bancária automática (open finance/agregadores). O diferencial é a clareza do registro manual e a transparência total sobre os dados, não a automação de captura.

## Operating Context

Web app (React + Vite + Tailwind, Supabase como backend de dados/auth via API própria em Express + Prisma). Fluxos principais: login/cadastro, home (visão geral), transações, orçamento, e configurações (contas, categorias, regras, importação de extratos). Há uma contraparte mobile (Expo/React Native) do mesmo produto, com paridade de funcionalidades e hoje com o mesmo sistema visual (cores, fontes) do web.

## Capabilities and Constraints

- Autenticação própria (login/signup) via Supabase.
- CRUD de contas, categorias, transações, regras de categorização.
- Orçamento por categoria com acompanhamento de progresso.
- Importação de extratos via planilha (há planilha modelo para download).
- Gráficos de fluxo de caixa (Recharts) com rótulos de valor.
- Suporte a modo claro/escuro (tokens `:root` / `.dark` já definidos).
- Stack fixo (React 19, Tailwind 4, shadcn-style components em `src/components/ui`) — redesenho deve trabalhar dentro dessa stack, não trocá-la.

## Brand Commitments

Nome do produto agora é **Poupeu** (decisão do usuário durante o redesenho; "Nossas Finanças" era o nome anterior). Identidade visual adotada a partir do design system Poupeu: paleta verde/amarelo/creme (`#0D5B2E` primário), tipografia Poppins, mascote (vira-lata caramelo, usado só em estados vazios/momentos pontuais, nunca decorativo), ícones outline (Lucide no web, Feather no mobile). Regra semântica adotada: despesa comum usa texto neutro, vermelho fica reservado para alertas reais (saldo negativo, orçamento estourado).

## Evidence on Hand

Design system "Poupeu" (tokens, ~40 componentes de referência, assets de marca e mascote) importado via `claude_design` MCP e aplicado sobre a stack existente (`src/index.css`, `src/components/ui`, `src/pages`) — tokens remapeados sem trocar a stack (Tailwind 4 CSS-first). Nenhum outro material de marca além do design system confirmado até o momento.

## Product Principles

1. Clareza antes de estética: qualquer redesenho deve manter ou melhorar a legibilidade de valores monetários e status financeiro (positivo/negativo/neutro).
2. Confiança visual: o produto lida com dinheiro real das pessoas — o design deve transmitir precisão e seriedade, evitando estética "genérica de SaaS".
3. Paridade web/mobile: decisões de sistema de design devem ser pensadas para funcionar (ainda que com adaptações) tanto no app web quanto no app mobile.
4. Uso individual e compartilhado: a linguagem visual deve funcionar tanto para quem usa sozinho quanto para casais/famílias vendo o orçamento em conjunto.

## Accessibility & Inclusion

Nenhum requisito específico confirmado além de contraste adequado para leitura de valores financeiros e suporte a tema claro/escuro já existente.

# Solis — simulador de investimento solar

Aplicativo mobile para explorar cenários preliminares de energia solar a partir de metas e limitações que a pessoa conhece. Potência, produção, custo e retorno são estimativas educacionais; não substituem projeto elétrico, vistoria, proposta comercial nem análise da distribuidora.

## O que foi implementado

- App React Native com Expo e navegação React Navigation.
- API REST Node.js/Express, MySQL 8, cadastro, login, hash scrypt, JWT Bearer, logout e papéis `user`/`admin`.
- CRUD de simulações com isolamento por proprietário; administradores podem manter referências e listar contas/simulações para suporte.
- Cálculo explicável com geração anual = kWp × HSP × 365 × fator de desempenho. Usa restrições informadas para escolher potência e descreve conflitos; cada parâmetro carrega origem, data, unidade e natureza.
- Tela inicial, formulário de simulação, resultado com gráfico anual, histórico, comparação e área administrativa.

## Requisitos

Node.js 20+, npm, MySQL 8+. Expo Go para desenvolvimento (Android/iOS). Para build Android, conta Expo/EAS e `eas-cli`; a API precisa estar publicada em HTTPS e acessível pelo dispositivo.

## Executar localmente

1. Crie banco e tabelas: `mysql -u root -p < api/sql/schema.sql`.
2. Copie `api/.env.example` para `api/.env`, configure MySQL, `JWT_SECRET` aleatório de pelo menos 32 caracteres e `ADMIN_EMAIL`/`ADMIN_PASSWORD` para criar o primeiro administrador. Nunca versione `.env`.
3. Na raiz: `npm install`, depois `npm run api`.
4. Copie `mobile/.env.example` para `mobile/.env` e defina `EXPO_PUBLIC_API_URL` com o endereço alcançável pela rede do celular (por exemplo, IP local do computador, não `localhost`).
5. `npm run mobile`; escaneie o QR no Expo Go.

O primeiro administrador é provisionado na inicialização somente se as duas variáveis `ADMIN_EMAIL` e `ADMIN_PASSWORD` estiverem definidas. Remova-as depois e mantenha segredos apenas no ambiente local.

## Build Android

Configure `mobile/eas.json` e uma variável `EXPO_PUBLIC_API_URL` pública HTTPS para produção; então execute `cd mobile && npx eas build --platform android --profile production`. O APK só é produzido se o perfil EAS estiver configurado como APK e a API estiver publicada. O código fonte não inclui credenciais nem um endereço de backend fictício.

## API

Base `/api`. Cadastro e login são públicos; demais rotas exigem `Authorization: Bearer <token>`.

| Método | Rota | Acesso |
|---|---|---|
| POST | `/auth/register`, `/auth/login` | Público |
| POST | `/auth/logout` | Autenticado (revoga jti) |
| GET | `/auth/me` | Autenticado |
| GET/POST | `/simulations` | Próprias simulações |
| GET/PUT/DELETE | `/simulations/:id` | Dono ou admin; CRUD com checagem no servidor |
| GET | `/admin/references` | Admin |
| PUT | `/admin/references/:key` | Admin |
| GET | `/admin/simulations` | Admin |

API em `api/`; SQL versionado em `api/sql/schema.sql`. As rotas administrativas não aceitam alteração do papel pelo cliente. O admin inicial é configurado por ambiente.

## Cálculo e parâmetros

O endpoint de cálculo requer uma referência de recurso solar revisada pelo administrador ou fornecida para a simulação com fonte e data. Não atribui um número inventado a uma cidade. Se a localização ou referência local faltar, explica por que não pode quantificar a produção e orienta a inserir HSP rastreável. O formulário não exige valores técnicos prévios.

Parâmetros editáveis: irradiação diária (kWh/m²/dia), fator de desempenho, custo instalado de referência (R$/kWp), tarifa evitável local, participação Fio B e regra GD II. PR inicial **0,75**, com fonte metodológica EPE. Custo residencial inicial **R$ 31.700/kWp (R$ 3,17/Wp)**, referência histórica EPE/Greener de janeiro de 2024 para sistema de 4 kWp; não é preço atual. Tarifa local e participação Fio B não são presumidas. Cada parâmetro administrado registra fonte, URL, unidade, data de consulta e limitação.

Fórmula mensal: `kWp × HSP × 30,4375 × PR`. Sem localização, fallback de faixa nacional 4,44–5,48 kWh/m²/dia, com incerteza ampliada; com localização, exige referência local do Atlas ou informada. Custo estimado pela referência histórica; valor recebido como orçamento do usuário é marcado como informado. Benefício considera autoconsumo; exportação só é valorizada quando Fio B e regra estão disponíveis. Sem eles, apresenta faixa ilustrativa de economia. Payback simples não inclui financiamento, degradação, manutenção, troca de inversor ou tarifa mínima. A área é restrição qualitativa, sem conversão arbitrária para kWp. Incompatibilidades entre meta, orçamento e área são explicitadas.

Referências para revisão pelo administrador:

- INPE, Atlas Brasileiro de Energia Solar, 2ª ed.: https://www.gov.br/pt-br/servicos/obter-dados-do-atlas-brasileiro-de-energia-solar-atlas-solar (recurso geográfico; HSP depende da localização e da metodologia).
- Faixa nacional aproximada 4,44–5,48 kWh/m²/dia citada a partir do Atlas em guia governamental: https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/habitacao/arquivos/9-_guia-de-eficiencia-energetica.pdf (fallback apenas se localização ausente; não é dado municipal).
- PR inicial 0,75: Nota metodológica EPE 2025, https://www.epe.gov.br/sites-pt/publicacoes-dados-abertos/publicacoes/PublicacoesArquivos/publicacao-889/NT-EPE-DEA-SEE-009-2025.pdf (premissa agregada para segmentos; não substitui perdas do projeto).
- Custo residencial inicial R$ 3,17/Wp (4 kWp), observado em jan/2024: EPE/Greener, https://www.epe.gov.br/sites-pt/publicacoes-dados-abertos/publicacoes/PublicacoesArquivos/publicacao-897/NT%20DEA-SEE-14-2024%20-%20RT%20RED%20-%20Tecnologia.pdf (referência histórica, não cotação atual).
- ANEEL, tarifas por distribuidora: https://dadosabertos.aneel.gov.br/pt_BR/dataset/tarifas-distribuidoras-energia-eletrica (TE/TUSD homologadas não equivalem automaticamente à tarifa marginal evitável do consumidor).
- Resolução tarifária ANEEL: https://www2.aneel.gov.br/cedoc/retreh20223150.pdf (verificar distribuidora e vigência antes de estimar tarifa).
- Lei 14.300/2022: https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/lei/l14300.htm (SCEE e regras transitórias; requer análise do enquadramento).
- INMETRO, tabelas de sistemas fotovoltaicos: https://www.gov.br/inmetro/pt-br/assuntos/regulamentacao/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica/sistema-de-energia-fotovoltaica (fontes para dados de módulos; área do telhado segue sem conversão automática neste protótipo).
- EPE, Painel de Dados de MMGD: https://dashboard.epe.gov.br/apps/pdgd/ (dados e metodologia agregados; valores de projeto não são orçamento individual).

Consulta destas fontes: 12/11/2026. Fonte, unidade, data e limitação específicas ficam gravadas junto a cada referência administrada. Valores oficiais precisam ser atualizados antes de uso financeiro; o app não baixa nem presume dados por cidade automaticamente.

## Segurança e testes

Senhas usam `crypto.scrypt` com salt aleatório; token JWT assinado; jti revogado em logout; middleware valida assinatura, expiração, revogação e conta ativa; SQL parametrizado e `helmet`/limite de requisições. O papel só vem da conta no banco. Requisições entre usuários recebem 404.

Execute `npm test` para testes automatizados do motor de cálculo. Testes de integração da API requerem MySQL configurado; confira o fluxo manual de cadastro, login, Bearer, logout, CRUD e papel admin após iniciar os serviços.

## Apresentação

Roteiro com problema, fluxo de demonstração, arquitetura, banco, segurança, premissas e limitações: `docs/apresentacao.md`.

# Solis — roteiro para apresentação e defesa

## 1. Problema e proposta

Uma família pode conhecer sua conta, orçamento e espaço disponível, mas não sabe converter esses limites em potência, geração, preço e retorno solar. Solis transforma os dados que a pessoa tem em um cenário preliminar, sem exigir conhecimento de dimensionamento. O app explica as lacunas e expõe de onde vêm os parâmetros estimados.

## 2. Demonstração sugerida

1. Iniciar a API e o Metro (`npm run api` e `npm run mobile`), abrir com Expo Go compatível com SDK 58 e confirmar que o telefone alcança a API pela mesma rede. Se a rede/firewall impedir o Metro, iniciar `npx expo start --tunnel` na pasta `mobile`. Criar uma conta e entrar; mostrar a sessão persistida com SecureStore e o Bearer Token enviado pelo cliente HTTP.
2. Criar uma simulação informando meta mensal de geração, cidade e orçamento; deixar campos técnicos vazios.
3. Mostrar potência estimada, faixa de geração baseada no fallback nacional quando não houver HSP local, custo residencial histórico e ressalvas.
4. Informar HSP com fonte e data e recalcular; comparar valores informados e assumidos.
5. Abrir histórico, editar e duplicar uma simulação; comparar dois cenários; excluir um cenário de demonstração.
6. Demonstrar saída e login. Explicar que logout revoga o `jti` na API.
7. Em sessão admin, revisar fonte, unidade, data e limitação de um parâmetro. Tentar acesso com usuário comum: a API deve responder 403.

## 3. Arquitetura e dados

O aplicativo Expo usa React Navigation; `mobile/src/screens/` contém as telas, `mobile/src/components/ui.js` os componentes reutilizados, `mobile/src/api/client.js` as chamadas HTTP e `mobile/src/theme.js` os estilos. A API Express separa `routes/`, `controllers/`, `services/`, `repositories/`, `middleware/`, `validation/` e `db/`. Os controllers validam/formatam a resposta HTTP; serviços coordenam autenticação e cálculo; repositórios executam SQL parametrizado pelo pool MySQL. O banco guarda `users`, `simulations`, `reference_parameters` e `revoked_tokens`. Cada simulação persiste entradas e snapshot do resultado/premissas usados.

## 4. Segurança e autorização

- Senha: hash scrypt com salt aleatório; nunca texto puro.
- Login: valida credenciais, assina JWT com expiração e `jti`.
- App: guarda token em Expo SecureStore e envia `Authorization: Bearer ...`.
- Middleware: verifica assinatura, issuer, expiração, revogação e estado da conta na base.
- Autorização: role é lida da conta no MySQL; parâmetro de role no cliente é ignorado. Rotas administrativas usam middleware admin.
- Isolamento: select/update/delete de simulação filtram por `id` e `user_id`; recurso alheio responde 404.
- Logout: insere `jti` em lista de revogação até expirar.

## 5. Cálculo

`kWh/mês ≈ kWp × HSP diária × 30,4375 × PR`. PR começa em 0,75 (premissa EPE), editável. Sem HSP local cadastrada, usa a faixa nacional 4,44–5,48 kWh/m²/dia com aviso de incerteza, mesmo quando foi digitada uma cidade. Para maior precisão, cadastre uma referência do Atlas INPE que corresponda à localidade.

O custo inicial é referência residencial histórica EPE/Greener de jan/2024: R$ 3,17/Wp, equivalente a R$ 3.170/kWp. Não é preço atual. O orçamento limita a potência quando a meta excede o custo estimado e o conflito é mostrado. A área é uma restrição qualitativa: não se converte área bruta em kWp sem dimensões e layout de módulos.

Meta de economia e conta mensal usam tarifa-base indicativa de R$ 0,81/kWh quando não há tarifa específica. O resultado apresenta a tarifa utilizada e uma faixa de economia. Autoconsumo parte de 0,70. Sem distribuidora, TE/TUSD e Fio B, não se promete compensação integral; o payback é simples e não inclui financiamento, degradação, O&M, troca de inversor nem tarifa mínima.

## 6. Referências e limitações

- Atlas Solar INPE: https://www.gov.br/pt-br/servicos/obter-dados-do-atlas-brasileiro-de-energia-solar-atlas-solar
- Faixa nacional divulgada em guia governamental: https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/habitacao/arquivos/9-_guia-de-eficiencia-energetica.pdf
- PR 0,75 — Nota metodológica EPE 2025: https://www.epe.gov.br/sites-pt/publicacoes-dados-abertos/publicacoes/PublicacoesArquivos/publicacao-889/NT-EPE-DEA-SEE-009-2025.pdf
- Custo residencial histórico EPE/Greener: https://www.epe.gov.br/sites-pt/publicacoes-dados-abertos/publicacoes/PublicacoesArquivos/publicacao-897/NT%20DEA-SEE-14-2024%20-%20RT%20RED%20-%20Tecnologia.pdf
- Tarifas ANEEL: https://dadosabertos.aneel.gov.br/pt_BR/dataset/tarifas-distribuidoras-energia-eletrica
- Lei 14.300/2022: https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/lei/l14300.htm
- Tabelas INMETRO de sistemas fotovoltaicos: https://www.gov.br/inmetro/pt-br/assuntos/regulamentacao/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica/sistema-de-energia-fotovoltaica
- Metodologia/dados agregados de MMGD — EPE: https://dashboard.epe.gov.br/apps/pdgd/

Geração real e economia dependem de clima local, plano e sombra, módulos e inversores, instalação, carga horária, tarifa, modalidade e regras da distribuidora. Exigir visita e proposta profissional antes de qualquer decisão de compra.

## 7. Verificações a registrar na demonstração

Registrar data, ambiente e resultado real dos fluxos de cadastro/login/logout, 401 sem token, 403 admin, isolamento entre dois usuários, CRUD, cálculo com e sem HSP, conflito de orçamento, inicialização MySQL e navegação do APK. Não declarar um fluxo testado sem executá-lo no ambiente final.

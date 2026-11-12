# Solis — roteiro para apresentação e defesa

## 1. Problema e proposta

Uma família pode conhecer sua conta, orçamento e espaço disponível, mas não sabe converter esses limites em potência, geração, preço e retorno solar. Solis transforma os dados que a pessoa tem em um cenário preliminar, sem exigir conhecimento de dimensionamento. O app explica as lacunas e expõe de onde vêm os parâmetros estimados.

## 2. Demonstração sugerida

1. Criar uma conta e entrar; mostrar a sessão persistida com SecureStore.
2. Criar uma simulação informando meta mensal de geração, cidade e orçamento; deixar campos técnicos vazios.
3. Mostrar potência estimada, faixa de geração baseada no fallback nacional (se localização faltar), custo residencial histórico e ressalvas.
4. Informar HSP com fonte e data e recalcular; comparar valores informados e assumidos.
5. Abrir histórico, editar e duplicar uma simulação; comparar dois cenários; excluir um cenário de demonstração.
6. Demonstrar saída e login. Explicar que logout revoga o `jti` na API.
7. Em sessão admin, revisar fonte, unidade, data e limitação de um parâmetro. Tentar acesso com usuário comum: a API deve responder 403.

## 3. Arquitetura e dados

Expo/React Native usa React Navigation. `fetch()` envia JSON à API Express. MySQL guarda `users`, `simulations`, `reference_parameters` e `revoked_tokens`. A simulação armazena entradas e um snapshot do resultado/premissas usados no momento, para preservar a explicação mesmo após atualização de parâmetros.

## 4. Segurança e autorização

- Senha: hash scrypt com salt aleatório; nunca texto puro.
- Login: valida credenciais, assina JWT com expiração e `jti`.
- App: guarda token em Expo SecureStore e envia `Authorization: Bearer ...`.
- Middleware: verifica assinatura, issuer, expiração, revogação e estado da conta na base.
- Autorização: role é lida da conta no MySQL; parâmetro de role no cliente é ignorado. Rotas administrativas usam middleware admin.
- Isolamento: select/update/delete de simulação filtram por `id` e `user_id`; recurso alheio responde 404.
- Logout: insere `jti` em lista de revogação até expirar.

## 5. Cálculo

`kWh/mês ≈ kWp × HSP diária × 30,4375 × PR`. PR começa em 0,75 (premissa EPE), editável. A localização ausente aciona apenas a faixa nacional 4,44–5,48 kWh/m²/dia citada a partir do Atlas INPE, com aviso de incerteza. Com cidade presente, a aplicação não inventa HSP municipal: exige fonte local do Atlas ou cadastro administrativo identificável.

O custo inicial é referência residencial histórica EPE/Greener de jan/2024: R$ 3,17/Wp (R$ 31.700/kWp). Não é preço atual. Orçamento informado é tratado como limite e reduz a potência quando a meta não cabe, exibindo o conflito. Área aparece como restrição a validar: sem dimensões e layout de módulos cadastrados do INMETRO, não se converte área bruta em kWp.

Economia requer tarifa evitável e perfil de autoconsumo. Quando há tarifa e autoconsumo mas faltam distribuidora, TE/TUSD e Fio B, o app mostra faixa ampla, não deduz 60% da conta. O parâmetro 60% de 2026 fica configurável e ligado à regra GD II; não é aplicado linearmente à tarifa inteira. Payback é simples, sem financiamento, degradação, O&M, troca de inversor ou tarifa mínima.

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

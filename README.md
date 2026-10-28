# Corrida Solidária — entrega do teste

Front-end em Angular para as inscrições da 5ª Corrida Solidária da Vila Esperança.

## Como rodar

### Pré-requisitos

| Ferramenta | Versão | Como conferir |
| --- | --- | --- |
| Node.js | 22.12 ou mais recente (o Angular 21 aceita `^20.19`, `^22.12` ou `>=24`) | `node -v` deve mostrar `v22.12.0` ou mais |
| npm | 10 ou mais recente (já vem com o Node) | `npm -v` deve mostrar `10.x` ou mais |

Não é preciso instalar o Angular CLI globalmente: ele vem como dependência do projeto e é usado pelos scripts do npm.

O projeto foi desenvolvido com Node 24.22.1, Angular 21.2 (componentes standalone) e Vitest, executado pelo `ng test`.

### Passo a passo

1. **Obtenha o código e entre na pasta.** Clone o repositório ou descompacte o arquivo entregue:

   ```bash
   cd aptidao-corrida
   ```

2. **Instale as dependências.** O `npm ci` instala exatamente as versões do `package-lock.json` e leva cerca de um minuto:

   ```bash
   npm ci
   ```

   Ao final, aparece `added ... packages`.

3. **Inicie a aplicação:**

   ```bash
   npm start
   ```

   Quando o terminal mostrar `Local: http://localhost:4200/`, a aplicação está pronta. O servidor continua rodando até você apertar `Ctrl+C`.

4. **Abra http://localhost:4200 no navegador.** Você será levado para `/inscricoes`, com a lista vazia ("Nenhuma inscrição até o momento") e o resumo do cabeçalho zerado. Clique em **Nova inscrição** para cadastrar.

### Outros comandos

Rode em outro terminal, também dentro da pasta do projeto.

| Comando | Para que serve | Resultado esperado |
| --- | --- | --- |
| `npm test -- --watch=false` | Roda todos os testes uma vez e encerra | `Tests 56 passed` |
| `npm test` | Roda os testes e fica observando os arquivos | Reexecuta os testes a cada alteração |
| `npm run build` | Gera a versão de produção em `dist/aptidao-corrida` | `Application bundle generation complete`, com um aviso de orçamento (veja abaixo) |

### Problemas comuns

- **A porta 4200 está ocupada.** Use outra porta com `npm start -- --port 4300` e abra http://localhost:4300.
- **Erro de versão do Node** (`EBADENGINE` ou "The Angular CLI requires a minimum Node.js version"). Atualize o Node para 22.12 ou mais recente e rode `npm ci` de novo.
- **Aviso "bundle initial exceeded maximum budget" no build.** É esperado e não impede o build. A explicação está em [Dependência de interface](#dependência-de-interface).
- **Recomeçar com a lista vazia.** As inscrições ficam no `localStorage` do navegador, na chave `corrida.inscricoes.v1`. Apague essa chave em Ferramentas do desenvolvedor → Application → Local Storage e recarregue a página.

## Entendimento do problema

A associação fazia as inscrições em caderno e planilha. Isso gerou inscrições duplicadas e participantes fora da idade permitida, o que complicou o seguro. Ela precisa de um sistema simples para cadastrar, consultar, corrigir e cancelar inscrições, identificadas pelo e-mail. O sistema deve aplicar as regras de idade do regulamento na data da prova e mostrar o total de inscritos e a quantidade por percurso, que são usados para encomendar medalhas e água.

## Regras implementadas

Os arquivos ficam em `src/app/`. As regras do regulamento estão em funções puras, sem Angular, e são testadas isoladamente.

| Regra | Fonte no pedido | Onde foi implementada |
| --- | --- | --- |
| Data da prova 14/03/2027, definida em um único lugar | Regulamento, Art. 5º, I; enunciado | `dominio/evento.ts` → `EVENTO.dataProva` |
| Idade é a idade completa na data da prova, nunca a de hoje nem a diferença entre os anos; aniversário no dia da prova já conta | Regulamento, Art. 6º, I; enunciado | `dominio/inscricao.regras.ts` → `calcularIdade` |
| Idade mínima de 14 anos, verificada antes da restrição dos 10 km | Regulamento, Art. 6º, II; enunciado | `inscricao.regras.ts` → `IDADE_MINIMA`, `avaliarInscricao` |
| 10 km somente a partir de 18 anos | Regulamento, Art. 6º, III; áudio ("menor de idade só pode fazer os cinco") | `inscricao.regras.ts` → `IDADE_MINIMA_10KM`, `avaliarInscricao` |
| Categorias: Juvenil 14–17, Adulto 18–39, Master 40–59, Sênior 60+ | Regulamento, Art. 6º, IV | `inscricao.regras.ts` → `categoriaPorIdade` |
| Quatro campos de entrada; idade e categoria são sempre calculadas, nunca digitadas nem lidas do armazenamento | Regulamento, Art. 4º, I; enunciado | `dominio/inscricao.ts`; `inscricoes/inscricoes.store.ts` (`salvar` grava só os quatro campos, `carregar` recalcula) |
| E-mail normalizado (sem espaços nas pontas, em minúsculas) é o identificador; um e-mail, uma inscrição ativa | Regulamento, Art. 4º, II; áudio; enunciado | `inscricao.regras.ts` → `normalizarEmail`; `inscricoes.store.ts` → `cadastrar` |
| Nome obrigatório com 3 a 100 caracteres depois de normalizar; aceita acentos, apóstrofos e hífens | Enunciado | `dominio/inscricao.validacao.ts` → `normalizarNome`, `validarInscricao` |
| E-mail com formato válido | Enunciado | `inscricao.validacao.ts` → `validarInscricao` |
| Nascimento: data existente e anterior a hoje; armazenada como `aaaa-mm-dd` e exibida como `dd/mm/aaaa` | Enunciado | `dominio/datas.ts` → `isDataValida`, `formatarDataBr`; `compartilhado/data-br.pipe.ts` |
| Percurso obrigatório, `KM_5` ou `KM_10` | Regulamento, Art. 5º, II; enunciado | `inscricao.validacao.ts` → `validarInscricao` |
| Recusas do regulamento mostram o motivo no campo correspondente, com a idade na prova | Enunciado | `inscricao.validacao.ts` → `MENSAGENS_REGULAMENTO` |
| Mesma validação no cadastro e na edição | Enunciado | `inscricao.validacao.ts` → `validarInscricao`, usada por `cadastrar` e `editar` da store |
| Cadastro acrescenta ao fim da lista | Enunciado | `inscricoes.store.ts` → `cadastrar` |
| Edição altera nome, nascimento e percurso; e-mail imutável; conserva posição e total; recusada, não altera nada; não cria inscrição nova | Atualização do pedido de 19/10; enunciado | `inscricoes.store.ts` → `editar`; e-mail bloqueado em `inscricoes/formulario-inscricao` |
| Cancelamento pelo e-mail libera o e-mail para nova inscrição; cancelar alguém ausente não altera os demais | Regulamento, Art. 7º, I e II; áudio | `inscricoes.store.ts` → `cancelar` |
| Resumo (total, 5 km e 10 km) derivado da lista, visível em todas as telas | Áudio; enunciado | `inscricoes.store.ts` → `resumo` (`computed`); cabeçalho em `app.html` |
| Persistência no `localStorage` com a chave `corrida.inscricoes.v1`, começando com a lista vazia | Enunciado | `inscricoes.store.ts` → `CHAVE_ARMAZENAMENTO`, `carregar`, `salvar` |
| JSON corrompido ou falha ao salvar: a aplicação continua usável e mostra um aviso | Enunciado | `inscricoes.store.ts` → `carregar`, `salvar`, `aviso`; aviso em `app.html` |
| Rotas `/`, `/inscricoes`, `/inscricoes/nova`, `/inscricoes/:email`, `/inscricoes/:email/editar` e página não encontrada; funcionam por acesso direto, recarga e histórico | Enunciado | `app.routes.ts` |
| Consulta ou edição de inscrição inexistente informa que ela não foi encontrada | Enunciado | `inscricoes/inscricao-nao-encontrada` |

## Conflitos encontrados e decisões

### Data da prova: 13 ou 14 de março?

- **Fontes:** o áudio do Seu Jorge diz "domingo, dia 13 de março". O regulamento (Art. 5º, I) diz "domingo, 14 de março de 2027".
- **Decisão:** 14/03/2027.
- **Motivo:**
  - O regulamento prevalece sobre o áudio, como diz o pacote do cliente.
  - Em 2027, o dia 14 de março cai num domingo e o dia 13 num sábado, então o regulamento também é coerente com o "domingo" dito no áudio.
  - A data fica só em `EVENTO.dataProva`. Se mudar, todas as idades e categorias são recalculadas a partir dela.

### Categoria pelo ano de nascimento (sugestão do Valdir)

- **Fontes:** o Valdir sugere categoria pelo ano de nascimento, como na federação ("nasceu em 87, em 2027 é master"). O regulamento (Art. 6º, I) manda considerar "a idade completa do participante na data da prova".
- **Decisão:** idade completa em 14/03/2027.
- **Motivo:**
  - O regulamento prevalece, e o enunciado proíbe usar só a diferença entre os anos.
  - Exemplo: quem nasceu em 20/12/1987 tem 39 anos na prova e é Adulto, não Master.

### Três inscrições no e-mail da Dona Marta

- **Fontes:** a Dona Marta quer inscrever a si, o Pedro (15) e a Júlia (12) no mesmo e-mail. O regulamento diz que a inscrição é individual (Art. 4º, I), aceita uma inscrição por e-mail (Art. 4º, II) e exige idade mínima de 14 anos (Art. 6º, II).
- **Decisão:** o sistema aceita só uma inscrição por e-mail.
  - A Júlia não pode ser inscrita em nenhum caso, porque terá 12 ou 13 anos na prova.
  - O Pedro precisa de um e-mail próprio e só pode correr os 5 km, porque é menor de 18.
- **Motivo:** o e-mail é o identificador definido no regulamento. Aceitar vários participantes no mesmo e-mail impediria cancelar ou consultar cada um individualmente.

### E-mails do Gmail com e sem ponto

- **Fontes:** o Lucas pergunta se `joao.silva@gmail.com` e `joaosilva@gmail.com` são a mesma pessoa, já que o Gmail entrega nos dois. O enunciado define a normalização como "remover espaços nas pontas e converter para minúsculas".
- **Decisão:** os dois são tratados como e-mails diferentes. Não há tratamento de pontos nem do sinal `+`.
- **Motivo:**
  - É a normalização que o enunciado define.
  - Ignorar pontos é uma regra só do Gmail. Aplicar isso a outros provedores juntaria e-mails de pessoas diferentes.
  - Ficou registrado como pergunta ao cliente.

### Pix da inscrição

- **Fontes:** o áudio pede para "gerar o Pix da inscrição". O regulamento (Art. 4º, III) diz que a inscrição é gratuita, mediante a doação de 1 kg de alimento na retirada do kit.
- **Decisão:** não há cobrança. Detalhes em [Fora de escopo](#fora-de-escopo).
- **Motivo:** além de estar fora do escopo, a cobrança contraria o regulamento.

### Premissas onde as fontes não são explícitas

| Ponto | Decisão | Motivo |
| --- | --- | --- |
| Caracteres do nome | Aceita letras (com acentos), espaços, apóstrofos (`'` e `’`) e hífens; recusa números e símbolos | O enunciado lista o que deve ser aceito; o resto foi recusado para evitar nomes inválidos |
| Nascido em 29/02 | Em anos não bissextos, a idade é completada em 01/03 | A comparação é feita por mês e dia, e 28/02 vem antes de 29/02. Para a prova em 14/03 isso não muda nada, porque o aniversário já passou; a regra só importa se a data da prova mudar para o fim de fevereiro |
| Datas sem `Date` | Datas tratadas como texto `aaaa-mm-dd` e comparadas por partes | Evita deslocamento de fuso horário (por exemplo, `new Date('2027-03-14')` vira 13/03 no Brasil) |
| "Anterior a hoje" | Usa a data local do navegador | É a data que a pessoa vê no próprio calendário |
| Registros inválidos ou repetidos no armazenamento | São descartados ao carregar, com aviso | Dados alterados por fora não podem virar inscrições que o regulamento recusaria |
| Falha ao salvar no navegador | A alteração vale na tela até recarregar, com aviso | O enunciado pede que a aplicação continue usável |
| Salvar a edição a partir dos detalhes | Volta para a lista | O enunciado pede: "no sucesso, retorne à lista" |
| Cancelamento | Pede confirmação antes de remover | A remoção é irreversível; a confirmação evita cliques acidentais |

### Protótipo de interface × enunciado

O protótipo (https://prototipo-corrida.vercel.app/) é a referência de interface e navegação. Onde ele diverge do enunciado, foi seguido o enunciado.

| Ponto | Protótipo | Decisão | Motivo |
|---|---|---|---|
| Rotas | Usa `#` na URL (`#/inscricoes/...`) | Angular Router com caminhos reais (`/inscricoes/...`) | O enunciado exige o Angular Router e URLs que funcionem coladas na barra e após recarregar |
| Página não encontrada | Mostra a mensagem e a lista de inscrições abaixo | Mostra a mensagem e um botão para voltar à lista | O enunciado pede "página não encontrada com retorno à lista" |
| Cancelamento | Remove a inscrição na hora, sem confirmação | Pede confirmação antes de cancelar | A remoção é irreversível; a confirmação evita cliques acidentais |
| Formulário | Modal sobre a lista, percurso em `select` | Modal associado às rotas `/inscricoes/nova` e `/inscricoes/:email/editar` (rotas filhas da lista); percurso em botões de opção | O enunciado pede "modal associado à rota". Como rota filha, o modal tem URL própria, abre por acesso direto e recarga, e fecha com o botão voltar do navegador. Os botões de opção mostram os dois percursos de uma vez |
| Visual | Cabeçalho branco, badges coloridos por categoria, primária `#2B50D8` | Cabeçalho verde-escuro com o resumo, ficha com rótulo e valor, primária verde `#18794f` (contraste de 5,4:1 com texto branco) | Nenhum documento define cores; o enunciado diz que fidelidade visual não substitui funcionamento |

### Dependência de interface

- O diálogo de confirmação, o modal do formulário e os ícones usam PrimeNG (tema Material) e PrimeIcons.
- Com eles, o pacote inicial passa do orçamento padrão de 500 kB do Angular, e o build mostra um aviso.
- O aviso foi aceito porque é só um aviso, não um erro, e porque o PrimeNG entrega diálogos acessíveis prontos: foco dentro do modal e fechamento por teclado.
- O modo escuro do tema foi desligado (`darkModeSelector: false`). Sem isso, os controles nativos ficavam escuros em sistemas com modo escuro, destoando do restante da interface, que é só clara.

## Perguntas que eu faria ao cliente

| Pergunta | Premissa usada enquanto isso |
| --- | --- |
| A prova é mesmo em 14/03/2027? O áudio fala em 13 de março. | 14/03/2027, a data do regulamento |
| `joao.silva@gmail.com` e `joaosilva@gmail.com` devem ser considerados a mesma pessoa? | São inscrições diferentes |
| Menores sem e-mail próprio (como o Pedro, de 15 anos) podem usar outro e-mail, por exemplo de um parente? | Cada inscrição precisa de um e-mail ainda não usado; o sistema não verifica de quem é o e-mail |
| A categoria por ano de nascimento da federação vale para alguma classificação além do regulamento? | Não; vale o Art. 6º |
| Há limite de vagas, total ou por percurso? | Sem limite |
| As inscrições abrem com a divulgação do link em 01/11? Há data de encerramento? | Abertas a qualquer momento; o bloqueio temporal está fora do escopo |
| A doação de 1 kg de alimento precisa ser registrada no sistema? | Não; ela acontece na retirada do kit |
| A organização precisa exportar a lista (por exemplo, para o seguro)? | Não; a lista fica só na tela |

## Fora de escopo

| Pedido | Motivo |
| --- | --- |
| Gerar Pix da inscrição | O regulamento (Art. 4º, III) diz que a inscrição é gratuita, e o pacote do cliente dispensa pagamento |
| E-mail de confirmação | Dispensado no pacote do cliente; exigiria um servidor, e o front-end deste teste é independente do back-end |
| Login | Dispensado no pacote do cliente |
| Autorização de responsáveis para menores | Dispensada no pacote do cliente; a idade mínima e o limite dos 10 km são aplicados |
| Bloqueio temporal de inscrições e cancelamentos (por exemplo, "antes da prova", Art. 7º, I) | Dispensado no pacote do cliente |
| Sincronização entre abas do navegador | O enunciado diz que não é obrigatória |
| Armazenamento em servidor | O enunciado pede persistência no `localStorage` |

## Verificações realizadas

### Testes automatizados

Os testes ficam nos arquivos `*.spec.ts`. São 56 testes, todos passando.

| Área | Casos testados | Resultado |
| --- | --- | --- |
| Fronteiras de idade | Aniversário antes, no dia e depois da prova; diferença só entre os anos; nascido em 29/02 | Passa |
| Idade mínima | 13 anos é recusado; quem completa 14 anos no dia da prova é aceito; a idade mínima tem precedência sobre os 10 km | Passa |
| 10 km | 17 anos nos 10 km é recusado; 17 anos nos 5 km é aceito como Juvenil; quem completa 18 anos no dia da prova é aceito nos 10 km como Adulto | Passa |
| Categorias | Fronteiras 17/18, 39/40 e 59/60 | Passa |
| Validação | Nome obrigatório, tamanho contado depois de normalizar, acentos, apóstrofos e hífens aceitos, números recusados; e-mail obrigatório e com formato válido; data inexistente e data futura recusadas; percurso obrigatório; mensagens do regulamento no campo certo | Passa |
| Duplicidade | `" Ana.Souza@Email.COM "` é recusado quando já existe `ana.souza@email.com` | Passa |
| Edição | Conserva posição e total, recalcula idade e categoria e move o percurso nos totais | Passa |
| Edição recusada | Dados, totais e armazenamento continuam idênticos aos anteriores | Passa |
| Edição inexistente | Não cria inscrição nova | Passa |
| Cancelamento | Remove pelo e-mail, mantém os demais, libera o recadastro e persiste ao recarregar; cancelar alguém ausente não altera nada | Passa |
| Armazenamento | Só os quatro campos são gravados; JSON corrompido começa vazio com aviso; registros inválidos ou repetidos são ignorados e os derivados recalculados; falha ao salvar mantém a aplicação funcionando com aviso | Passa |
| Rotas | Redirecionamento de `/`; cadastro e edição em modal; fluxo completo de cadastro voltando à lista; e-mail com `+` digitado e codificado na URL; edição preenchida com e-mail bloqueado; inscrição inexistente nos detalhes e na edição; caminho desconhecido | Passa |

### Verificações manuais no navegador

- **Cadastro, consulta, edição e cancelamento completos.** O resumo do cabeçalho acompanha cada operação, inclusive zerado.
- **Recusas do regulamento.** Aparecem no campo certo, com a idade na prova.
- **URLs.** Acesso direto e recarga em todas as rotas, botão voltar do navegador e e-mail com `+`.
- **Modal.**
  - Fecha pelo X, pelo Esc, pelo "Voltar" e pelo voltar do navegador.
  - O foco vai para o primeiro campo ao abrir.
  - A rolagem da página é liberada ao fechar.
- **Armazenamento.** JSON corrompido e registro inválido no `localStorage` mostram o aviso sem quebrar a tela.
- **Celular.** Layout em 375 px de largura, sem rolagem horizontal.
- **Instalação limpa.** Cópia do último commit, com `npm ci` usando npm 10 (o npm do Node 22), seguida de build e testes, que passaram. Não foi possível trocar o Node para a versão 22 neste ambiente; a compatibilidade com o Node 22.12 vem da declaração de `engines` do Angular 21.

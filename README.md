# Inscrições · 5ª Corrida Solidária da Vila Esperança

> Rascunho: as demais seções serão preenchidas seguindo o modelo de README fornecido.

## Conflitos e decisões

### Protótipo de interface × enunciado

O protótipo (https://prototipo-corrida.vercel.app/) é referência de interface e navegação. Onde ele diverge do enunciado, foi seguido o enunciado.

| Ponto | Protótipo | Decisão | Motivo |
|---|---|---|---|
| Rotas | Usa `#` na URL (`#/inscricoes/...`) | Angular Router com caminhos reais (`/inscricoes/...`) | O enunciado exige o Angular Router e URLs que funcionem coladas na barra e após recarregar |
| Página não encontrada | Mostra a mensagem e a lista de inscrições abaixo | Mostra a mensagem e um botão para voltar à lista | O enunciado pede "página não encontrada com retorno à lista" |
| Cancelamento | Remove a inscrição na hora, sem confirmação | Pede confirmação antes de cancelar | O cancelamento remove dados de forma irreversível; a confirmação evita cliques acidentais |
| Formulário | Modal sobre a lista, percurso em `select` | Página própria, percurso em botões de opção | O enunciado permite página ou modal; a página é mais simples de usar no celular e mostra as duas opções de percurso de uma vez |
| Visual | Cabeçalho branco, badges coloridos por categoria, primária `#2B50D8` | Cabeçalho azul com o resumo, ficha com rótulo e valor, primária `#1f5fbf` | Nenhum documento define cores; o enunciado diz que fidelidade visual não substitui funcionamento |

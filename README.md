# Memento Mori: Réquiem — Sistema Foundry VTT

**Versão do sistema: 0.8.1 — Baseado no Manual Básico de Regras v0.8.**
**Plataforma alvo: Foundry Virtual Tabletop v14.**

## Instalação por URL (após publicação no GitHub)

No Foundry VTT 14, abra **Configuração → Sistemas de Jogo → Instalar Sistema** e cole:

```text
https://raw.githubusercontent.com/rodrigoarka/memento-mori-requiem/main/system.json
```

Essa URL só estará disponível quando o repositório `rodrigoarka/memento-mori-requiem` existir e a primeira **Release v0.8.1** tiver sido publicada. Até lá, utilize a instalação manual abaixo.

Atualizações futuras usarão o mesmo manifesto estável. As instruções de publicação estão em `PUBLICACAO.md`.

## Instalar em 5 passos

1. Feche o Foundry VTT (especialmente se estiver usando a versão desktop).
2. Localize o diretório de dados do usuário do Foundry (*User Data*). Abra `Data/systems/`.
3. Extraia o ZIP de modo que o arquivo fique exatamente em `Data/systems/memento-mori-requiem/system.json`. Evite uma pasta duplicada `memento-mori-requiem/memento-mori-requiem/`.
4. Inicie o Foundry e crie um Mundo com o sistema **Memento Mori: Réquiem**.
5. Dentro do Mundo, abra **Configurações → Painel Memento Mori** e clique em **Conteúdo Inicial** para importar *A Segunda Lembrança*, entidades, domínio, Fissura e Assinaturas prontas.

Alternativa para o Narrador, com o Mundo aberto: Console do Foundry → `game.memento.openPanel()`.

> **Importante:** a distribuição local serve para instalação manual. O manifesto online depende do GitHub e da Release. O pacote não contém Foundry VTT, mapas comerciais ou a licença do aplicativo Foundry.

## O que foi implementado

### Atores

- **Retornado** — Capacidades 0–2; Profissão, Impressão, Incompletude e Primeira Lembrança; Aptidões e Assinaturas; Âncoras; Distância 0–6; Luto 0–3; Presságio; Ruptura, três Badaladas, salvamento ou quebra; Deriva; Travessia física, estratos profundos e regresso; recuperação por Âncoras; Transformações.
- **Confluência** — Verso Comum, participantes, Leis coletivas e oportunidade única por capítulo; Sincronia na Ressonância ou Rastro Compartilhado.
- **Entidade** — Natureza, Intenção, Lei, Limitação, Sinais, Consequência e Trilha de Pressão 0–4.
- **Domínio** — Três Sinais, Lei, Exceção, Preço, Oposição, rotas, Marco de Regresso, Matriz de Vozes e Pressão.
- **Fissura** — Origem, quatro etapas, contenção e avanço de no máximo um estágio por capítulo.

### Itens

Aptidão, Assinatura, Âncora, Lei, Verso, Correspondência, Condição, Vestígio e Equipamento. Itens são registros Foundry reais e podem ser arrastados para a ficha quando suportado pelo Foundry.

### Ferramentas

- **A Vontade**: cálculo determinístico, Condição, Resistência pública, Preparo/Conhecimento, Preço anunciado.
- **As Três Vozes**: três moedas independentes, oito combinações, chat público; Evocar, Conter e Sincronia após o lançamento. A Voz de Sincronia precisa ser pré-escolhida antes de ver as moedas.
- **Luto/Ruptura/Deriva**: a terceira perda é prioritária sobre a redução da Distância; Âncora salva = Distância 4; Âncora quebrada = Luto +1, Distância 0 se não houver Deriva.
- **Progresso**: um capítulo a cada objetivo narrativo significativo; uma Transformação a cada dois capítulos.
- **Versos/Estrofes**: coleta de evidências e hipótese compartilhada; a revelação final da exceção da Lei é escolha do Narrador.
- **A Segunda Lembrança**: Diário de sete partes, domínio, entidade, Fissura e quatro Assinaturas de referência.

## Procedimento de mesa recomendado

1. Crie a Confluência e Retornados; atribua propriedade das fichas aos jogadores.
2. Registre três Âncoras de cada Retornado como Itens (pessoa, lugar, promessa).
3. Para uma ação relevante, abra **A Vontade**, declare Condição, Resistência e eventual Preço.
4. Se houver gatilho sobrenatural, abra **As Três Vozes** e lance uma vez por acontecimento.
5. Após as moedas, decida se Evocar, Conter ou Sincronia. Para Sincronia com donos diferentes, recomenda-se o Narrador executar o lançamento: ele tem permissão para atualizar os dois Retornados.
6. Registre Versos e evidências, descubra Leis e mantenha a trilha de Pressão/Fissura atualizada.
7. O Narrador encerra o capítulo no **Painel Memento Mori**. Assinaturas, Confluência e recuperação ficam novamente disponíveis para o próximo capítulo.

## Limites deliberados da automação

- **Nenhuma moeda determina sucesso ou fracasso**: a manifestação é descrita pelo Narrador, respeitando a Lei e a Vontade.
- **O texto da manifestação não é inventado pelo sistema**: o chat revela quais Vozes estão despertas e o que foi escolhido; a mesa interpreta o acontecimento.
- **As condições de uma Correspondência** e o **resultado do resgate de uma Âncora** dependem das descobertas e escolhas. A automação não inventa esses fatos.
- **Luto não é reduzido por Recuperação**. A recuperação usa até duas Âncoras diferentes por capítulo na Vigília.
- **Desaparecimento, resgate e cenas de retorno** exigem decisões do Narrador e jogadores, sem sorteio de eliminação.
- **Aventura inicial não inclui cenas em mapa**: o Foundry suporta mapas, tokens, notas e iluminação, mas o manual não estabelece mapas exatos. O Narrador constrói cenas conforme a mesa.

## Compatibilidade e testes

O código segue o modelo atual `TypeDataModel` e as fichas `ApplicationV2`, usando os tipos declarados em `system.json`, conforme documentação oficial do Foundry v14. Foram efetuados testes estáticos e testes de regras independentes do Foundry. **A execução em um servidor real do Foundry não foi verificada neste ambiente**; faça um teste local antes de usá-lo em campanha e crie backup dos Mundos existentes.

## Estrutura

```
memento-mori-requiem/
  system.json
  module/{main,models,rules,services,dialogs,sheets,starter}.mjs
  templates/{actor,item,pressure,dashboard}.hbs
  styles/memento.css
  assets/logo.svg
  docs/manual-v0.8.pdf
  tests/rules.test.mjs
```

## Manual e direitos

O arquivo `docs/manual-v0.8.pdf` é a edição utilizada como fonte de regras. A logo incluída foi criada para este projeto. Todo o conteúdo de jogo presente no pacote tem finalidade de playtest e edição local.

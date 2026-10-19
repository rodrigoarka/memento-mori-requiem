# Publicação e atualização — Memento Mori: Réquiem

## Situação atual

O sistema Foundry VTT v14 está publicado como **pré-lançamento v0.8.2 (Foundry 13.348–14)**.

- Repositório: https://github.com/rodrigoarka/memento-mori-requiem
- Release: https://github.com/rodrigoarka/memento-mori-requiem/releases/tag/v0.8.2
- Manifesto (URL fixa para instalação e atualizações): https://raw.githubusercontent.com/rodrigoarka/memento-mori-requiem/main/system.json
- ZIP instalável v0.8.2: https://github.com/rodrigoarka/memento-mori-requiem/releases/download/v0.8.2/memento-mori-requiem.zip

## Como publicar novas versões

A automação está configurada em `.github/workflows/publish.yml`.

1. Atualize `version` em `system.json` e em `package.json`, por exemplo `0.8.3`.
2. Atualize a propriedade `download` no `system.json` para terminar em `/releases/download/v0.8.3/memento-mori-requiem.zip`.
3. Atualize `CHANGELOG.md` e as regras/código relevantes.
4. Envie as alterações para a branch `main`.
5. O GitHub Actions roda a verificação de sintaxe e os nove testes, verifica o manifesto, empacota os arquivos e cria a Release e tag `v0.8.3` com `memento-mori-requiem.zip` e `system.json`. Se a Release dessa versão já existir, a automação preserva os artefatos existentes.

Acompanhe a automação em https://github.com/rodrigoarka/memento-mori-requiem/actions.

## Primeira instalação

No Foundry VTT 13.348 ou 14, em Sistemas de Jogo > Instalar Sistema, cole o endereço do manifesto acima. Depois crie um Mundo com Memento Mori: Réquiem.

**Limitação atual:** testes automatizados concluídos, mas o sistema ainda não foi validado em uma instalação real do Foundry. Recomenda-se testar em um Mundo novo.

## Licenciamento

Nenhuma licença de uso de código aberto foi selecionada. Um repositório público permite visualização do código, mas não significa permissão automática de redistribuição ou modificação.

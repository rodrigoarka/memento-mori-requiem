# Publicação no GitHub

Repositório previsto: `rodrigoarka/memento-mori-requiem`.

## Procedimento sem terminal (conectado ao assistente)

1. Crie um repositório chamado `memento-mori-requiem` em https://github.com/new (escolha visibilidade pública; inicialize com README para criar a branch `main`; não escolha licença ou .gitignore).
2. Garanta que a integração GitHub usada pelo ChatGPT tenha acesso ao repositório recém-criado.
3. Retorne à conversa e peça para enviar os arquivos. Depois disso, a publicação pode ser feita no repositório criado.
4. A primeira release `v0.8.1` deve ser criada por push da tag correspondente.

## Procedimento local com Git/GitHub CLI

Extraia `Memento_Mori_Requiem_GitHub_ready_v0_8_1.zip` em uma pasta e, dentro dela:

```bash
git init -b main
git add .
git commit -m "feat: sistema Foundry Memento Mori Requiem v0.8.1"
gh auth login
gh repo create rodrigoarka/memento-mori-requiem --public --source . --remote origin --push
git tag v0.8.1
git push origin v0.8.1
```

A ação de release roda automaticamente após a tag ser enviada (GitHub Actions precisa estar habilitado).

## Links que ficarão válidos após a primeira release

- Código: https://github.com/rodrigoarka/memento-mori-requiem
- Manifesto Foundry: https://raw.githubusercontent.com/rodrigoarka/memento-mori-requiem/main/system.json
- Download do ZIP instalado pelo Foundry: https://github.com/rodrigoarka/memento-mori-requiem/releases/download/v0.8.1/memento-mori-requiem.zip

Os links acima **ainda não estão publicados** até que o repositório seja criado e a primeira release termine.

## Próxima versão

1. Alterar `version` em `system.json` e `package.json`.
2. Atualizar `download` de `system.json` para `/releases/download/vNOVA_VERSAO/memento-mori-requiem.zip`.
3. Atualizar `CHANGELOG.md`.
4. Commit em `main`.
5. Criar e enviar tag `vNOVA_VERSAO`.

O endereço do manifesto permanece estável para verificações de atualização no Foundry.

## Licenciamento

Nenhuma licença open source foi escolhida; publicar o código publicamente não concede automaticamente uma licença de reutilização. Decida o licenciamento antes de receber contribuições externas.

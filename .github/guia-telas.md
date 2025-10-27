# Guia para Criar uma Nova Tela no Projeto

Olá! Este guia foi feito para você que está começando. Vamos passar por todas as etapas para criar uma nova tela, estilizá-la e enviá-la para o projeto principal.

---

## Parte 1: Preparando o Terreno (Comandos do Git)

Antes de começar a programar, precisamos organizar nosso ambiente de trabalho. Isso evita conflitos e mantém o histórico do projeto limpo.

### 1. Sincronize seu projeto
Garanta que você tem a versão mais recente do código.

```bash
# Vá para a branch principal
git checkout main

# Baixe as atualizações mais recentes
git pull origin main
```

### 2. Crie uma nova branch
Nunca trabalhe diretamente na branch `main`. Crie uma "cópia" dela para fazer suas alterações. Dê um nome que descreva o que você vai fazer.

**Exemplo:** `feature/tela-de-perfil` ou `fix/bug-no-login`.

```bash
# Crie e mude para a sua nova branch
git checkout -b feature/nome-da-sua-tela
```

---

## Parte 2: Criando o Arquivo da Nova Tela

Este projeto usa um sistema de rotas baseado em arquivos. Isso significa que para criar uma nova página, basta criar um novo arquivo na pasta `app/`.

### 1. Crie o arquivo
- Vá até a pasta `app/`.
- Crie um novo arquivo com o nome da sua tela, por exemplo: `perfil.tsx`.
- O nome do arquivo será o endereço da página (ex: `seusite.com/perfil`).

### 2. Estrutura básica da tela
Copie e cole este código inicial no seu arquivo `perfil.tsx`:

```tsx
import { Text, View } from 'react-native';

// O nome da função deve ser o nome da tela em PascalCase
export default function PerfilScreen() {
  return (
    // A View é como uma "caixa" que agrupa outros elementos
    <View>
      {/* Text é usado para exibir qualquer texto */}
      <Text>Olá, esta é a tela de Perfil!</Text>
    </View>
  );
}
```

---

## Parte 3: Estilizando a Tela com NativeWind

Usamos **NativeWind** para estilizar, que é uma forma de escrever CSS diretamente no código. Em vez de um arquivo `.css`, você usa a propriedade `className`.

### 1. Como funciona?
Você adiciona classes de estilo diretamente nos componentes (`View`, `Text`, etc.).

**Exemplo:**

```tsx
// Sem estilo
<View>
  <Text>Login</Text>
</View>

// Com estilo
<View className="bg-blue-500 p-4 rounded-lg">
  <Text className="text-white text-center font-bold">Login</Text>
</View>
```

### 2. Classes mais comuns:
- **Cores de fundo:** `bg-blue-500`, `bg-gray-200`, `bg-white`
- **Cores de texto:** `text-white`, `text-black`, `text-gray-600`
- **Tamanho do texto:** `text-sm` (pequeno), `text-base` (normal), `text-lg` (grande), `text-xl`
- **Espaçamento interno (padding):** `p-4` (em todos os lados), `py-2` (vertical), `px-3` (horizontal)
- **Margens (espaçamento externo):** `m-4`, `my-2`, `mx-3`
- **Bordas arredondadas:** `rounded`, `rounded-lg`, `rounded-full`
- **Alinhamento (Flexbox):**
  - `flex-1`: Faz a `View` ocupar todo o espaço disponível.
  - `items-center`: Alinha os itens no centro (horizontalmente).
  - `justify-center`: Alinha os itens no centro (verticalmente).

### Exemplo prático:
Vamos deixar nossa tela de perfil mais bonita.

```tsx
import { Text, View } from 'react-native';

export default function PerfilScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-100 p-4">
      <Text className="text-2xl font-bold text-gray-800">
        Minha Tela de Perfil
      </Text>
      <Text className="mt-2 text-gray-600">
        Aqui você pode editar suas informações.
      </Text>
    </View>
  );
}
```

---

## Parte 4: Enviando seu Trabalho (Git e GitHub)

Terminou a tela? Hora de compartilhar seu trabalho!

### 1. Adicione e "Comite" suas alterações
Isso cria um "pacote" com tudo que você fez.

```bash
# Adiciona todos os arquivos modificados
git add .

# Cria o "commit" com uma mensagem clara
git commit -m "feat: Adiciona a nova tela de perfil"
```
> **Dica:** Boas mensagens de commit são curtas e diretas. Ex: `feat: ...` para novas funcionalidades, `fix: ...` para correção de bugs.

### 2. Envie para o GitHub
Agora, envie sua branch para o repositório online.

```bash
# Substitua "feature/nome-da-sua-tela" pelo nome da sua branch
git push origin feature/nome-da-sua-tela
```

---

## Parte 5: Criando o Pull Request (PR)

O Pull Request (ou PR) é um pedido para juntar o seu código ao projeto principal.

1.  **Abra o GitHub:** Vá para a página do repositório no seu navegador.
2.  **Crie o PR:** O GitHub geralmente mostra um aviso amarelo com o nome da sua branch. Clique no botão **"Compare & pull request"**.
3.  **Escreva uma boa descrição:**
    - **Título:** Mantenha o título do seu commit.
    - **Descrição:** Explique o que você fez e por quê. Um bom modelo é:
      > **O que foi feito?**
      > Criei a nova tela de perfil com a estrutura básica e estilização inicial.
      >
      > **Como testar?**
      > 1. Rode o projeto.
      > 2. Navegue para a rota `/perfil`.
      > 3. Verifique se a tela aparece corretamente.

4.  **Peça uma revisão:** Marque uma ou mais pessoas do time para revisarem seu código.
5.  **Aguarde a aprovação:** O revisor pode aprovar diretamente ou pedir algumas alterações. Faça os ajustes necessários e envie novamente (`git push`).
6.  **Merge:** Após a aprovação, seu código será integrado à branch `main`. Parabéns!

---

### Resumo do Fluxo
`git checkout main` → `git pull` → `git checkout -b nome-branch` → **(Programe sua tela)** → `git add .` → `git commit` → `git push` → **(Abra o PR no GitHub)**.
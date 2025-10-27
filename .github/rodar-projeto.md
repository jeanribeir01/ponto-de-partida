# Como rodar o projeto ponto-de-partida

Este guia é para pessoas iniciantes. Siga o passo a passo para instalar e rodar o app no seu computador ou celular.

---

## 1. Pré-requisitos

- **Git:** [Baixe aqui](https://git-scm.com/downloads)
- **Node.js:** [Baixe aqui (versão LTS)](https://nodejs.org/)
- **Expo Go:** (para rodar no celular)  
  - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)  
  - [iOS](https://apps.apple.com/app/expo-go/id982107779)

---

## 2. Baixe o projeto

Abra o terminal e digite:
```
git clone https://github.com/SEU_USUARIO/ponto-de-partida.git
```
Troque `SEU_USUARIO` pelo nome correto do repositório, se necessário.

---

## 3. Entre na pasta do projeto

```
cd ponto-de-partida
```

---

## 4. Instale o Expo CLI (caso ainda não tenha)

```
npm install -g expo-cli
```

---

## 5. Instale as dependências do projeto

```
npm install
```

---

## 6. Inicie o servidor de desenvolvimento

```
npm start
```
ou
```
expo start
```

---

## 7. Execute o app

- **No celular:**  
  1. Abra o app Expo Go.
  2. Escaneie o QR Code que aparece no terminal ou navegador.

- **No emulador:**  
  - Android:  
    ```
    npm run android
    ```
  - iOS (apenas Mac):  
    ```
    npm run ios
    ```

---

## 8. Dicas importantes

- Sempre mantenha o terminal aberto enquanto usa o app.
- Se aparecer algum erro, confira se instalou todas as dependências.
- Para sair, pressione `Ctrl + C` no terminal.

---

Pronto! O app estará rodando.  
Se precisar de ajuda, consulte o responsável pelo projeto ou o arquivo `README.md`.
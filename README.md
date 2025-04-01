# App de Assinaturas - Frontend

Aplicação frontend para gerenciamento de assinaturas, clientes, vendedores e pedidos com integração ao gateway de pagamentos Asaas.

## Sobre o Projeto

Este projeto é um sistema completo para gerenciamento de assinaturas recorrentes, desenvolvido com:
- Vue.js 3
- TypeScript
- Vue Router
- Pinia
- Axios

## Funcionalidades

- **Gestão de Assinaturas**
  - Lista de assinaturas de clientes e vendedores
  - Detalhamento de cada assinatura
  - Cancelamento de assinaturas

- **Simulação de Assinaturas**
  - Seleção de cliente 
  - Seleção de produtos
  - Configuração de ciclo, vencimento e método de pagamento
  - Criação de pedido e assinatura

- **Painel Administrativo**
  - Gestão de clientes (CRUD completo)
  - Gestão de vendedores (CRUD completo)
  - Gestão de pedidos (visualização e exclusão)
  - Sincronização com o gateway de pagamentos Asaas

## Estrutura do Projeto

A estrutura do projeto é a seguinte:

```
src/
|-- assets/
|-- components/
|-- config/
|-- router/
|-- services/
|-- stores/
|-- utils/
|-- views/
|-- App.vue
|-- main.ts
```

## Como Executar

Para executar o projeto, siga os passos abaixo:

1. Clone o repositório:
   ```bash
   git clone https://github.com/m6rc0sp/app-de-assinaturas-frontend.git
   ```

2. Navegue até o diretório do projeto:
   ```bash
   cd app-de-assinaturas-frontend/app-front
   ```

3. Instale as dependências:
   ```bash
   npm install
   ```

4. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Abra o navegador e acesse `http://localhost:5173` para ver a aplicação em execução.


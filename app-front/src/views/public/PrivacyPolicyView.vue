<script setup lang="ts">
// Página de políticas de privacidade
</script>

<template>
  <div class="privacy-page">
    <h1>Política de Privacidade</h1>
    
    <div class="privacy-container">
      <div class="last-updated">
        Última atualização: 1 de junho de 2025
      </div>
      
      <section class="privacy-section">
        <h2>Introdução</h2>
        <p>
          Esta Política de Privacidade descreve como coletamos, usamos e compartilhamos suas informações pessoais quando você utiliza nosso sistema de assinaturas. Respeitamos sua privacidade e estamos comprometidos em proteger suas informações pessoais.
        </p>
      </section>
      
      <section class="privacy-section">
        <h2>Quais informações coletamos</h2>
        <p>
          Para proporcionar a melhor experiência possível, coletamos as seguintes informações:
        </p>
        <ul>
          <li><strong>Informações pessoais:</strong> Nome, e-mail, CPF/CNPJ, telefone e endereço.</li>
          <li><strong>Informações de pagamento:</strong> Dados de cartão de crédito (processados por gateway de pagamento seguro) ou dados para boleto.</li>
          <li><strong>Informações de navegação:</strong> Cookies, endereço IP e dados de uso do site.</li>
        </ul>
      </section>
      
      <section class="privacy-section">
        <h2>Como utilizamos suas informações</h2>
        <p>
          Utilizamos as informações coletadas para:
        </p>
        <ul>
          <li>Processar suas assinaturas e pagamentos</li>
          <li>Fornecer suporte ao cliente</li>
          <li>Enviar comunicações importantes sobre sua assinatura</li>
          <li>Melhorar nossos serviços</li>
        </ul>
      </section>
      
      <section class="privacy-section">
        <h2>Compartilhamento de informações</h2>
        <p>
          Nunca vendemos suas informações pessoais. Compartilhamos apenas com:
        </p>
        <ul>
          <li>Provedores de serviços (processamento de pagamento, hospedagem)</li>
          <li>Autoridades legais quando exigido por lei</li>
        </ul>
      </section>
      
      <section class="privacy-section">
        <h2>Seus direitos</h2>
        <p>
          De acordo com a LGPD (Lei Geral de Proteção de Dados), você tem direito a:
        </p>
        <ul>
          <li>Acessar seus dados</li>
          <li>Corrigir seus dados</li>
          <li>Excluir seus dados (quando aplicável)</li>
          <li>Revogar seu consentimento</li>
          <li>Solicitar portabilidade dos dados</li>
        </ul>
      </section>
      
      <section class="privacy-section">
        <h2>Segurança</h2>
        <p>
          Implementamos medidas técnicas e organizacionais para proteger suas informações pessoais contra acesso não autorizado, perda ou alteração.
        </p>
      </section>
      
      <section class="privacy-section">
        <h2>Contato</h2>
        <p>
          Se você tiver dúvidas ou preocupações sobre esta Política de Privacidade, entre em contato conosco pelo e-mail: <a href="mailto:privacidade@appns.com.br">privacidade@appns.com.br</a>
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.privacy-page {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.privacy-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

h1 {
  margin-bottom: 1.5rem;
  color: #335;
  text-align: center;
}

.last-updated {
  text-align: right;
  color: #666;
  font-style: italic;
  margin-bottom: 2rem;
}

.privacy-section {
  margin-bottom: 2rem;
}

.privacy-section h2 {
  color: #335;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid #eee;
}

.privacy-section p {
  margin-bottom: 1rem;
  color: #444;
  line-height: 1.5;
}

.privacy-section ul {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.privacy-section li {
  margin-bottom: 0.5rem;
  color: #444;
}

a {
  color: #4285f4;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>

<script setup lang="ts">
// Página de suporte
import { ref } from 'vue';

const nome = ref('');
const email = ref('');
const assunto = ref('');
const mensagem = ref('');
const enviado = ref(false);
const erro = ref(false);

// Função simulada para envio do formulário
function enviarFormulario() {
  // Em produção, aqui seria uma chamada para uma API
  if (nome.value && email.value && mensagem.value) {
    enviado.value = true;
    erro.value = false;
    // Limpar formulário após envio
    setTimeout(() => {
      nome.value = '';
      email.value = '';
      assunto.value = '';
      mensagem.value = '';
      enviado.value = false;
    }, 5000);
  } else {
    erro.value = true;
  }
}
</script>

<template>
  <div class="support-page">
    <h1>Suporte</h1>
    
    <div class="support-container">
      <div class="support-options">
        <div class="support-card">
          <div class="icon">📋</div>
          <h3>Perguntas Frequentes</h3>
          <p>Confira as respostas para as dúvidas mais comuns sobre nossos serviços e assinaturas.</p>
          <button class="btn-secondary">Ver FAQ</button>
        </div>
        
        <div class="support-card">
          <div class="icon">📖</div>
          <h3>Base de Conhecimento</h3>
          <p>Acesse nossa documentação completa com tutoriais e guias passo a passo.</p>
          <button class="btn-secondary">Ver Documentação</button>
        </div>
        
        <div class="support-card">
          <div class="icon">💬</div>
          <h3>Chat ao Vivo</h3>
          <p>Converse em tempo real com nossos atendentes disponíveis nos dias úteis das 9h às 18h.</p>
          <button class="btn-primary">Iniciar Chat</button>
        </div>
      </div>
      
      <div class="contact-form-section">
        <h2>Entre em Contato</h2>
        <p>Não encontrou o que procurava? Envie-nos uma mensagem e retornaremos em até 24 horas úteis.</p>
        
        <div v-if="enviado" class="success-message">
          <p>Mensagem enviada com sucesso! Em breve entraremos em contato.</p>
        </div>
        
        <div v-else-if="erro" class="error-message">
          <p>Por favor, preencha todos os campos obrigatórios.</p>
        </div>
        
        <form @submit.prevent="enviarFormulario" class="contact-form">
          <div class="form-row">
            <div class="form-group">
              <label for="nome">Nome <span class="required">*</span></label>
              <input 
                type="text" 
                id="nome" 
                v-model="nome" 
                placeholder="Seu nome completo"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="email">E-mail <span class="required">*</span></label>
              <input 
                type="email" 
                id="email" 
                v-model="email" 
                placeholder="seu.email@exemplo.com"
                required
              >
            </div>
          </div>
          
          <div class="form-group">
            <label for="assunto">Assunto</label>
            <input 
              type="text" 
              id="assunto" 
              v-model="assunto" 
              placeholder="Do que se trata sua mensagem?"
            >
          </div>
          
          <div class="form-group">
            <label for="mensagem">Mensagem <span class="required">*</span></label>
            <textarea 
              id="mensagem" 
              v-model="mensagem" 
              rows="5" 
              placeholder="Descreva sua dúvida ou problema em detalhes..."
              required
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-primary">Enviar Mensagem</button>
          </div>
        </form>
      </div>
      
      <div class="additional-info">
        <h3>Informações de Contato</h3>
        <div class="contact-info">
          <div class="contact-item">
            <div class="icon-small">✉️</div>
            <div>
              <h4>E-mail</h4>
              <p>suporte@appns.com.br</p>
            </div>
          </div>
          
          <div class="contact-item">
            <div class="icon-small">📞</div>
            <div>
              <h4>Telefone</h4>
              <p>(11) 3456-7890</p>
            </div>
          </div>
          
          <div class="contact-item">
            <div class="icon-small">🕒</div>
            <div>
              <h4>Horário de Atendimento</h4>
              <p>Segunda a Sexta, das 9h às 18h</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.support-page {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.support-container {
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

.support-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.support-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #eee;
}

.support-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.icon-small {
  font-size: 1.5rem;
  margin-right: 1rem;
  min-width: 40px;
  text-align: center;
}

.support-card h3 {
  color: #335;
  margin-bottom: 0.75rem;
}

.support-card p {
  color: #666;
  margin-bottom: 1.5rem;
  min-height: 60px;
}

.contact-form-section {
  border-top: 1px solid #eee;
  padding-top: 2rem;
  margin-top: 1rem;
  margin-bottom: 2rem;
}

.contact-form-section h2 {
  color: #335;
  margin-bottom: 1rem;
}

.contact-form-section > p {
  color: #666;
  margin-bottom: 2rem;
}

.contact-form {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.required {
  color: #e53935;
}

input, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  margin-top: 1.5rem;
  text-align: right;
}

.btn-primary {
  background-color: #335;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #223;
}

.btn-secondary {
  background-color: white;
  color: #335;
  border: 1px solid #335;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #f0f0f0;
}

.success-message {
  background-color: #e6f7e6;
  color: #2e7d32;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #2e7d32;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #c62828;
}

.additional-info {
  border-top: 1px solid #eee;
  padding-top: 2rem;
}

.additional-info h3 {
  color: #335;
  margin-bottom: 1.5rem;
}

.contact-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.contact-item {
  display: flex;
  align-items: center;
}

.contact-item h4 {
  margin: 0 0 0.25rem 0;
  color: #335;
}

.contact-item p {
  margin: 0;
  color: #666;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .contact-info {
    grid-template-columns: 1fr;
  }
}
</style>

<template>
  <div class="about">
    <h1>Sobre o App de Assinaturas</h1>
    
    <div class="about-content">
      <p>
        O App de Assinaturas é uma plataforma completa para gerenciamento de assinaturas recorrentes,
        facilitando a administração de cobranças, cliente e pagamentos.
      </p>
      
      <h2>Recursos</h2>
      <ul>
        <li>Gerenciamento completo de assinaturas</li>
        <li>Acompanhamento de status e vencimentos</li>
        <li>Notificações automáticas</li>
        <li>Integração com gateway de pagamentos</li>
        <li>Relatórios detalhados</li>
      </ul>
      
      <h2>Tecnologias</h2>
      <p>
        Este aplicativo foi desenvolvido utilizando Vue.js 3, TypeScript e integração com APIs RESTful.
      </p>
      
      <h2>Versão</h2>
      <p>1.0.0 (Beta)</p>
    </div>
  </div>
</template>

<style scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #335;
}

.about-content {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #335;
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-size: 1.4rem;
}

p {
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

ul {
  padding-left: 1.5rem;
  margin-bottom: 1.5rem;
}

li {
  margin-bottom: 0.5rem;
}
</style>

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const mangaRoutes = require('./routes/mangaRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 8000;

// 🔒 Middleware de segurança com CSP personalizado
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], // Permite scripts apenas do mesmo domínio (externos OK, inline bloqueado)
      styleSrc: ["'self'", "'unsafe-inline'"], // Permite CSS inline (pode remover 'unsafe-inline' para mais segurança)
      objectSrc: ["'none'"], // Bloqueia Flash/embeds
    },
  })
);

// 🗂️ Middleware para servir arquivos estáticos (CSS, JS, imagens etc.)
app.use(express.static(path.join(__dirname, 'public')));

// 📁 Rota para fornecer chapters.json diretamente
app.get('/chapters.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'chapters.json'));
});

// 🏠 Página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// 📚 Rotas específicas do projeto
app.use('/manga', mangaRoutes);
app.use('/admin', adminRoutes);

// ❌ Middleware para tratar erros internos
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Erro interno no servidor!');
});

// 🚀 Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

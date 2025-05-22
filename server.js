const express = require('express');
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');

const mangaRoutes = require('./routes/mangaRoutes');
const adminRoutes = require('./routes/adminRoutes');
// const uploadRoutes = require('./routes/uploadRoutes'); // 👈 Novo

const app = express();
const PORT = process.env.PORT || 8000;

// 🔐 Sessão para login
app.use(session({
  secret: 'segredo-super-seguro', // troque isso em produção
  resave: false,
  saveUninitialized: false
}));

// 🔒 Segurança
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      objectSrc: ["'none'"],
    },
  })
);

// 🗂️ Arquivos estáticos (inclui as imagens dos capítulos)
app.use(express.static(path.join(__dirname, 'public')));

// 🧠 Parse de corpo
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 📁 JSONs públicos
app.get('/chapters.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'chapters.json'));
});

// 🏠 Página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// 📚 Rotas principais
app.use('/manga', mangaRoutes);
app.use('/admin', adminRoutes);
app.use('/admin', uploadRoutes); // 👈 Nova rota de upload

// ❌ Erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Erro interno no servidor!');
});

// 🚀 Inicializa
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

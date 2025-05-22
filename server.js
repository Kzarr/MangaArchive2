const express = require('express');
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');

const uploadRoutes = require('./routes/uploadRoutes');
const mangaRoutes = require('./routes/mangaRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 8000;

// Configuração de segurança e middleware
app.use(session({
  secret: 'segredo-super-seguro',
  resave: false,
  saveUninitialized: false
}));

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    objectSrc: ["'none'"],
  },
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/chapters.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'chapters.json'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Definição das rotas corretamente
app.use('/manga', mangaRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/upload', uploadRoutes); // Definindo corretamente a rota de upload

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Erro interno no servidor!');
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

const express = require('express');
const path = require('path');
const mangaRoutes = require('./routes/mangaRoutes');

const app = express();
const PORT = 8000;

app.use(express.static(path.join(__dirname, 'public')));4
app.use('/chapters.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'chapters.json'));
});
app.use('/', mangaRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

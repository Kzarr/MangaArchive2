const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8000;

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Página de leitura de capítulo
app.get('/manga/:slug/:chapter', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'chapter.html'));
});

// API para retornar dados de um capítulo
app.get('/api/manga/:slug/:chapter', (req, res) => {
  const mangas = JSON.parse(fs.readFileSync('./data/mangas.json'));
  const chapters = JSON.parse(fs.readFileSync('./data/chapters.json'));

  const manga = mangas.find(m => m.slug === req.params.slug);
  if (!manga) return res.status(404).json({ error: 'Mangá não encontrado' });

  const chapterNum = parseInt(req.params.chapter);
  const chapter = chapters.find(c => c.mangaId === manga.id && c.number === chapterNum);
  if (!chapter) return res.status(404).json({ error: 'Capítulo não encontrado' });

  res.json({
    mangaTitle: manga.title,
    chapterTitle: chapter.title,
    folder: manga.slug,
    pages: chapter.pageCount
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

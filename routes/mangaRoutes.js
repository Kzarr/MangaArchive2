const express = require('express');
const router = express.Router();
const { getMangaChapterData } = require('../controllers/mangaController');
const path = require('path');

router.get('/manga/:slug/:chapter', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'chapter.html'));
});

router.get('/api/manga/:slug/:chapter', (req, res) => {
  const { slug, chapter } = req.params;
  const data = getMangaChapterData(slug, chapter);

  if (!data) return res.status(404).json({ error: 'Mangá ou capítulo não encontrado' });
  res.json(data);
});

module.exports = router;

const { readJson, writeJson } = require('../utils/fileUtils');
const { generateId } = require('../utils/idUtils');

router.use(express.json()); // para aceitar JSON no corpo da requisição

router.post('/api/manga', (req, res) => {
  const { title, description, slug } = req.body;

  if (!title || !slug) {
    return res.status(400).json({ error: 'Título e slug são obrigatórios' });
  }

  const mangas = readJson('mangas.json');
  if (mangas.find(m => m.slug === slug)) {
    return res.status(409).json({ error: 'Slug já existe' });
  }

  const newManga = {
    id: generateId(mangas),
    title,
    slug,
    description: description || ""
  };

  mangas.push(newManga);
  const success = writeJson('mangas.json', mangas);

  if (!success) return res.status(500).json({ error: 'Erro ao salvar mangá' });
  res.status(201).json(newManga);
});

router.post('/api/manga/:slug/chapter', (req, res) => {
  const { number, title, pageCount } = req.body;
  const slug = req.params.slug;

  if (!number || !pageCount) {
    return res.status(400).json({ error: 'Número e pageCount são obrigatórios' });
  }

  const mangas = readJson('mangas.json');
  const chapters = readJson('chapters.json');
  const manga = mangas.find(m => m.slug === slug);

  if (!manga) return res.status(404).json({ error: 'Mangá não encontrado' });

  if (chapters.find(c => c.mangaId === manga.id && c.number === parseInt(number))) {
    return res.status(409).json({ error: 'Capítulo já existe' });
  }

  const newChapter = {
    mangaId: manga.id,
    number: parseInt(number),
    title: title || `Capítulo ${number}`,
    pageCount: parseInt(pageCount)
  };

  chapters.push(newChapter);
  const success = writeJson('chapters.json', chapters);

  if (!success) return res.status(500).json({ error: 'Erro ao salvar capítulo' });
  res.status(201).json(newChapter);
});

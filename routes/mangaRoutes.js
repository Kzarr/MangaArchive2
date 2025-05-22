const express = require('express');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { readJson, writeJson } = require('../utils/fileUtils');
const { generateId } = require('../utils/idUtils');

const router = express.Router();
router.use(express.json());

// ✅ Rota: lista de mangás
router.get('/api/mangas', (req, res) => {
  try {
    const mangas = readJson('mangas.json');
    res.json(mangas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar lista de mangás' });
  }
});

// ✅ Rota: página HTML do capítulo
router.get('/:slug/:chapter', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'chapter.html'));
});

// ✅ Rota: dados JSON do capítulo
router.get('/api/:slug/:chapter', (req, res) => {
  const { slug, chapter } = req.params;

  try {
    const mangas = readJson('mangas.json');
    const chapters = readJson('chapters.json');

    const manga = mangas.find(m => m.slug === slug);
    if (!manga) return res.status(404).json({ error: 'Mangá não encontrado' });

    const chap = chapters.find(c => c.mangaId === manga.id && c.number === parseInt(chapter));
    if (!chap) return res.status(404).json({ error: 'Capítulo não encontrado' });

    // 👇 Aqui é a correção chave: caminho real da pasta de imagens
    const folder = `${slug}/cap-${chapter}`;

    res.json({
      mangaTitle: manga.title,
      chapterTitle: chap.title,
      pages: chap.pageCount,
      folder
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter os dados do capítulo' });
  }
});

// ✅ Rota: adicionar novo mangá
router.post(
  '/api/manga',
  [
    body('title').notEmpty().withMessage('Título é obrigatório'),
    body('slug').notEmpty().withMessage('Slug é obrigatório'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, slug } = req.body;
      const mangas = readJson('mangas.json');
      const newManga = {
        id: generateId(),
        title,
        slug,
      };

      mangas.push(newManga);
      writeJson('mangas.json', mangas);

      res.status(201).json({ message: 'Mangá adicionado com sucesso', manga: newManga });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao adicionar mangá' });
    }
  }
);

module.exports = router;

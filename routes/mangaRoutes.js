const express = require('express');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { getMangaChapterData } = require('../controllers/mangaController');
const { readJson, writeJson } = require('../utils/fileUtils');
const { generateId } = require('../utils/idUtils');

const router = express.Router();
router.use(express.json());

// ✅ NOVA ROTA: retorna lista de mangás
router.get('/api/mangas', (req, res) => {
  try {
    const mangas = readJson('mangas.json');
    res.json(mangas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar lista de mangás' });
  }
});

// 📄 Visualizar capítulo
router.get('/:slug/:chapter', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'chapter.html'));
});

// 📄 Dados JSON do capítulo
router.get('/api/:slug/:chapter', (req, res) => {
  const { slug, chapter } = req.params;
  try {
    const data = getMangaChapterData(slug, chapter);
    if (!data) return res.status(404).json({ error: 'Capítulo não encontrado' });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter os dados do capítulo' });
  }
});

// ➕ Criar novo mangá
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

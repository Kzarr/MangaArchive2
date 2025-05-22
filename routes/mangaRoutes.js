const express = require('express');
const router = express.Router();
const path = require('path');
const { body, validationResult } = require('express-validator');
const { getMangaChapterData } = require('../controllers/mangaController');
const { readJson, writeJson } = require('../utils/fileUtils');
const { generateId } = require('../utils/idUtils');

router.use(express.json()); // aceita JSON no corpo das requisições

// Rota de visualização da leitura do capítulo
router.get('/manga/:slug/:chapter', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'chapter.html'));
});

// Rota de dados do capítulo em JSON
router.get('/api/manga/:slug/:chapter', (req, res) => {
  const { slug, chapter } = req.params;
  const data = getMangaChapterData(slug, chapter);

  if (!data) return res.status(404).json({ error: 'Mangá ou capítulo não encontrado' });
  res.json(data);
});

// Rota para adicionar um novo mangá com validação
router.post(
  '/api/manga',
  [
    body('title').notEmpty().withMessage('Título é obrigatório'),
    body('slug')
      .notEmpty().withMessage('Slug é obrigatório')
      .matches(/^[a-z0-9-]+$/).withMessage('Slug deve conter apenas letras minúsculas, números e hífens'),
    body('description').optional().isString()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, slug, description } = req.body;
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
  }
);

// Rota para adicionar um novo capítulo com validação
router.post(
  '/api/manga/:slug/chapter',
  [
    body('number').isInt({ min: 1 }).withMessage('Número do capítulo deve ser um inteiro ≥ 1'),
    body('pageCount').isInt({ min: 1 }).withMessage('pageCount deve ser um inteiro ≥ 1'),
    body('title').optional().isString()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { number, title, pageCount } = req.body;
    const { slug } = req.params;

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
  }
);

// Rota para listar todos os mangás
router.get('/api/mangas', (req, res) => {
  const mangas = readJson('mangas.json');
  res.json(mangas);
});

// Rota para listar capítulos de um mangá
router.get('/api/manga/:slug/chapters', (req, res) => {
  const mangas = readJson('mangas.json');
  const chapters = readJson('chapters.json');
  const { slug } = req.params;

  const manga = mangas.find(m => m.slug === slug);
  if (!manga) return res.status(404).json({ error: 'Mangá não encontrado' });

  const mangaChapters = chapters.filter(c => c.mangaId === manga.id);
  res.json(mangaChapters);
});

module.exports = router;

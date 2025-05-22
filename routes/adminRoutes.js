const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { readJson, writeJson } = require('../utils/fileUtils');
const { generateId } = require('../utils/idUtils');
const isAuthenticated = require('../middleware/auth');

const router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// 🔐 Usuário fixo para login
const ADMIN_USER = {
  username: 'admin',
  passwordHash: bcrypt.hashSync('1234', 10) // senha padrão
};

// 🔒 Middleware de autenticação de sessão
function authMiddleware(req, res, next) {
  if (req.session.loggedIn) return next();
  res.redirect('/admin/login');
}

// 🧾 Página de login
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
});

// 🔓 Processa login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (
    username === ADMIN_USER.username &&
    bcrypt.compareSync(password, ADMIN_USER.passwordHash)
  ) {
    req.session.loggedIn = true;
    return res.redirect('/admin/dashboard');
  }
  res.send('Login inválido. <a href="/admin/login">Tentar novamente</a>');
});

// 🚪 Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// 📂 Painel administrativo
router.get('/dashboard', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'adminDashboard.html'));
});

// 📤 Página de upload
router.get('/upload', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'upload.html'));
});

// 📦 Configuração do multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { slug, chapter } = req.body;
    const uploadPath = path.join(__dirname, '..', 'public', 'mangas', slug, `cap-${chapter}`);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// 📥 Processa upload
router.post(
  '/upload',
  authMiddleware,
  upload.array('pages'),
  [
    body('slug').notEmpty().withMessage('Slug é obrigatório'),
    body('chapter').notEmpty().withMessage('Número do capítulo é obrigatório'),
    body('title').notEmpty().withMessage('Título do capítulo é obrigatório')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { slug, chapter, title } = req.body;
      const mangas = readJson('mangas.json') || [];
      const chapters = readJson('chapters.json') || [];

      const manga = mangas.find(m => m.slug === slug);
      if (!manga) return res.status(404).json({ error: 'Mangá não encontrado' });

      const newChapter = {
        id: generateId(chapters),
        mangaId: manga.id,
        number: parseInt(chapter),
        title,
        pageCount: req.files.length
      };

      chapters.push(newChapter);
      writeJson('chapters.json', chapters);

      res.status(201).json({ message: 'Capítulo enviado com sucesso', chapter: newChapter });
    } catch (err) {
      console.error('Erro ao processar upload:', err);
      res.status(500).json({ error: 'Erro interno ao processar upload' });
    }
  }
);

// 🗑️ Excluir mangá por ID
router.delete('/mangas/:id', isAuthenticated, (req, res) => {
  const id = parseInt(req.params.id);
  let mangas = readJson('mangas.json') || [];
  let chapters = readJson('chapters.json') || [];

  const mangaIndex = mangas.findIndex(m => m.id === id);
  if (mangaIndex === -1) {
    return res.status(404).json({ error: 'Mangá não encontrado' });
  }

  const manga = mangas[mangaIndex];
  const mangaSlug = manga.slug;

  // Remover capítulos relacionados
  chapters = chapters.filter(ch => ch.mangaId !== id);
  writeJson('chapters.json', chapters);

  // Remover pasta física
  const mangaPath = path.join(__dirname, '..', 'public', 'mangas', mangaSlug);
  fs.rmSync(mangaPath, { recursive: true, force: true });

  // Remover mangá do JSON
  mangas.splice(mangaIndex, 1);
  writeJson('mangas.json', mangas);

  res.status(200).json({ message: 'Mangá excluído com sucesso' });
});

// 🗑️ Excluir capítulo por ID
router.delete('/chapters/:id', isAuthenticated, (req, res) => {
  const id = parseInt(req.params.id);
  let chapters = readJson('chapters.json') || [];

  const chapterIndex = chapters.findIndex(ch => ch.id === id);
  if (chapterIndex === -1) {
    return res.status(404).json({ error: 'Capítulo não encontrado' });
  }

  const chapter = chapters[chapterIndex];
  const mangas = readJson('mangas.json') || [];
  const manga = mangas.find(m => m.id === chapter.mangaId);
  if (!manga) {
    return res.status(404).json({ error: 'Mangá associado não encontrado' });
  }

  // Remover pasta física
  const chapterPath = path.join(__dirname, '..', 'public', 'mangas', manga.slug, `cap-${chapter.number}`);
  fs.rmSync(chapterPath, { recursive: true, force: true });

  // Remover do JSON
  chapters.splice(chapterIndex, 1);
  writeJson('chapters.json', chapters);

  res.status(200).json({ message: 'Capítulo excluído com sucesso' });
});

module.exports = router;

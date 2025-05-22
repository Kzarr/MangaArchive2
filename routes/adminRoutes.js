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

// Usuário fixo para login
const ADMIN_USER = {
  username: 'admin',
  passwordHash: bcrypt.hashSync('1234', 10) // senha padrão: "1234"
};

// Middleware de autenticação
function authMiddleware(req, res, next) {
  if (req.session.loggedIn) return next();
  res.redirect('/admin/login');
}

// Página de login
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
});

// Processa login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (
    username === ADMIN_USER.username &&
    bcrypt.compareSync(password, ADMIN_USER.passwordHash)
  ) {
    req.session.loggedIn = true;
    return res.redirect('/admin/upload');
  }
  res.send('Login inválido. <a href="/admin/login">Tentar novamente</a>');
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// Configuração do multer
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

// Página de upload (protegida)
router.get('/upload', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'upload.html'));
});

// Processa o upload (protegido)
router.post('/upload', authMiddleware, upload.array('pages'), [
  body('slug').notEmpty().withMessage('Slug é obrigatório'),
  body('chapter').notEmpty().withMessage('Número do capítulo é obrigatório'),
  body('title').notEmpty().withMessage('Título do capítulo é obrigatório')
], (req, res) => {
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
});

module.exports = router;

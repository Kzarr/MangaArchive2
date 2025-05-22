const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { readJson, writeJson } = require('../utils/fileUtils');
const { generateId } = require('../utils/idUtils');

const router = express.Router();

// Configuração do multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Pasta temporária de upload
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Manter o nome original
  }
});

const upload = multer({ storage: storage });

// Página de upload
router.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'upload.html'));
});

// Processamento do upload
router.post('/upload', upload.array('pages'), (req, res) => {
  try {
    const { slug, chapter, title } = req.body;
    const files = req.files;

    if (!slug || !chapter || !title || files.length === 0) {
      return res.status(400).send('Todos os campos são obrigatórios.');
    }

    const mangas = readJson('mangas.json');
    const chapters = readJson('chapters.json');
    const manga = mangas.find(m => m.slug === slug);

    if (!manga) {
      return res.status(404).send('Mangá não encontrado.');
    }

    const chapterNumber = parseInt(chapter);
    const chapterId = generateId();

    const destDir = path.join(__dirname, '..', 'public', 'pages', slug, chapter);
    fs.mkdirSync(destDir, { recursive: true });

    const pageFilenames = [];

    // Ordenar os arquivos pelo nome original
    const sortedFiles = files.sort((a, b) => a.originalname.localeCompare(b.originalname));

    sortedFiles.forEach((file, index) => {
      const ext = path.extname(file.originalname);
      const newFilename = `${index + 1}${ext}`;
      const newPath = path.join(destDir, newFilename);

      fs.renameSync(file.path, newPath);
      pageFilenames.push(newFilename);
    });

    const newChapter = {
      id: chapterId,
      mangaId: manga.id,
      title,
      number: chapterNumber,
      pages: pageFilenames
    };

    chapters.push(newChapter);
    writeJson('chapters.json', chapters);

    res.status(201).send('Capítulo enviado com sucesso!');
  } catch (err) {
    console.error('Erro ao processar upload:', err);
    res.status(500).send('Erro ao processar upload');
  }
});

module.exports = router;

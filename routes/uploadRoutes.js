const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { readJson, writeJson } = require('../utils/fileUtils');
const { generateId } = require('../utils/idUtils');
const uploadRoutes = require('./routes/uploadRoutes');

const router = express.Router();

app.use('/admin', uploadRoutes);

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { slug, chapter } = req.body;
    const folderPath = path.join(__dirname, '..', 'public', slug, `cap-${chapter}`);
    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Rota para upload de capítulos
router.post('/upload', upload.array('pages'), (req, res) => {
  const { slug, chapter, title } = req.body;
  const pageCount = req.files.length;

  try {
    const mangas = readJson('mangas.json');
    const chapters = readJson('chapters.json');

    const manga = mangas.find(m => m.slug === slug);
    if (!manga) {
      return res.status(404).json({ error: 'Mangá não encontrado' });
    }

    const newChapter = {
      id: generateId(chapters),
      mangaId: manga.id,
      number: parseInt(chapter),
      title,
      pageCount
    };

    chapters.push(newChapter);
    writeJson('chapters.json', chapters);

    res.status(201).json({ message: 'Capítulo enviado com sucesso', chapter: newChapter });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao processar o upload do capítulo' });
  }
});

module.exports = router;

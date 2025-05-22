const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { readJson, writeJson } = require('../utils/fileUtils');
const { generateId } = require('../utils/idUtils');

const router = express.Router();

// Armazenamento temporário
const upload = multer({ dest: 'uploads/' });

router.get('/admin/upload', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'upload.html'));
});

router.post('/admin/upload', upload.array('pages'), (req, res) => {
  const { slug, chapter, title } = req.body;
  const files = req.files;

  if (!slug || !chapter || files.length === 0) {
    return res.status(400).send('Campos obrigatórios ausentes.');
  }

  const mangas = readJson('mangas.json');
  const chapters = readJson('chapters.json');
  const manga = mangas.find(m => m.slug === slug);

  if (!manga) {
    return res.status(404).send('Mangá não encontrado.');
  }

  const chapterNumber = parseInt(chapter);
  if (chapters.find(c => c.mangaId === manga.id && c.number === chapterNumber)) {
    return res.status(409).send('Capítulo já existe.');
  }

  // Criar diretório final
  const chapterFolder = `public/mangas/${slug}/chapter-${chapterNumber}`;
  fs.mkdirSync(chapterFolder, { recursive: true });

  // Mover arquivos
  files.forEach((file, index) => {
    const newFilename = String(index + 1).padStart(3, '0') + '.jpg';
    fs.renameSync(file.path, path.join(chapterFolder, newFilename));
  });

  // Atualizar chapters.json
  const newChapter = {
    mangaId: manga.id,
    number: chapterNumber,
    title: title || `Capítulo ${chapterNumber}`,
    pageCount: files.length
  };
  chapters.push(newChapter);
  writeJson('chapters.json', chapters);

  res.send('Capítulo enviado com sucesso!');
});

module.exports = router;

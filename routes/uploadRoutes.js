const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { readJson, writeJson } = require('../utils/fileUtils');
const { generateId } = require('../utils/idUtils');

const router = express.Router();

// Configuração do multer para salvar os arquivos em memória temporária
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(express.urlencoded({ extended: true }));

// ✅ Rota: processar formulário de upload
router.post('/admin/upload', upload.array('pages'), (req, res) => {
  try {
    const { slug, chapter, title } = req.body;
    const files = req.files;

    if (!slug || !chapter || !title || !files || files.length === 0) {
      return res.status(400).send('Todos os campos são obrigatórios e pelo menos uma imagem deve ser enviada.');
    }

    const mangas = readJson('mangas.json');
    const manga = mangas.find(m => m.slug === slug);
    if (!manga) return res.status(404).send('Mangá não encontrado.');

    const chapters = readJson('chapters.json');

    const chapterNumber = parseInt(chapter);
    const folderPath = path.join(__dirname, '..', 'public', slug, `cap-${chapterNumber}`);

    // Criar a pasta se não existir
    fs.mkdirSync(folderPath, { recursive: true });

    // Salvar arquivos numerados (1.jpg, 2.jpg, etc.)
    files.forEach((file, index) => {
      const filePath = path.join(folderPath, `${index + 1}.jpg`);
      fs.writeFileSync(filePath, file.buffer);
    });

    const newChapter = {
      id: generateId(),
      mangaId: manga.id,
      number: chapterNumber,
      title,
      pageCount: files.length
    };

    chapters.push(newChapter);
    writeJson('chapters.json', chapters);

    res.send('Capítulo enviado com sucesso!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao processar upload.');
  }
});

module.exports = router;

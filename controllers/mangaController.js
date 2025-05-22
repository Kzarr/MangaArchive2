const { readJson } = require('../utils/fileUtils');

function getMangaChapterData(slug, chapterNum) {
  const mangas = readJson('mangas.json');
  const chapters = readJson('chapters.json');

  const manga = mangas.find(m => m.slug === slug);
  if (!manga) return null;

  const chapter = chapters.find(c => c.mangaId === manga.id && c.number === parseInt(chapterNum));
  if (!chapter) return null;

  return {
    mangaTitle: manga.title,
    chapterTitle: chapter.title,
    folder: `${manga.slug}/ch${chapter.number.toString().padStart(2, '0')}`,
    pages: chapter.pageCount
  };
}

module.exports = { getMangaChapterData };

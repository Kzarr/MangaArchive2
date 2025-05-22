console.log("JavaScript carregado!");

async function loadMangas() {
  try {
    const mangaRes = await fetch('/manga/api/mangas');
    const chapterRes = await fetch('/chapters.json');
    const mangas = await mangaRes.json();
    const chapters = await chapterRes.json();

    const container = document.getElementById('mangaList');
    mangas.forEach(manga => {
      const div = document.createElement('div');
      div.classList.add('manga-card');

      const title = document.createElement('h2');
      title.textContent = manga.title;
      div.appendChild(title);

      const desc = document.createElement('p');
      desc.textContent = manga.description || '';
      div.appendChild(desc);

      const list = document.createElement('div');
      list.classList.add('chapter-list');

      const mangaChapters = chapters
        .filter(c => c.mangaId === manga.id)
        .sort((a, b) => a.number - b.number);

      mangaChapters.forEach(ch => {
        const link = document.createElement('a');
        link.href = `/manga/${manga.slug}/${ch.number}`;
        link.textContent = `Capítulo ${ch.number} — ${ch.title}`;
        list.appendChild(link);
      });

      div.appendChild(list);
      container.appendChild(div);
    });
  } catch (err) {
    document.body.innerHTML = '<p>Erro ao carregar mangás.</p>';
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', loadMangas);

document.addEventListener('DOMContentLoaded', () => {
  const pathParts = window.location.pathname.split('/');
  const slug = pathParts[2];
  const chapter = pathParts[3];

  fetch(`/manga/api/${slug}/${chapter}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('mangaTitle').textContent = data.mangaTitle;
      document.getElementById('chapterTitle').textContent = data.chapterTitle;

      const container = document.getElementById('pagesContainer');
      for (let i = 1; i <= data.pages; i++) {
        const img = document.createElement('img');
        img.src = `/mangas/${data.folder}/${String(i).padStart(3, '0')}.jpg`;
        const div = document.createElement('div');
        div.classList.add('page');
        div.appendChild(img);
        container.appendChild(div);
      }
    })
    .catch(err => {
      document.body.innerHTML = '<p>Erro ao carregar capítulo.</p>';
      console.error(err);
    });
});

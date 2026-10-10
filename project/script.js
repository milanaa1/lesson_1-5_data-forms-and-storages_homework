const form = document.querySelector(".card-form");
const emptyPanel = document.querySelector('[data-state-panel="empty"]');
const editorPanel = document.querySelector('[data-state-panel="editor"]');
const viewerPanel = document.querySelector('[data-state-panel="viewer"]');
const createButton = document.querySelector('[data-action="create"]');

function renderCard(film) {
  viewerPanel.querySelector('[data-field="title"]').textContent = film.title;
  viewerPanel.querySelector('[data-field="director"]').textContent = film.director;
  viewerPanel.querySelector('[data-field="year"]').textContent = film.year;
  viewerPanel.querySelector('[data-field="status"]').textContent = film.status;
  viewerPanel.querySelector('[data-field="rating"]').textContent = film.rating;
}


createButton.addEventListener("click", function () {
  emptyPanel.hidden = true;
  editorPanel.hidden = false;
});


form.addEventListener("submit", function (event) {
  event.preventDefault();

  const formData = new FormData(form);

  const film = {
    title: formData.get("title"),
    director: formData.get("director"),
    year: formData.get("year"),
    status: formData.get("status"),
    rating: formData.get("rating"),
  };


  renderCard(film);
  editorPanel.hidden = true;
  viewerPanel.hidden = false;
});
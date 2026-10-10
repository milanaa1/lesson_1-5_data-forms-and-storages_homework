const STORAGE_KEY = "film-card";

const form = document.querySelector(".card-form");
const emptyPanel = document.querySelector('[data-state-panel="empty"]');
const editorPanel = document.querySelector('[data-state-panel="editor"]');
const viewerPanel = document.querySelector('[data-state-panel="viewer"]');
const createButton = document.querySelector('[data-action="create"]');
const deleteButton = document.querySelector('[data-action="delete"]');

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

deleteButton.addEventListener("click", function () {
  localStorage.removeItem(STORAGE_KEY);
  form.reset();
  viewerPanel.hidden = true;
  emptyPanel.hidden = false;
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

  localStorage.setItem(STORAGE_KEY, JSON.stringify(film));

  renderCard(film);
  editorPanel.hidden = true;
  viewerPanel.hidden = false;
});

const savedData = localStorage.getItem(STORAGE_KEY);

if (savedData !== null) {
  const film = JSON.parse(savedData);
  renderCard(film);
  emptyPanel.hidden = true;
  viewerPanel.hidden = false;
}

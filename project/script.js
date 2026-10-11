const STORAGE_KEY = "film-card";
const DRAFT_KEY = "film-draft";
const HINT_KEY = "film-hint-shown";
const LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

const form = document.querySelector(".card-form");
const emptyPanel = document.querySelector('[data-state-panel="empty"]');
const editorPanel = document.querySelector('[data-state-panel="editor"]');
const viewerPanel = document.querySelector('[data-state-panel="viewer"]');
const createButton = document.querySelector('[data-action="create"]');
const deleteButton = document.querySelector('[data-action="delete"]');
const editButton = document.querySelector('[data-action="edit"]');
const cancelButton = document.querySelector('[data-action="cancel"]');
const statusText = document.querySelector(".workspace__status");
const ratingError = document.querySelector('[data-error="rating"]');
const formNote = document.querySelector(".card-form__note");

const statusLabels = {
  watched: "Посмотрел(а)",
  watching: "Смотрю",
  planned: "Хочу посмотреть",
};

function renderCard(film) {
  viewerPanel.querySelector('[data-field="title"]').textContent = film.title;
  viewerPanel.querySelector('[data-field="director"]').textContent = film.director;
  viewerPanel.querySelector('[data-field="year"]').textContent = film.year;
  viewerPanel.querySelector('[data-field="status"]').textContent = statusLabels[film.status];
  viewerPanel.querySelector('[data-field="rating"]').textContent = film.rating || "Нет оценки";
}

function readForm() {
  const formData = new FormData(form);

  return {
    title: formData.get("title"),
    director: formData.get("director"),
    year: formData.get("year"),
    status: formData.get("status"),
    rating: formData.get("rating"),
  };
}

function fillForm(film) {
  form.elements.title.value = film.title;
  form.elements.director.value = film.director;
  form.elements.year.value = film.year;
  form.elements.status.value = film.status;
  form.elements.rating.value = film.rating;
}

function openEditor(film) {
  const draft = sessionStorage.getItem(DRAFT_KEY);

  form.reset();

  if (draft !== null) {
    fillForm(JSON.parse(draft));
    formNote.textContent = "Восстановлен несохранённый черновик";
  } else {
    if (film) {
      fillForm(film);
    }
    formNote.textContent = "Заполните информацию о фильме";
  }

  checkRating();
  emptyPanel.hidden = true;
  viewerPanel.hidden = true;
  editorPanel.hidden = false;
}

function checkRating() {
  const status = form.elements.status.value;
  const rating = form.elements.rating.value;

  if (status === "planned" && rating !== "") {
    ratingError.textContent = "Нельзя оценить фильм, который вы ещё не посмотрели";
    ratingError.hidden = false;
    return false;
  }

  ratingError.hidden = true;
  return true;
}

form.addEventListener("input", function () {
  checkRating();
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(readForm()));
});

createButton.addEventListener("click", function () {
  openEditor(null);
});

editButton.addEventListener("click", function () {
  const film = JSON.parse(localStorage.getItem(STORAGE_KEY));
  openEditor(film);
});

deleteButton.addEventListener("click", function () {
  localStorage.removeItem(STORAGE_KEY);
  form.reset();
  viewerPanel.hidden = true;
  emptyPanel.hidden = false;
});

cancelButton.addEventListener("click", function () {
  sessionStorage.removeItem(DRAFT_KEY);
  editorPanel.hidden = true;

  if (localStorage.getItem(STORAGE_KEY) !== null) {
    viewerPanel.hidden = false;
  } else {
    emptyPanel.hidden = false;
  }
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!checkRating()) {
    return;
  }

  const film = readForm();
  film.savedAt = Date.now();

  localStorage.setItem(STORAGE_KEY, JSON.stringify(film));
  sessionStorage.removeItem(DRAFT_KEY);

  renderCard(film);
  editorPanel.hidden = true;
  viewerPanel.hidden = false;
});

window.addEventListener("storage", function (event) {
  if (event.key !== STORAGE_KEY) {
    return;
  }

  if (event.newValue === null) {
    viewerPanel.hidden = true;
    if (editorPanel.hidden) {
      emptyPanel.hidden = false;
    }
    return;
  }

  renderCard(JSON.parse(event.newValue));

  if (editorPanel.hidden) {
    emptyPanel.hidden = true;
    viewerPanel.hidden = false;
  }
});

if (sessionStorage.getItem(HINT_KEY) === null) {
  statusText.textContent = "Подсказка: карточка сохранится даже после перезагрузки";
  sessionStorage.setItem(HINT_KEY, "yes");
} else {
  statusText.textContent = "";
}

const savedData = localStorage.getItem(STORAGE_KEY);

if (savedData !== null) {
  const film = JSON.parse(savedData);

  if (Date.now() - film.savedAt > LIFETIME_MS) {
    localStorage.removeItem(STORAGE_KEY);
    statusText.textContent = "Карточка устарела (старше 7 дней) и удалена. Создайте новую.";
  } else {
    renderCard(film);
    emptyPanel.hidden = true;
    viewerPanel.hidden = false;
  }
}
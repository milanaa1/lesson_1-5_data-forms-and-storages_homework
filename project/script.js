const STORAGE_KEY = "film-cards";
const DRAFT_KEY = "film-draft";
const HINT_KEY = "film-hint-shown";
const LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

const form = document.querySelector(".card-form");
const panels = {
  empty: document.querySelector('[data-state-panel="empty"]'),
  list: document.querySelector('[data-state-panel="list"]'),
  editor: document.querySelector('[data-state-panel="editor"]'),
  viewer: document.querySelector('[data-state-panel="viewer"]'),
};
const filmList = document.querySelector("[data-film-list]");
const createButton = document.querySelector('[data-action="create"]');
const addButton = document.querySelector('[data-action="add"]');
const deleteButton = document.querySelector('[data-action="delete"]');
const editButton = document.querySelector('[data-action="edit"]');
const cancelButton = document.querySelector('[data-action="cancel"]');
const backButton = document.querySelector('[data-action="back"]');
const statusText = document.querySelector(".workspace__status");
const ratingError = document.querySelector('[data-error="rating"]');
const formNote = document.querySelector(".card-form__note");

const statusLabels = {
  watched: "Посмотрел(а)",
  watching: "Смотрю",
  planned: "Хочу посмотреть",
};

let currentId = null;

function showPanel(name) {
  for (const key in panels) {
    panels[key].hidden = key !== name;
  }
}

function loadFilms() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved === null) {
    return [];
  }

  try {
    const films = JSON.parse(saved);
    return Array.isArray(films) ? films : [];
  } catch {
    return [];
  }
}

function saveFilms(films) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(films));
}

function renderCard(film) {
  panels.viewer.querySelector('[data-field="title"]').textContent = film.title;
  panels.viewer.querySelector('[data-field="director"]').textContent = film.director;
  panels.viewer.querySelector('[data-field="year"]').textContent = film.year;
  panels.viewer.querySelector('[data-field="status"]').textContent = statusLabels[film.status] || "—";
  panels.viewer.querySelector('[data-field="rating"]').textContent = film.rating || "Нет оценки";
}

function renderList() {
  const films = loadFilms();

  if (films.length === 0) {
    showPanel("empty");
    return;
  }

  filmList.replaceChildren();

  films.forEach(function (film) {
    const item = document.createElement("li");
    const button = document.createElement("button");

    button.className = "film-list__item";
    button.type = "button";
    button.textContent = film.title + " (" + film.year + ") — " + (statusLabels[film.status] || "");
    button.addEventListener("click", function () {
      openViewer(film.id);
    });

    item.append(button);
    filmList.append(item);
  });

  showPanel("list");
}

function openViewer(id) {
  const film = loadFilms().find(function (item) {
    return item.id === id;
  });

  if (!film) {
    currentId = null;
    renderList();
    return;
  }

  currentId = id;
  renderCard(film);
  showPanel("viewer");
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

function readDraft() {
  const saved = sessionStorage.getItem(DRAFT_KEY);

  if (saved === null) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
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

function openEditor(film) {
  const draft = readDraft();

  form.reset();

  if (draft !== null && draft.id === currentId) {
    fillForm(draft.film);
    formNote.textContent = "Восстановлен несохранённый черновик";
  } else {
    if (film) {
      fillForm(film);
    }
    formNote.textContent = "Заполните информацию о фильме";
  }

  checkRating();
  showPanel("editor");
}

function startNewFilm() {
  currentId = null;
  openEditor(null);
}

form.addEventListener("input", function () {
  checkRating();
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ id: currentId, film: readForm() }));
});

createButton.addEventListener("click", startNewFilm);
addButton.addEventListener("click", startNewFilm);

editButton.addEventListener("click", function () {
  const film = loadFilms().find(function (item) {
    return item.id === currentId;
  });
  openEditor(film);
});

deleteButton.addEventListener("click", function () {
  const films = loadFilms().filter(function (item) {
    return item.id !== currentId;
  });

  saveFilms(films);
  currentId = null;
  form.reset();
  renderList();
});

backButton.addEventListener("click", function () {
  currentId = null;
  renderList();
});

cancelButton.addEventListener("click", function () {
  sessionStorage.removeItem(DRAFT_KEY);

  if (currentId !== null) {
    openViewer(currentId);
  } else {
    renderList();
  }
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!checkRating()) {
    return;
  }

  const film = readForm();
  const films = loadFilms();
  film.savedAt = Date.now();

  if (currentId === null) {
    film.id = String(Date.now());
    films.push(film);
  } else {
    film.id = currentId;
    const index = films.findIndex(function (item) {
      return item.id === currentId;
    });

    if (index !== -1) {
      films[index] = film;
    } else {
      films.push(film);
    }
  }

  saveFilms(films);
  sessionStorage.removeItem(DRAFT_KEY);
  openViewer(film.id);
});

window.addEventListener("storage", function (event) {
  if (event.key !== STORAGE_KEY) {
    return;
  }

  if (!panels.editor.hidden) {
    return;
  }

  if (currentId !== null) {
    openViewer(currentId);
  } else {
    renderList();
  }
});

if (sessionStorage.getItem(HINT_KEY) === null) {
  statusText.textContent = "Подсказка: фильмы сохранятся даже после перезагрузки";
  sessionStorage.setItem(HINT_KEY, "yes");
} else {
  statusText.textContent = "";
}

const allFilms = loadFilms();
const freshFilms = allFilms.filter(function (film) {
  return Date.now() - film.savedAt <= LIFETIME_MS;
});

if (freshFilms.length < allFilms.length) {
  saveFilms(freshFilms);
  statusText.textContent = "Карточки старше 7 дней удалены. Добавьте фильмы заново.";
}

renderList();
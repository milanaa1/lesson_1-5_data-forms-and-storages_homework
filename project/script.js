const form = document.querySelector(".card-form");
const emptyPanel = document.querySelector('[data-state-panel="empty"]');
const editorPanel = document.querySelector('[data-state-panel="editor"]');
const viewerPanel = document.querySelector('[data-state-panel="viewer"]');
const createButton = document.querySelector('[data-action="create"]');

createButton.addEventListener("click", function () {
  emptyPanel.hidden = true;
  editorPanel.hidden = false;
});
const timeText = document.getElementById("timeText");
const dateText = document.getElementById("dateText");
const greetingTitle = document.getElementById("greeting-title");
const nameInput = document.getElementById("nameInput");
const themeToggle = document.getElementById("themeToggle");

const timerDisplay = document.getElementById("timerDisplay");
const minutesInput = document.getElementById("minutesInput");
const startTimerButton = document.getElementById("startTimer");
const stopTimerButton = document.getElementById("stopTimer");
const resetTimerButton = document.getElementById("resetTimer");

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskMessage = document.getElementById("taskMessage");
const sortTasksButton = document.getElementById("sortTasks");

const linkForm = document.getElementById("linkForm");
const linkNameInput = document.getElementById("linkNameInput");
const linkUrlInput = document.getElementById("linkUrlInput");
const quickLinks = document.getElementById("quickLinks");

const STORAGE_KEYS = {
  tasks: "focusDashboardTasks",
  links: "focusDashboardLinks",
  name: "focusDashboardName",
  theme: "focusDashboardTheme",
  minutes: "focusDashboardMinutes"
};

let tasks = loadFromStorage(STORAGE_KEYS.tasks, []);
let links = loadFromStorage(STORAGE_KEYS.links, [
  { name: "Google", url: "https://www.google.com" },
  { name: "Gmail", url: "https://mail.google.com" },
  { name: "Calendar", url: "https://calendar.google.com" }
]);
let timerSeconds = Number(localStorage.getItem(STORAGE_KEYS.minutes) || 25) * 60;
let timerInterval = null;

function loadFromStorage(key, fallback) {
  const saved = localStorage.getItem(key);

  if (!saved) {
    return fallback;
  }

  try {
    return JSON.parse(saved);
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function createId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function updateClock() {
  const now = new Date();
  const hour = now.getHours();
  const savedName = localStorage.getItem(STORAGE_KEYS.name) || "";
  const name = savedName.trim();
  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 17) {
    greeting = "Good Afternoon";
  }

  timeText.textContent = now.toLocaleTimeString("en-US", { hour12: false });
  dateText.textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  greetingTitle.textContent = name ? `${greeting}, ${name}` : greeting;
}

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  themeToggle.textContent = theme === "dark" ? "Light" : "Dark";
  localStorage.setItem(STORAGE_KEYS.theme, theme);
}

function formatTimer(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTimer(timerSeconds);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  startTimerButton.disabled = false;
}

function resetTimer() {
  stopTimer();
  const minutes = getTimerMinutes();
  timerSeconds = minutes * 60;
  localStorage.setItem(STORAGE_KEYS.minutes, String(minutes));
  updateTimerDisplay();
}

function getTimerMinutes() {
  const minutes = Number(minutesInput.value);
  return Number.isFinite(minutes) && minutes > 0 ? Math.min(minutes, 120) : 25;
}

function startTimer() {
  if (timerInterval) {
    return;
  }

  if (timerSeconds <= 0) {
    resetTimer();
  }

  startTimerButton.disabled = true;
  timerInterval = setInterval(() => {
    timerSeconds -= 1;
    updateTimerDisplay();

    if (timerSeconds <= 0) {
      stopTimer();
    }
  }, 1000);
}

function showTaskMessage(message) {
  taskMessage.textContent = message;
  window.setTimeout(() => {
    if (taskMessage.textContent === message) {
      taskMessage.textContent = "";
    }
  }, 2500);
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const item = document.createElement("li");
    const checkbox = document.createElement("input");
    const title = document.createElement("span");
    const editButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    item.className = `task-item${task.done ? " done" : ""}`;
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    title.className = "task-title";
    title.textContent = task.text;
    editButton.type = "button";
    editButton.className = "task-action secondary";
    editButton.textContent = "Edit";
    deleteButton.type = "button";
    deleteButton.className = "task-action delete";
    deleteButton.textContent = "Delete";

    checkbox.addEventListener("change", () => toggleTask(task.id));
    editButton.addEventListener("click", () => editTask(task.id));
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    item.append(checkbox, title, editButton, deleteButton);
    taskList.appendChild(item);
  });
}

function addTask(text) {
  const cleanText = text.trim();
  const isDuplicate = tasks.some((task) => task.text.toLowerCase() === cleanText.toLowerCase());

  if (!cleanText) {
    return;
  }

  if (isDuplicate) {
    showTaskMessage("That task already exists.");
    return;
  }

  tasks.push({
    id: createId(),
    text: cleanText,
    done: false
  });
  saveToStorage(STORAGE_KEYS.tasks, tasks);
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task);
  saveToStorage(STORAGE_KEYS.tasks, tasks);
  renderTasks();
}

function editTask(id) {
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    return;
  }

  const newText = prompt("Edit task:", task.text);

  if (newText === null) {
    return;
  }

  const cleanText = newText.trim();
  const duplicate = tasks.some((item) => item.id !== id && item.text.toLowerCase() === cleanText.toLowerCase());

  if (!cleanText) {
    showTaskMessage("Task cannot be empty.");
    return;
  }

  if (duplicate) {
    showTaskMessage("That task already exists.");
    return;
  }

  task.text = cleanText;
  saveToStorage(STORAGE_KEYS.tasks, tasks);
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveToStorage(STORAGE_KEYS.tasks, tasks);
  renderTasks();
}

function sortTasks() {
  tasks.sort((first, second) => {
    if (first.done !== second.done) {
      return Number(first.done) - Number(second.done);
    }

    return first.text.localeCompare(second.text);
  });
  saveToStorage(STORAGE_KEYS.tasks, tasks);
  renderTasks();
}

function normalizeUrl(url) {
  const trimmedUrl = url.trim();
  return /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
}

function renderLinks() {
  quickLinks.innerHTML = "";

  links.forEach((link, index) => {
    const anchor = document.createElement("a");
    const name = document.createElement("span");
    const removeButton = document.createElement("button");

    anchor.className = "quick-link";
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    name.textContent = link.name;
    removeButton.type = "button";
    removeButton.className = "remove-link";
    removeButton.setAttribute("aria-label", `Remove ${link.name}`);
    removeButton.textContent = "x";

    removeButton.addEventListener("click", (event) => {
      event.preventDefault();
      removeLink(index);
    });

    anchor.append(name, removeButton);
    quickLinks.appendChild(anchor);
  });
}

function addLink(name, url) {
  const cleanName = name.trim();
  const cleanUrl = normalizeUrl(url);

  if (!cleanName || !url.trim()) {
    return;
  }

  links.push({ name: cleanName, url: cleanUrl });
  saveToStorage(STORAGE_KEYS.links, links);
  renderLinks();
}

function removeLink(index) {
  links.splice(index, 1);
  saveToStorage(STORAGE_KEYS.links, links);
  renderLinks();
}

nameInput.value = localStorage.getItem(STORAGE_KEYS.name) || "";
minutesInput.value = localStorage.getItem(STORAGE_KEYS.minutes) || "25";
timerSeconds = getTimerMinutes() * 60;

themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
  applyTheme(nextTheme);
});

nameInput.addEventListener("input", () => {
  localStorage.setItem(STORAGE_KEYS.name, nameInput.value);
  updateClock();
});

minutesInput.addEventListener("change", resetTimer);
startTimerButton.addEventListener("click", startTimer);
stopTimerButton.addEventListener("click", stopTimer);
resetTimerButton.addEventListener("click", resetTimer);

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(taskInput.value);
  taskInput.value = "";
  taskInput.focus();
});

sortTasksButton.addEventListener("click", sortTasks);

linkForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addLink(linkNameInput.value, linkUrlInput.value);
  linkNameInput.value = "";
  linkUrlInput.value = "";
  linkNameInput.focus();
});

applyTheme(localStorage.getItem(STORAGE_KEYS.theme) || "light");
updateClock();
updateTimerDisplay();
renderTasks();
renderLinks();
setInterval(updateClock, 1000);

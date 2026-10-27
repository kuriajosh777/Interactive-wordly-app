// Wordly - a single page dictionary app.

// Flow: form submit -> fetch from the API -> read the data -> update the DOM.

const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
const SAVED_KEY = 'wordly-saved-words';
const THEME_KEY = 'wordly-theme';
const MAX_SYNONYMS = 8;

// ---------- DOM references ----------
const searchForm = document.querySelector('#search-form');
const wordInput = document.querySelector('#word-input');
const searchButton = document.querySelector('#search-button');
const errorMessage = document.querySelector('#error-message');
const statusMessage = document.querySelector('#status-message');
const results = document.querySelector('#results');
const savedList = document.querySelector('#saved-list');
const savedEmpty = document.querySelector('#saved-empty');
const themeToggle = document.querySelector('#theme-toggle');
const themeIcon = document.querySelector('#theme-toggle-icon');

// ---------- App state ----------
let savedWords = loadSavedWords();
let currentWord = null; // the word currently shown in the results card
let currentRequest = null; 
// AbortController of the request in progress
let latestSearchId = 0; 
// lets an older search know a newer one has started


// ---------- Small helpers ----------


// Create an element with optional class, text and attributes.

// Text always goes in through textContent, so API data can never inject HTML.
function createElement(tag, { className, text, attrs } = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  if (attrs) {
    Object.entries(attrs).forEach(([name, value]) => element.setAttribute(name, value));
  }
  return element;
}

// localStorage can be blocked (private mode, strict settings), so never trust it blindly
function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.log('Could not save to localStorage:', error.message);
  }
}

function loadSavedWords() {
  try {
    const stored = JSON.parse(readStorage(SAVED_KEY));
    return Array.isArray(stored) ? stored.filter((word) => typeof word === 'string') : [];
  } catch (error) {
    return [];
  }
}

// ---------- Messages ----------

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}

function clearError() {
  errorMessage.textContent = '';
  errorMessage.classList.add('hidden');
}

function showStatus(message) {
  statusMessage.textContent = message;
  statusMessage.classList.remove('hidden');
}

function clearStatus() {
  statusMessage.textContent = '';
  statusMessage.classList.add('hidden');
}

// Disable the form while a request is running so it can't be spammed
function setLoading(isLoading, word = '') {
  searchButton.disabled = isLoading;
  searchButton.textContent = isLoading ? 'Searching...' : 'Search';
  if (isLoading) {
    showStatus(`Looking up "${word}"...`);
  } else {
    clearStatus();
  }
}
// ---------- Input validation ----------

// Returns { word } for good input or { error } with a friendly message
function validateInput(rawValue) {
  const word = rawValue.trim().toLowerCase();

  if (word === '') {
    return { error: 'Please type a word to search for.' };
  }
 
 // Letters, plus apostrophes, hyphens and spaces inside the word (e.g. "don't", "well-known")
  if (!/^[a-z][a-z' -]*$/.test(word)) {
    return { error: 'Please use letters only. Numbers and symbols are not supported.' };
  }
  return { word };
}


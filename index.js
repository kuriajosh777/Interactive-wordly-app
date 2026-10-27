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


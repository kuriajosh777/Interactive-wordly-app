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
// ---------- Fetching ----------

async function fetchWordData(word) {
  // Cancel any earlier request that is still running, so old results can't overwrite new ones
  if (currentRequest) currentRequest.abort();
  currentRequest = new AbortController();

  const response = await fetch(`${API_URL}${encodeURIComponent(word)}`, {
    signal: currentRequest.signal,
  });

  // fetch() only rejects on network failures, so check the HTTP status ourselves
  if (response.status === 404) {
    throw new Error(`No definitions found for "${word}". Check the spelling or try another word.`);
  }
  if (!response.ok) {
    throw new Error(`The dictionary service returned an error (status ${response.status}). Please try again.`);
  }

  const data = await response.json();

  // Make sure the data has the shape we expect before using it
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`No definitions found for "${word}".`);
  }
  return data;
}


// ---------- Reading the API data ----------

// The API can return several entries for one word. Merge them into one simple object.
function extractWordInfo(entries) {
  const first = entries[0];
  const phonetics = entries.flatMap((entry) => entry.phonetics || []);

  const phoneticText =
    first.phonetic || (phonetics.find((item) => item.text) || {}).text || '';

  // Audio is missing for some words. Some links start with "//", so add https:
  const audioItem = phonetics.find((item) => item.audio);
  const audioUrl = audioItem
    ? audioItem.audio.startsWith('//') ? `https:${audioItem.audio}` : audioItem.audio
    : '';

  const meanings = entries
    .flatMap((entry) => entry.meanings || [])
    .map((meaning) => {
      const definitions = (meaning.definitions || []).map((item) => ({
        definition: item.definition,
        example: item.example || '',
      }));

  // Synonyms can sit on the meaning or on each definition. Combine them without repeats.
      const synonyms = new Set(meaning.synonyms || []);
      (meaning.definitions || []).forEach((item) => {
        (item.synonyms || []).forEach((synonym) => synonyms.add(synonym));
      });

      return {
        partOfSpeech: meaning.partOfSpeech || 'other',
        definitions,
        synonyms: [...synonyms].slice(0, MAX_SYNONYMS),
      };
    })
    .filter((meaning) => meaning.definitions.length > 0);

  if (meanings.length === 0) {
    throw new Error(`The dictionary has no usable definitions for "${first.word}".`);
  }

  return {
    word: first.word,
    phonetic: phoneticText,
    audioUrl,
    meanings,
    sourceUrl: (first.sourceUrls && first.sourceUrls[0]) || '',
  };
}

// ---------- Building the page ----------

function buildSynonyms(synonyms) {
  if (synonyms.length === 0) {
    return createElement('p', { className: 'no-synonyms', text: 'No synonyms available.' });
  }

  const wrapper = createElement('div', { className: 'synonyms' });
  wrapper.appendChild(createElement('span', { className: 'synonyms-label', text: 'Synonyms:' }));

  const list = createElement('ul', { className: 'chip-list', attrs: { 'aria-label': 'Synonyms' } });
  synonyms.forEach((synonym) => {
    const item = createElement('li', { className: 'chip' });
    // Clicking a synonym searches for it (handled by one listener on the results area)
    const button = createElement('button', {
      className: 'synonym-button',
      text: synonym,
      attrs: { type: 'button', 'data-word': synonym, 'aria-label': `Look up ${synonym}` },
    });
    item.appendChild(button);
    list.appendChild(item);
  });
  wrapper.appendChild(list);
  return wrapper;
}

function buildMeaning(meaning) {
  const section = createElement('section', { className: 'meaning' });
  section.appendChild(createElement('h3', { className: 'part-of-speech', text: meaning.partOfSpeech }));

  const list = createElement('ol', { className: 'definition-list' });
  meaning.definitions.forEach((item) => {
    const entry = createElement('li');
    entry.appendChild(createElement('p', { text: item.definition }));
    if (item.example) {
      entry.appendChild(createElement('p', { className: 'example', text: `"${item.example}"` }));
    }
    list.appendChild(entry);
  });
  section.appendChild(list);
  section.appendChild(buildSynonyms(meaning.synonyms));
  return section;
}

function renderWordCard(info) {
  results.textContent = '';
  currentWord = info.word.toLowerCase();

  const card = createElement('article', { className: 'word-card', attrs: { 'aria-label': `Definition of ${info.word}` } });

// Header: word, phonetic spelling and the action buttons
  const header = createElement('div', { className: 'word-header' });
  const titleBox = createElement('div');
  titleBox.appendChild(createElement('h2', { className: 'word-title', text: info.word }));
  if (info.phonetic) {
    titleBox.appendChild(createElement('p', { className: 'phonetic', text: info.phonetic }));
  }
  header.appendChild(titleBox);

  const actions = createElement('div', { className: 'word-actions' });

  const audioButton = createElement('button', {
    className: 'pill-button',
    text: '🔊 Listen',
    attrs: { type: 'button', 'aria-label': `Play pronunciation of ${info.word}` },
  });
  if (info.audioUrl) {
    audioButton.addEventListener('click', () => playAudio(info.audioUrl, card));
  } else {
    audioButton.disabled = true;
    audioButton.setAttribute('aria-label', 'No pronunciation audio available');
  }
  actions.appendChild(audioButton);

  const saveButton = createElement('button', {
    className: 'pill-button save-button',
    attrs: { type: 'button' },
  });
  saveButton.addEventListener('click', () => toggleSaved(currentWord));
  actions.appendChild(saveButton);

  header.appendChild(actions);
  card.appendChild(header);

  if (!info.audioUrl) {
    card.appendChild(createElement('p', { className: 'audio-note', text: 'Pronunciation audio is not available for this word.' }));
  }

  info.meanings.forEach((meaning) => card.appendChild(buildMeaning(meaning)));

  if (info.sourceUrl) {
    const source = createElement('p', { className: 'source', text: 'Source: ' });
    source.appendChild(createElement('a', {
      text: info.sourceUrl,
      attrs: { href: info.sourceUrl, target: '_blank', rel: 'noopener noreferrer' },
    }));
    card.appendChild(source);
  }

  results.appendChild(card);
  updateSavedState();
}

// Show or hide the highlight and update the Save button for the current word
function updateSavedState() {
  const card = results.querySelector('.word-card');
  if (!card) return;

  const isSaved = savedWords.includes(currentWord);
  card.classList.toggle('is-saved', isSaved);

  const saveButton = card.querySelector('.save-button');
  saveButton.textContent = isSaved ? '★ Saved' : '☆ Save word';
  saveButton.setAttribute('aria-pressed', String(isSaved));
  saveButton.setAttribute('aria-label', isSaved ? `Remove ${currentWord} from saved words` : `Save ${currentWord}`);
}

function renderSavedWords() {
  savedList.textContent = '';
  savedEmpty.classList.toggle('hidden', savedWords.length > 0);

  savedWords.forEach((word) => {
    const item = createElement('li', { className: 'chip' });
    item.appendChild(createElement('button', {
      className: 'saved-word',
      text: word,
      attrs: { type: 'button', 'data-word': word, 'aria-label': `Look up ${word}` },
    }));
    item.appendChild(createElement('button', {
      className: 'chip-remove',
      text: '✕',
      attrs: { type: 'button', 'data-remove': word, 'aria-label': `Remove ${word} from saved words` },
    }));
    savedList.appendChild(item);
  });
}

// ---------- Actions ----------

function toggleSaved(word) {
  if (savedWords.includes(word)) {
    savedWords = savedWords.filter((saved) => saved !== word);
  } else {
    savedWords = [...savedWords, word];
  }
  writeStorage(SAVED_KEY, JSON.stringify(savedWords));
  renderSavedWords();
  updateSavedState();
}

function playAudio(url, card) {
  // Remove an older audio error before trying again
  const oldNote = card.querySelector('.audio-error');
  if (oldNote) oldNote.remove();

  const audio = new Audio(url);
  audio.play().catch((error) => {
    console.log('Audio could not be played:', error.message);
    card.querySelector('.word-header').after(
      createElement('p', { className: 'audio-note audio-error', text: 'Sorry, the audio could not be played.', attrs: { role: 'alert' } })
    );
  });
}

// The main search routine
async function searchWord(rawValue) {
  clearError();

  const { word, error } = validateInput(rawValue);
  if (error) {
    showError(error);
    wordInput.focus();
    return;
  }

  wordInput.value = word;
  const searchId = ++latestSearchId;
  setLoading(true, word);

  try {
    const entries = await fetchWordData(word);
    renderWordCard(extractWordInfo(entries));
  } catch (caughtError) {
    // An aborted request means a newer search replaced this one, so stay quiet
    if (caughtError.name === 'AbortError') return;

    console.log('Search failed:', caughtError.message);
    results.textContent = '';
    currentWord = null;
  
// fetch() throws a TypeError when the network is down or the request is blocked
    const isNetworkError = caughtError instanceof TypeError;
    showError(
      isNetworkError
        ? 'Could not reach the dictionary. Check your internet connection and try again.'
        : caughtError.message
    );
  } finally {
    // If a newer search has started, it is responsible for the loading state
    if (searchId === latestSearchId) {
      setLoading(false);
    }
  }
}

// ---------- Event listeners ----------

searchForm.addEventListener('submit', (event) => {
  event.preventDefault(); // stop the page from reloading
  searchWord(wordInput.value);
});

// One listener handles every synonym button, even ones created later
results.addEventListener('click', (event) => {
  const button = event.target.closest('.synonym-button');
  if (button) searchWord(button.dataset.word);
});

savedList.addEventListener('click', (event) => {
  const removeButton = event.target.closest('[data-remove]');
  if (removeButton) {
    toggleSaved(removeButton.dataset.remove);
    return;
  }
  const wordButton = event.target.closest('.saved-word');
  if (wordButton) searchWord(wordButton.dataset.word);
});

themeToggle.addEventListener('click', () => {
  const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  writeStorage(THEME_KEY, nextTheme);
});

// ---------- Start ----------
initTheme();
renderSavedWords();

import './markdown.js';
import { setValue } from './utils/dom.js';

export function initNotes() {
  loadNotes();
  document.getElementById('notes-textarea').addEventListener('input', saveNotes);
  document.getElementById('notes-fullscreen').addEventListener('click', toggleFullscreenNotes);
  chrome.runtime.onMessage.addListener(handleMessage);
}

function loadNotes() {
  chrome.storage.local.get(['notesContent','notesFullscreen'], result => {
    const textarea = document.getElementById('notes-textarea');
    const container = document.getElementById('notes-container');
    if (result.notesContent) textarea.value = result.notesContent;
    if (result.notesFullscreen) container.classList.add('fullscreen-notes');
  });
}

function saveNotes() {
  const content = document.getElementById('notes-textarea').value;
  chrome.storage.local.set({ notesContent: content });
  chrome.tabs.query({ url: 'chrome://newtab/' }, tabs => {
    tabs.forEach(tab => chrome.tabs.sendMessage(tab.id,{ action:'updateNotes', notes:content }));
  });
}

function toggleFullscreenNotes() {
  const container = document.getElementById('notes-container');
  const isFs = container.classList.toggle('fullscreen-notes');
  chrome.storage.local.set({ notesFullscreen: isFs });
  chrome.tabs.query({ url: 'chrome://newtab/' }, tabs => {
    tabs.forEach(tab => chrome.tabs.sendMessage(tab.id,{ action:'updateNotesFullscreen', isFullscreen:isFs }));
  });
}

function handleMessage(message) {
  if (message.action === 'updateNotes') {
    document.getElementById('notes-textarea').value = message.notes;
  } else if (message.action === 'updateNotesFullscreen') {
    const container = document.getElementById('notes-container');
    container.classList.toggle('fullscreen-notes', message.isFullscreen);
  }
}
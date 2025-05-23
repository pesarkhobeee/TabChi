// DOM utility functions for common UI operations
export function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : null;
}

export function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

export function showElement(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'block';
}

export function hideElement(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

export function toggleElement(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

export function setStyle(id, styles) {
  const el = document.getElementById(id);
  if (el) Object.assign(el.style, styles);
}

export function setAttribute(id, attr, value) {
  const el = document.getElementById(id);
  if (el) el.setAttribute(attr, value);
}

export function setProperty(id, prop, value) {
  const el = document.getElementById(id);
  if (el) el[prop] = value;
}

export function addClickHandler(id, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', handler);
}

export function setHTML(id, content) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = content;
}

export function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

export function detachElement(id) {
  const el = document.getElementById(id);
  if (el && el.parentNode) el.parentNode.removeChild(el);
}
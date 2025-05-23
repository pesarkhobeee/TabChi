export function getStorage(keys) {
  return new Promise(resolve => chrome.storage.local.get(keys, resolve));
}
export function setStorage(items) {
  return new Promise(resolve => chrome.storage.local.set(items, resolve));
}
export function removeStorage(keys) {
  return new Promise(resolve => chrome.storage.local.remove(keys, resolve));
}
export function onStorageChanged(listener) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') listener(changes);
  });
}
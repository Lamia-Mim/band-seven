// Your own PDFs and images, kept in this browser's IndexedDB. They never
// leave the device.

import { get, set, del } from 'idb-keyval';

export async function listFiles() {
  return (await get('files')) || [];
}

export async function addFiles(fileList) {
  const index = await listFiles();
  for (const file of fileList) {
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    await set(`file:${id}`, file);
    index.push({ id, name: file.name, type: file.type, size: file.size, added: new Date().toISOString() });
  }
  await set('files', index);
  return index;
}

export const getFile = (id) => get(`file:${id}`);

export async function removeFile(id) {
  await del(`file:${id}`);
  const index = (await listFiles()).filter((f) => f.id !== id);
  await set('files', index);
  return index;
}

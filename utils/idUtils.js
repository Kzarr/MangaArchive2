function generateId(items) {
  const ids = items.map(i => i.id);
  return ids.length ? Math.max(...ids) + 1 : 1;
}

module.exports = { generateId };

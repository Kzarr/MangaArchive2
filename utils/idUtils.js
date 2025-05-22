function generateId(items = []) {
  if (!Array.isArray(items)) return 1;
  return items.length === 0
    ? 1
    : Math.max(...items.map(item => item.id || 0)) + 1;
}

module.exports = { generateId };

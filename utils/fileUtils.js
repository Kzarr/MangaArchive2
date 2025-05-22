const fs = require('fs');
const path = require('path');

function readJson(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', 'data', filePath);
    const data = fs.readFileSync(fullPath);
    return JSON.parse(data);
  } catch (err) {
    console.error("Erro lendo JSON:", err);
    return [];
  }
}

function writeJson(filePath, data) {
  try {
    const fullPath = path.join(__dirname, '..', 'data', filePath);
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error("Erro escrevendo JSON:", err);
    return false;
  }
}

module.exports = { readJson, writeJson };

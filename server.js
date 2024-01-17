const express = require('express');
const { JSDOM } = require('jsdom');
const fs = require('fs').promises;
const path = require('path');

const app = express();

app.use(express.json()); // Middleware для обработки JSON тела запроса
// Путь к папке с HTML-файлами, который будет установлен при обработке POST-запроса
let htmlFilesFolderPath;

// Статическое обслуживание файлов из папки 'public' и папки с HTML-файлами
app.use(express.static(path.join(__dirname, 'public')));
app.use('/files', (req, res, next) => {
if (htmlFilesFolderPath) {
express.static(htmlFilesFolderPath)(req, res, next);
} else {
next();
}
});

app.get('/', (req, res) => {
res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Маршрут для чтения HTML-файлов и извлечения данных изображений
app.post('/read-html', async (req, res) => {
const folderPath = req.body.folderPath;
if (typeof folderPath !== 'string') {
return res.status(400).send('Invalid folder path');
}

htmlFilesFolderPath = folderPath; // Обновляем текущий путь к папке
// Динамическое обслуживание статических файлов изображений

try {
const files = await fs.readdir(folderPath);
const htmlFiles = files.filter(file => file.endsWith('.html') || file.endsWith('.htm'));
const results = [];

for (const file of htmlFiles) {
const filePath = path.join(folderPath, file);
const htmlContent = await fs.readFile(filePath, 'utf8');
const dom = new JSDOM(htmlContent);
const images = Array.from(dom.window.document.querySelectorAll('img'));
const imageData = images.map(img => ({
name: path.basename(img.src),
src: `/files/${path.basename(img.src)}`,
alt: img.getAttribute('alt') || ''
}));

results.push({ filePath, imageData });
}


res.json(results);
} catch (error) {
res.status(500).send('Error reading HTML files: ' + error.message);
}
});
async function updateSingleAltText(filePath, index, newAltText) {
try {
const htmlContent = await fs.readFile(filePath, 'utf8');
const dom = new JSDOM(htmlContent);
const images = dom.window.document.querySelectorAll('img');

if (index < 0 || index >= images.length) {
throw new Error('Invalid image index');
}

images[index].setAttribute('alt', newAltText);

const updatedHtml = dom.serialize();
await fs.writeFile(filePath, updatedHtml, 'utf8');
} catch (error) {
throw new Error(`Failed to update file ${filePath}: ${error.message}`);
}
}
app.post('/save-updated-alt-texts', async (req, res) => {
const updatedData = req.body;
try {
for (const data of updatedData) {
const { filePath, index, newAltText } = data;
await updateSingleAltText(filePath, index, newAltText);
}
res.send('All changes saved successfully.');
} catch (error) {
res.status(500).send('Error saving changes: ' + error.message);
}
});
app.listen(3000, () => {
console.log('Server running on http://localhost:3000');
});
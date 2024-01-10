const express = require('express');
const { JSDOM } = require('jsdom');
const fs = require('fs').promises;
const path = require('path');

const app = express();

app.use(express.static('public')); // Предоставление статических файлов
app.use(express.json()); // Middleware для обработки JSON тела запроса

// Функция для валидации пути к папке
function isValidFolderPath(folderPath) {
    // Простая проверка на тип string
    return typeof folderPath === 'string';
}

// Маршрут для чтения HTML-файлов и извлечения данных изображений
app.post('/read-html', async (req, res) => {
    const folderPath = req.body.folderPath;
    if (!isValidFolderPath(folderPath)) {
        return res.status(400).send('Invalid folder path');
    }

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
                id: img.getAttribute('id') || 'Id отсутствует',
                src: img.src,
                alt: img.getAttribute('alt') || ''
            }));

            results.push({
                filePath,
                imageData
            });
        }

        res.json(results);
    } catch (error) {
        res.status(500).send('Error reading HTML files: ' + error.message);
    }
});

// Функция для асинхронного обновления alt-текста в HTML-файле
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

// Маршрут для обновления alt-текстов в HTML-файле
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

// Запуск сервера
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

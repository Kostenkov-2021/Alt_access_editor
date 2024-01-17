document.getElementById('loadButton').addEventListener('click', () => {
    const folderPath = document.getElementById('folderPath').value;
    // Отправляем запрос на сервер для получения данных
    fetchFiles(folderPath);
});

// функция отправки запроса для получения данных
function fetchFiles(folderPath) {
    fetch('/read-html', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ folderPath })
    })
    .then(response => response.json())
    .then(data => displayHtmlFiles(data))
    .catch(error => {
        console.error('Error:', error);
        showMessage('Ошибка при загрузке файлов', 'error');
    });
}


// Проверяем alt-текст на соответствие требованиям
function validateAltText(altText, image) {
    const warnings = [];

    // Проверка длины alt-текста
    if (altText.length > 255) {
        warnings.push(`Максимальная длина alt-текста составляет 255 символов, в вашем описании ${altText.length} символов.`);
    } else if (altText.length > 125) {
        warnings.push(`Рекомендуемая длина alt-текста составляет 125 символов, в вашем описании ${altText.length} символов.`);
    }

    // Проверка наличия точки в конце
    if (!altText.endsWith('.')) {
        warnings.push('В конце alt-текста рекомендуется ставить точку.');
    }

    // Проверка количества слов
    const wordCount = altText.split(/\s+/).length;
    if (wordCount < 3) {
        warnings.push('Кажется, в вашем alt-тексте менее 3 слов. Рекомендуемая длина от 3 до 15 слов.');
    } else if (wordCount > 15) {
        warnings.push('Кажется, в вашем alt-тексте более 15 слов. Рекомендуемая длина от 3 до 15 слов.');
    }

    // Проверка начальных слов
    if (/^(рисунок\|изображение\|картинка)\b/.test(altText.toLowerCase())) {
        warnings.push('Alt-текст не нужно начинать словами "рисунок", "изображение" или "картинка", скринридер может делать это по умолчанию.');
    }

    // Проверка на значок

    // Убедимся, что размеры изображения загружены
    if (image.complete && image.naturalWidth !== undefined) {
        if (image.naturalWidth < 35 && image.naturalHeight < 35 && image.parentElement.className === "bodytext" && altText) {
            warnings.push('Изображение похоже на значок. У значков не должно быть alt-текста, они всегда должны сопровождаться текстовым описанием.');
        }
    }

    // Проверка на дублирование с подписью
    const caption = image.parentElement.querySelector('.picturename');
    if (caption && caption.textContent === altText) {
        warnings.push('Alt-текст не должен дублировать подрисуночную подпись.');
    }

    return warnings;
}

document.getElementById('filesContainer').addEventListener('input', (event) => {
    if (event.target.tagName === 'INPUT' && event.target.type === 'text') {
        const filePath = event.target.dataset.filepath;
        const imgIndex = event.target.dataset.index;
        const newAltText = event.target.value;

        // Валидация alt-текста и отображение предупреждений
        const image = event.target.previousElementSibling; // Получаем изображение перед input
        const warnings = validateAltText(newAltText, image);
        displayWarnings(warnings, event.target); // Функция для отображения предупреждений

        updateAltText(filePath, imgIndex, newAltText);
    }
});



function displayHtmlFiles(data) {
    const filesContainer = document.getElementById('filesContainer');
    filesContainer.innerHTML = '';

    data.forEach(file => {
        const fileName = file.filePath.split('/').pop().split('\\').pop();
        const fileHeader = document.createElement('h2');
        fileHeader.textContent = fileName;
        filesContainer.appendChild(fileHeader);

        if (file.imageData.length > 0) {
            const table = createTable();
            file.imageData.forEach((img, index) => {
                const tr = createTableRow(img, file.filePath, index);
                table.appendChild(tr);
            });
            filesContainer.appendChild(table);
            const saveButton = createSaveButton(file.filePath, table);
            filesContainer.appendChild(saveButton);
        } else {
            const noImagesMessage = document.createElement('p');
            noImagesMessage.textContent = 'В этом файле нет изображений';
            filesContainer.appendChild(noImagesMessage);
        }
    });
}

function createTable() {
    const table = document.createElement('table');
    const tableHeader = document.createElement('thead');
    const headerRow = ['Изображение', 'Текущий alt-текст', 'Рекомендации', 'Новый alt-текст']
        .map(text => {
            const th = document.createElement('th');
            th.textContent = text;
            return th;
        });

    const tableHeaderRow = document.createElement('tr');
    headerRow.forEach(th => tableHeaderRow.appendChild(th));
    tableHeader.appendChild(tableHeaderRow);
    table.appendChild(tableHeader);

    return table;
}

function createTableRow(img, filePath, index) {
    const tr = document.createElement('tr');

    const tdName = document.createElement('td');
    const imgName = document.createElement('a');
    imgName.href = img.src;
    imgName.target = '_blank';
    imgName.textContent = img.name;
    tdName.appendChild(imgName);

    const tdCurrentAlt = document.createElement('td');
    tdCurrentAlt
.textContent = img.alt;

const tdRecommendation = document.createElement('td');
tdRecommendation.textContent = getRecommendation(img.alt);

const tdNewAlt = document.createElement('td');
const newAltTextarea = document.createElement('textarea');
newAltTextarea.dataset.filepath = filePath;
newAltTextarea.dataset.index = index;
newAltTextarea.value = img.alt;
newAltTextarea.cols = 40;
newAltTextarea.rows = 4;
tdNewAlt.appendChild(newAltTextarea);

tr.appendChild(tdName);
tr.appendChild(tdCurrentAlt);
tr.appendChild(tdRecommendation);
tr.appendChild(tdNewAlt);

return tr;
}
function createSaveButton(filePath, table) {
const saveButton = document.createElement('button');
saveButton.textContent = 'Сохранить изменения в этом файле';
saveButton.onclick = () => saveFileChanges(filePath, table);
return saveButton;
}
function saveFileChanges(filePath, table) {
const updatedData = gatherUpdatedDataFromTable(table, filePath);
fetch('/save-updated-alt-texts', {
method: 'POST',
headers: {'Content-Type': 'application/json'},
body: JSON.stringify(updatedData)
})
.then(response => {
if (response.ok) {
showMessage(`Изменения в файле ${filePath} успешно сохранены`, 'success');
} else {
throw new Error(`Не удалось сохранить изменения в файле ${filePath}`);
}
})
.catch(error => {
console.error('Error:', error);
showMessage(`Ошибка при сохранении изменений в файле ${filePath}`, 'error');
});
}
function gatherUpdatedDataFromTable(table, filePath) {
return Array.from(table.querySelectorAll('tr')).slice(1).map(row => {
const imgName = row.cells[0].textContent;
const newAltText = row.cells[3].querySelector('textarea').value;
const imageIndex = row.cells[3].querySelector('textarea').dataset.index;
return { filePath, imgName, newAltText, index: imageIndex };
});
}
function getRecommendation(altText) {
    const recommendations = [];

    if (altText.length > 255) {
        recommendations.push('Длина alt-текста превышает 255 символов. Рекомендуется сократить');
    } else if (altText.length > 125) {
        recommendations.push('Длина alt-текста более 125 символов. Рекомендуется сократить');
    }

    if (!altText.endsWith('.')) {
        recommendations.push('В конце alt-текста рекомендуется ставить точку');
    }

    const wordCount = altText.split(/\s+/).length;
    if (wordCount < 3) {
        recommendations.push('Кажется, в alt-тексте менее 3 слов. Рекомендуется расширить описание');
    } else if (wordCount > 15) {
        recommendations.push('Кажется, в alt-тексте более 15 слов. Рекомендуется сократить');
    }

    if (/^(рисунок\|изображение\|картинка)\b/.test(altText.toLowerCase())) {
        recommendations.push('Не рекомендуется начинать alt-текст со слов "рисунок", "изображение" или "картинка"');
    }


    return recommendations.length > 0 ? recommendations.join('. ') + '.' : 'Описание соответствует рекомендациям.';
}
function showMessage(message, type) {
const messageElement = document.createElement('div');
messageElement.classList.add('message', type);
messageElement.textContent = message;


document.body.appendChild(messageElement);

setTimeout(() => {
    document.body.removeChild(messageElement);
}, 5000);
}
function displayWarnings(warnings, inputElement) {
let warningsContainer = inputElement.parentElement.querySelector('.warnings');
if (!warningsContainer) {
warningsContainer = document.createElement('div');
warningsContainer.className = 'warnings';
inputElement.parentElement.appendChild(warningsContainer);
}
warningsContainer.innerHTML = warnings.join('<br>');
}

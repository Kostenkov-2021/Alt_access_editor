document.getElementById('loadButton').addEventListener('click', () => {
    const folderPath = document.getElementById('folderPath').value;

    // Отправляем запрос на сервер для получения данных
    fetchFiles(folderPath);
});

// функция отправляющая запрос для получения данных
function fetchFiles(folderPath) {
    fetch('/read-html', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ folderPath })
    })
    .then(response => response.json())
   .then(data => {
        displayHtmlFiles(data);
        showMessage('Файлы успешно загружены', 'success');
    })
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
    if (/^(рисунок|изображение|картинка)\b/.test(altText.toLowerCase())) {
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



// функция для отображения файлов в папке
function displayHtmlFiles(data) {
    const filesContainer = document.getElementById('filesContainer');
    filesContainer.innerHTML = '';

    data.forEach(file => {
        const tr = document.createElement('tr');
        const tdPath = document.createElement('td');
        tdPath.textContent = file.filePath;

        const tdLink = document.createElement('td');
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = file.imageData.length > 0 ? 'Открыть' : 'Нет изображений';
        link.onclick = file.imageData.length > 0 ? 
            () => displayImagesData(file.imageData, file.filePath) : 
            () => showMessage('В этом файле нет изображений', 'error');
        tdLink.appendChild(link);

        tr.appendChild(tdPath);
        tr.appendChild(tdLink);
        filesContainer.appendChild(tr);
    });
}

// Функция для отображения данных  изображений
function displayImagesData(imageData, filePath) {
    const filesContainer = document.getElementById('filesContainer');
    filesContainer.innerHTML = '';

    const backButton = document.createElement('button');
    backButton.textContent = 'Вернуться к списку файлов';
    backButton.onclick = () => fetchFiles(document.getElementById('folderPath').value);
    filesContainer.appendChild(backButton);

    imageData.forEach((img, index) => {
        const tr = document.createElement('tr');
        const tdFilePath = document.createElement('td');
        tdFilePath.textContent = filePath;

        const tdCurrentAlt = document.createElement('td');
        tdCurrentAlt.textContent = img.alt;

        const tdNewAlt = document.createElement('td');
        const newAltTextarea = document.createElement('textarea');
        newAltTextarea.value = img.alt;
        tdNewAlt.appendChild(newAltTextarea);

        tr.appendChild(tdFilePath);
        tr.appendChild(tdCurrentAlt);
        tr.appendChild(tdNewAlt);
        filesContainer.appendChild(tr);
    });
}

// Функция для отображения сообщений
function showMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    messageElement.textContent = message;

    document.body.appendChild(messageElement);

    setTimeout(() => {
        document.body.removeChild(messageElement);
    }, 5000);
}

// собираем и сохраняем обновлённые данные
function gatherUpdatedData() {
    const rows = document.querySelectorAll('#filesContainer tr');
    return Array.from(rows).map(row => {
        const filePath = row.cells[0].textContent;
        const imgIndex = Array.from(row.parentNode.children).indexOf(row) - 1; // Получаем индекс изображения
        const newAltText = row.cells[4].querySelector('textarea').value;
        return { filePath, index: imgIndex, newAltText };
    });
}


// Функция для отображения предупреждений
function displayWarnings(warnings, inputElement) {
    let warningsContainer = inputElement.parentElement.querySelector('.warnings');
    if (!warningsContainer) {
        warningsContainer = document.createElement('div');
        warningsContainer.className = 'warnings';
        inputElement.parentElement.appendChild(warningsContainer);
    }
    warningsContainer.innerHTML = warnings.join('<br>');
}

document.getElementById('loadButton').addEventListener('click', () => {
    const folderPath = document.getElementById('folderPath').value;
    fetchFiles(folderPath);
});

function fetchFiles(folderPath) {
    fetch('/read-html', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ folderPath })
    })
    .then(response => response.json())
    .then(data => displayHtmlFiles(data))
    .catch(error => console.error('Error:', error));
}

document.getElementById('saveChangesButton').addEventListener('click', () => {
    saveChanges();
});

function saveChanges() {
    const updatedData = gatherUpdatedData();
    fetch('/save-updated-alt-texts', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updatedData)
    })
    .then(response => {
        if (response.ok) {
            showMessage('Изменения успешно сохранены', 'success');
            const folderPath = document.getElementById('folderPath').value;
            fetchFiles(folderPath); // Повторная загрузка списка файлов
        } else {
            throw new Error('Не удалось сохранить изменения.');
        }
    })
    .catch(error => console.error('Error:', error));
}

function gatherUpdatedData() {
    const rows = document.querySelectorAll('#filesContainer tr');
    return Array.from(rows).map(row => {
        const filePath = row.cells[0].textContent;
        const imgIndex = Array.from(row.parentNode.children).indexOf(row) - 1; // Получаем индекс изображения
        const newAltText = row.cells[4].querySelector('textarea').value;
        return { filePath, index: imgIndex, newAltText };
    });
}

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
        link.textContent = 'Открыть';
        link.onclick = () => displayImagesData(file.imageData, file.filePath);
        tdLink.appendChild(link);

        tr.appendChild(tdPath);
        tr.appendChild(tdLink);
        filesContainer.appendChild(tr);
    });
}

function displayImagesData(imageData, filePath) {
    const filesContainer = document.getElementById('filesContainer');
    filesContainer.innerHTML = '';

    const backButton = document.createElement('button');
    backButton.textContent = 'Вернуться к списку файлов';
    backButton.onclick = () => {
        saveChanges(); // Сохранить изменения и вернуться к списку файлов
    };
    filesContainer.appendChild(backButton);

    imageData.forEach((img, index) => {
        const tr = document.createElement('tr');
        const tdFilePath = document.createElement('td');
        tdFilePath.textContent = filePath;

        const tdId = document.createElement('td');
        tdId.textContent = img.id || 'Id отсутствует';

        const tdNewId = document.createElement('td');
        const newIdInput = document.createElement('input');
        newIdInput.type = 'text';
        newIdInput.value = img.id || '';
        tdNewId.appendChild(newIdInput);

        const tdAlt = document.createElement('td');
        tdAlt.textContent = img.alt;

        const tdNewAlt = document.createElement('td');
        const newAltTextarea = document.createElement('textarea');
        newAltTextarea.value = img.alt;
        tdNewAlt.appendChild(newAltTextarea);

        tr.appendChild(tdFilePath);
        tr.appendChild(tdId);
        tr.appendChild(tdNewId);
        tr.appendChild(tdAlt);
        tr.appendChild(tdNewAlt);
        filesContainer.appendChild(tr);
    });
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

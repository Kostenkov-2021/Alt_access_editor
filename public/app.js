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


function showMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    messageElement.textContent = message;

    document.body.appendChild(messageElement);

    setTimeout(() => {
        document.body.removeChild(messageElement);
    }, 5000);
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



function displayWarnings(warnings, inputElement) {
    let warningsContainer = inputElement.parentElement.querySelector('.warnings');
    if (!warningsContainer) {
        warningsContainer = document.createElement('div');
        warningsContainer.className = 'warnings';
        inputElement.parentElement.appendChild(warningsContainer);
    }
    warningsContainer.innerHTML = warnings.join('<br>');
}

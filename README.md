# Alt_access_editor
 Image description editor ("alt" attribute) for htm/html documents.





# Документация проекта "Alt_access_editor"

## Общее описание

Проект "Alt_access_editor" - это веб-приложение для удобного управления и редактирования alt-текстов изображений в HTM/HTML-файлах.

## Структура проекта

Проект состоит из трёх основных файлов:

  * `server.js`: Серверная часть на Node.js, использующая Express.js для обработки HTTP-запросов.
  * `app.js`: Клиентский JavaScript, который обрабатывает взаимодействие с пользователем.
  * `index.html`: Основная веб-страница, через которую пользователь взаимодействует с приложением.

## Запуск проекта

### Установка Node.js

  1. Перейдите на [официальный сайт Node.js](https://nodejs.org/). На главной странице вы увидите две версии для скачивания: LTS (Long Term Support) (версию с длительным периодом поддержки) и Current (текущая версия). Рекомендуется выбрать LTS версию, так как она обеспечивает наилучшую стабильность и поддержку.
  2. Скачайте установщик для вашей операционной системы (Windows, MacOS или Linux) и следуйте инструкциям установщика.
  3. Откройте терминал или командную строку и введите `node -v` для проверки установки. В результате на экране должно появится сообщение с номером установленной версией, это означает, что установка прошла успешно.

### Запуск проекта

  1. Клонируйте репозиторий или скачайте файлы проекта.
  2. Перейдите в каталог проекта при помощи команды `cd [путь к папке проекта]` и выполните команду `npm install`, чтобы установить все необходимые зависимости проекта.
  3. Запустите сервер с помощью команды `node server.js`. В результате вы должны увидеть сообщение в терминале, указывающее, что сервер запущен и слушает на определенном порту (обычно `http://localhost:3000`). Пример сообщения: "Server running on http://localhost:1000"
  4. Откройте `index.html` в вашем браузере: откройте веб-браузер и введите адрес, на котором запущен сервер (например, `http://localhost:3000`). Вы должны увидеть интерфейс приложения.
  5. После завершения работы с приложением для остановки сервера, находясь в папке с проектом, нажмите "ctrl +C".

## Использование

Введите абсолютный путь к папке с Htm/HTML-файлами в поле ввода на веб- странице. Пример абсолютного пути: "C:\Имя пользователя\документы\проекты\название_проекта\файлы\". Нажмите кнопку "Извлечь ALT-тексты". В результате появятся таблицы, соответствующие файлам, находящимся в указанной вами папке. Каждая таблица содержит  название изображения, по нажатию на которое можно просмотреть изобржение, текущее описание изображения, поле ввода для нового описания, а также рекомендации по улучшению. После редактирования файла нажмите кнопку "Сохранить изменения в этом файле", чтобы сохранить внесённые вами изменения. Если в каком либо из файлов нет изображений, вместо таблицы вы увидите соответствующее предупреждение. Обращайте внимание на сообщения об успехе, ошибке или предупреждениях, отображаемых в интерфейсе.

## Функции валидации

* Длина Alt-текста: Проверка длины alt-текста, чтобы она не превышала 255 символов.
* Точка в конце alt-текста: Проверка наличия точки в конце alt-текста.
* Количество Слов: Проверка количества слов в alt-тексте для соответствия рекомендуемому диапазону от 3 до 15 слов.
* Начальные Слова: Alt-текст не должен начинаться со слов "рисунок", "изображение" или "картинка".
* Значки: Проверка на соответствие изображения критериям значков и соответствующее отсутствие alt-текста.
* Дублирование с Подписью: Alt-текст не должен дублировать текст, который уже присутствует в подписи изображения.

## Ошибки и предупреждения

Пользовательский интерфейс обеспечивает отображение информационных сообщений и
предупреждений о валидации, помогая пользователям эффективно редактировать и
обновлять alt-тексты.

## Безопасность и настройки

Приложение включает проверку на то, что указанный путь действительно является папкой. Все операции чтения и записи файлов асинхронны для оптимизации
производительности и предотвращения блокировок.




## "Alt_access_editor" project documentation

## General description

The "Alt_access_editor" project is a web application for easy management and editing of alt-texts of images in HTM/HTML files.

## Project structure

The project consists of three main files:

  * `server.js`: Server part on Node.js, using Express.js to handle HTTP requests.
  * `app.js`: Client-side JavaScript that handles user interaction.
  * `index.html`: The main web page through which the user interacts with the application.

## Start the project

### Installing Node.js

  1. Go to the [official Node.js website](https://nodejs.org/). On the home page, you will see two versions for download: the LTS (Long Term Support) version and the Current version. It is recommended to choose the LTS version as it provides the best stability and support.
  2. Download the installer for your operating system (Windows, macOS or Linux) and follow the installer instructions.
  3. Open a terminal or command prompt and type `node -v` to verify the installation. This should display a message with the installed version number, this means the installation was successful.

### Start the project

  1. Clone the repository or download the project files.
  2. Navigate to the project directory using the `cd [project folder path]` command and run the `npm install` command to install all required project dependencies.
 3. Start the server using the `node server.js` command. As a result, you should see a message in the terminal indicating that the server is running and listening on a specific port (usually `http://localhost:3000`). An example message is "Server running on http://localhost:1000"
  4. Open `index.html` in your browser: open a web browser and type in the address where the server is running (for example, `http://localhost:3000`). You should see the application interface.
  5. When you are finished with the application, press "ctrl +C" while in the project folder to stop the server.

## Usage

Enter the absolute path to the folder with the Htm/HTML files in the input field on the web page. An example of an absolute path is "C:\Username\documents/projects/project name/files\". Click the "Extract ALT texts" button. As a result, tables corresponding to the files in the folder you specified will appear. Each table contains the name of the image, which you can click to view the image, the current description of the image, an input field for a new description, and recommendations for improvement. After editing a file, click the "Save changes to this file" button to save your changes. If there are no images in any of the files, you will see a warning message instead of the table. Pay attention to the success, error, or warning messages displayed in the interface.


## Validation functions

* Alt-text length: Checks that the length of the alt-text does not exceed 255 characters.
* Dot at the end of alt-text: Checks if there is a dot at the end of the alt-text.
* Number of Words: Check the number of words in the alt-text to match the recommended range of 3 to 15 words.
* Start Words: Alt-text should not start with the words "picture", "image" or "picture".
* Icons: Check to see if the image meets the criteria for icons and the corresponding lack of alt-text.
* Duplicate with Caption: Alt-text should not duplicate text that is already present in the image caption.

## Errors and Warnings

The user interface provides a display of informational messages and
validation warnings, helping users to efficiently edit and update alt-texts.
update alt-texts.

## Security and Settings

The application includes verification that the specified path is indeed a folder. All file read and write operations are asynchronous to optimise
performance and prevent locks.



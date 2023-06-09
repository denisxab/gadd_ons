function messageIsBot(div_msg) {
    // Проверяем, является ли сообщение от бота, если нет элемента 'img'
    return !div_msg.querySelector("img");
}

function getDate() {
    // Получить текущую дату и время
    const now = new Date();
    const year = now.getFullYear();
    const month = ("0" + (now.getMonth() + 1)).slice(-2);
    const day = ("0" + now.getDate()).slice(-2);
    const hours = ("0" + now.getHours()).slice(-2);
    const minutes = ("0" + now.getMinutes()).slice(-2);
    const seconds = ("0" + now.getSeconds()).slice(-2);

    const dateString = `y${year}_m${month}_d${day}_h${hours}_m${minutes}_s${seconds}`;

    return dateString;
}

function saveTextToFile(text) {
    // Скачать текст в файл
    const filename = `"${getDate()}.txt`;

    // Создаем новый Blob-объект с текстом, который хотим сохранить в файле
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });

    // Создаем новый объект ссылки на URL-адрес файла
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    link.style.display = "none";

    // Добавляем ссылку на документ и кликаем по ней, чтобы начать загрузку файла
    document.body.appendChild(link);
    link.click();

    // Удаляем ссылку на файл из документа
    document.body.removeChild(link);
}

function parseMessage(div_msg) {
    // Парсит сообщение и возвращает его в формате Markdown
    console.log(div_msg);
    if (!div_msg || !messageIsBot(div_msg)) {
        // Проверяем, существует ли div_msg и является ли сообщение от бота
        return "";
    }
    const tmp_arr = [];
    const msg_text_div = div_msg.querySelector(".markdown");
    // Получаем блок с текстом сообщения
    msg_text_div.childNodes.forEach((ch) => {
        const tagName = ch.tagName;
        const textContent = ch.textContent;

        if (tagName === "P") {
            // Добавляем текст абзаца в вывод
            tmp_arr.push(`${textContent}\n`);
        } else if (["H1", "H2", "H3", "H4", "H5", "H6"].includes(tagName)) {
            // Добавляем заголовок в вывод
            tmp_arr.push(
                "#".repeat(tagName.slice(1)) + " " + textContent + "\n"
            );
        } else if (tagName === "OL") {
            // Добавляем текст элементов списка в вывод
            const liNodes = ch.querySelectorAll("li");
            liNodes.forEach((liNode, index) => {
                tmp_arr.push(`${index + 1}. ${liNode.textContent}\n`);
            });
        } else if (tagName === "UL") {
            const liNodes = ch.querySelectorAll("li");
            liNodes.forEach((liNode) => {
                tmp_arr.push(`- ${liNode.textContent}\n`);
            });
        } else if (tagName === "PRE") {
            // Добавляем блок кода в вывод
            let elmTitleCode = "";
            if (ch.children[0].childNodes[0].querySelector("span")) {
                elmTitleCode =
                    ch.children[0].childNodes[0].querySelector(
                        "span"
                    ).textContent;
            }
            const elmTextCode = ch.children[0].childNodes[1].textContent;
            tmp_arr.push("```" + elmTitleCode + "\n" + elmTextCode + "```\n");
        }
        tmp_arr.push("\n"); // Добавляем перевод строки в вывод
    });
    const res = tmp_arr.join("");
    console.log(res);
    // Сохраняем результат в файл
    saveTextToFile(res);
    return res;
}

function addButtonCopyMarkdown(div_msg) {
    /* Добавить кнопку для копирования текста в формате Markdown */

    const gpt_addons_copy_markdown_bg = "#343541";
    const elm_new = div_msg.querySelector(".flex.flex-grow");
    const elm_bt = document.createElement("input");
    elm_bt.type = "button";
    elm_bt.className = "gpt_addons_copy_markdown";
    elm_bt.value = "CopyMarkdown";
    elm_bt.style.background = gpt_addons_copy_markdown_bg;
    elm_bt.addEventListener("click", () => {
        parseMessage(elm_new);
    });
    if (!elm_new.querySelector(".gpt_addons_copy_markdown")) {
        elm_new.appendChild(elm_bt);
    }
}

$(document).ready(function () {
    console.log("Страница загружена");
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === "addButtonCopyMarkdown") {
        HendeladdButtonCopyMarkdown();
    }
});

function HendeladdButtonCopyMarkdown() {
    console.log("Функция успешно вызвана из расширения!");
    // Получить список сообщений
    const div_messages = document.querySelectorAll("div.group.w-full");
    // Перебрать список сообщений
    const output = [];
    div_messages.forEach((div_msg) => {
        if (messageIsBot(div_msg)) {
            addButtonCopyMarkdown(div_msg);
        }
    });
    console.log(output.join(""));
}

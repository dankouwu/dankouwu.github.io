async function fetchData() {
    const response = await fetch("./data.json");
    const data = await response.json();

    const container = document.getElementById("content");
    const categoryTemplate = document.getElementById("categoryTemplate");
    const listItemTemplate = document.getElementById("listItem");

    let htmlContent = "";

    Object.values(data.categories).forEach(category => {
        const ctClone = categoryTemplate.content.cloneNode(true);
        ctClone.querySelector("h2").textContent = category.title;
        const list = ctClone.querySelector("ul");

        Object.values(category.notes).forEach(note => {
            const litClone = listItemTemplate.content.cloneNode(true);
            litClone.querySelector("h3").textContent = note.title;
            const paragraphs = litClone.querySelectorAll("p");
            paragraphs[0].textContent = note.text;
            paragraphs[1].textContent = note.dueDate;
            list.appendChild(litClone);
        })
        container.appendChild(ctClone);
    })
}

fetchData();
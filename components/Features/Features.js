function createFeatures() {
    const featuresData = fetch('./json/features.json').then((response) => response.json());
    const container = document.getElementById('features');
    const featuresLine = document.querySelector('.featuresLine');

    featuresData.then((data) => {
        data.features.forEach((feature) => {
        const featureElement = document.createElement('div');
        featureElement.classList.add('feature');
        featureElement.id = feature.id;
        featureElement.innerHTML = `
            <div class="featureIcon">
                <i data-lucide="${feature.icon}"></i>
            </div>
            <div class="featureTitle">
                <p>${feature.title}</p>
            </div>
            <p>${feature.description}</p>
        `;
        container.appendChild(featureElement);
    });
    lucide.createIcons();
    let lineHeight = (data.features.length-1) * 15;
    featuresLine.style.height = `${lineHeight}em`;

    window.dispatchEvent(new Event('features-created'));
});
}

class Features extends HTMLElement {
    async connectedCallback() {
        const response = await fetch('./components/Features/features.html');
        this.innerHTML = await response.text();
        createFeatures();
    }
}

customElements.define('app-features', Features);
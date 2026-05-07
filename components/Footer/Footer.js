class Footer extends HTMLElement {
    async connectedCallback() {
        const response = await fetch('./components/Footer/footer.html');
        this.innerHTML = await response.text();
        
        lucide.createIcons();
    }
}

customElements.define('app-footer', Footer);
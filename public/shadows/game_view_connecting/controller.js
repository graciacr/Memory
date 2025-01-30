class GameViewConnecting extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        //carga los estilos CSS
        const style = document.createElement('style');
        style.textContent = await fetch('/shadows/game_view_connecting/style.css').then(r => r.text());
        this.shadow.appendChild(style);
    
        //carga la estructura HTML
        const htmlContent = await fetch('/shadows/game_view_connecting/view.html').then(r => r.text());
        const template = document.createElement('template');
        template.innerHTML = htmlContent;
        
        this.shadow.appendChild(template.content.cloneNode(true));

        //definir eventos si es necesario
    }
}

//define el componente web personalizado
customElements.define('game-view-connecting', GameViewConnecting);

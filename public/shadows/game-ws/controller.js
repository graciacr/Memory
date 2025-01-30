class GameWS extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
        this.view = "game-view-disconnected"; // Estado inicial
    }

    async connectedCallback() {
        // Carga los estilos CSS
        const style = document.createElement('style');
        style.textContent = await fetch('/shadows/game-ws/style.css').then(r => r.text());
        this.shadow.appendChild(style);
    
        // Carga la estructura HTML
        const htmlContent = await fetch('/shadows/game-ws/view.html').then(r => r.text());
        const template = document.createElement('template');
        template.innerHTML = htmlContent;
        
        this.shadow.appendChild(template.content.cloneNode(true));
    } 

    async showView(viewName) {
        let animTime = '500ms';
        let refDisconnected = this.getViewRoot('game-view-disconnected');
        let refConnecting = this.getViewRoot('game-view-connecting');
        let refDisconnecting = this.getViewRoot('game-view-disconnecting');
        let refPlaying = this.getViewRoot('game-view-playing');

        // Transición entre vistas del juego
        switch (viewName) {
            case 'game-view-disconnected':
                if (this.view == 'game-view-connecting') {
                    this.animateViewChange('right', animTime, refConnecting, refDisconnected);
                }
                if (this.view == 'game-view-disconnecting') {
                    this.animateViewChange('right', animTime, refDisconnecting, refDisconnected);
                }
                break;
            case 'game-view-connecting':
                this.animateViewChange('left', animTime, refDisconnected, refConnecting);
                break;
            case 'game-view-disconnecting':
                this.animateViewChange('right', animTime, refPlaying, refDisconnecting);
                break;
            case 'game-view-playing':
                this.animateViewChange('left', animTime, refConnecting, refPlaying);
                break;
        }
        this.view = viewName;
    }
}

// Define el componente web personalizado
customElements.define('game-ws', GameWS);

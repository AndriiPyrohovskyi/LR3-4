async function loadComponent(selector, filePath) {
    const container = document.querySelector(selector);
    if (container) {
        const response = await fetch(filePath);
        const content = await response.text();
        container.innerHTML = content;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadComponent('.header', '/components/header.html').then(() => {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

        if (currentUser) {
            const authButton = document.querySelector('#login-btn');
            if (authButton) {
                authButton.outerHTML = `
                    <div class="user-menu">
                        <button class="user-name">${currentUser.username}</button>
                        <div class="dropdown-menu">
                            <button id="order-history-btn">Переглянути історію замовлень</button>
                            ${
                                currentUser.rights === 'admin'
                                    ? '<button id="admin-panel-btn">Переглянути адмін панель</button>'
                                    : ''
                            }
                            <button id="logout-btn">Вийти</button>
                        </div>
                    </div>
                `;

                const orderHistoryButton = document.querySelector('#order-history-btn');
                orderHistoryButton.addEventListener('click', () => {
                    window.location.href = '/pages/other/orderhistory.html';
                });

                if (currentUser.rights === 'admin') {
                    const adminPanelButton = document.querySelector('#admin-panel-btn');
                    adminPanelButton.addEventListener('click', () => {
                        window.location.href = '/pages/other/adminPanel.html';
                    });
                }

                const logoutButton = document.querySelector('#logout-btn');
                logoutButton.addEventListener('click', () => {
                    sessionStorage.removeItem('currentUser');
                    window.location.href = '/auth.html';
                });
            }
        } else {
            const loginButton = document.querySelector('#login-btn');
            if (loginButton) {
                loginButton.addEventListener('click', () => {
                    window.location.href = '/auth.html';
                });
            }
        }
    });

    loadComponent('.footer', '/components/footer.html');
});

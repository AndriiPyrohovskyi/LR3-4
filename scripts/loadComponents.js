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
                            <button id="logout-btn">Вийти</button>
                        </div>
                    </div>
                `;
                const logoutButton = document.querySelector('#logout-btn');
                logoutButton.addEventListener('click', () => {
                    sessionStorage.removeItem('currentUser');
                    window.location.href = '/auth.html';
                });
            }
        } else {
            // Додаємо обробник події для кнопки авторизації
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

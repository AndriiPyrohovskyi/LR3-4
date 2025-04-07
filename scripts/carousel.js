const carousels = [
    {
        container: document.querySelector('#bestsellers-carousel-items'),
        prevButton: document.querySelector('#bestsellers-prev-btn'),
        nextButton: document.querySelector('#bestsellers-next-btn'),
        products: [],
        currentIndex: 0
    },
    {
        container: document.querySelector('#recommendations-carousel-items'),
        prevButton: document.querySelector('#recommendations-prev-btn'),
        nextButton: document.querySelector('#recommendations-next-btn'),
        products: [],
        currentIndex: 0
    },
    {
        container: document.querySelector('#novelty-carousel-items'),
        prevButton: document.querySelector('#novelty-prev-btn'),
        nextButton: document.querySelector('#novelty-next-btn'),
        products: [],
        currentIndex: 0
    }
];

async function fetchProducts() {
    const response = await fetch('data/products.json');
    const allProducts = await response.json();

    // Розподіл продуктів між каруселями
    carousels[0].products = allProducts.slice(0, 10); // Бестселери
    carousels[1].products = allProducts.slice(0, 10); // Рекомендації
    carousels[2].products = allProducts.slice(0, 10); // Новинки

    carousels.forEach(renderProducts);
}

function renderProducts(carousel) {
    const { container, products } = carousel;
    container.innerHTML = '';
    products.forEach((product) => {
        const item = document.createElement('div');
        item.classList.add('carousel_item');

        const tags = Array.isArray(product.tags) ? product.tags : [];

        item.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="tags">
                ${tags.includes('Лідер продаж') ? '<span class="tag best-seller">Лідер продаж</span>' : ''}
                ${tags.includes('Новинка') ? '<span class="tag new">Новинка</span>' : ''}
            </div>
            <p class="sku">Артикул: ${product.sku}</p>
            <h3 class="product_name">${product.name}</h3>
            <p class="price">${product.price}</p>
            <div class="item-buttons">
                <button class="favorite-btn" data-product-id="${product.id}">Улюблене</button>
                <button class="cart-btn" data-product-id="${product.id}">Кошик</button>
            </div>
        `;
        container.appendChild(item);
    });
    updateCarousel(carousel);
}

function updateCarousel(carousel) {
    const { container, currentIndex } = carousel;
    const items = container.querySelectorAll('.carousel_item');
    const visibleItems = 5; // Кількість видимих айтемів

    // Встановлюємо ширину контейнера для горизонтального скролу
    container.style.display = 'flex';
    container.style.transition = 'transform 0.3s ease-in-out';
    container.style.transform = `translateX(-${currentIndex * (100 / visibleItems)}%)`;

    items.forEach((item) => {
        item.style.flex = `0 0 ${100 / visibleItems}%`; // Ширина айтема
    });
}

function showNext(carousel) {
    const visibleItems = 3;
    const maxIndex = carousel.products.length - visibleItems;
    carousel.currentIndex = Math.min(carousel.currentIndex + 1, maxIndex);
    updateCarousel(carousel);
}

function showPrev(carousel) {
    carousel.currentIndex = Math.max(carousel.currentIndex - 1, 0);
    updateCarousel(carousel);
}

function isAuthenticated() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    return currentUser !== null; // Повертає true, якщо користувач авторизований
}

function getCurrentUser() {
    return JSON.parse(sessionStorage.getItem('currentUser')); // Отримуємо поточного користувача
}

function saveCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user)); // Зберігаємо користувача в sessionStorage
}

async function addToCart(productId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Ви повинні увійти в систему, щоб додати товар у кошик!');
        window.location.href = '/auth.html';
        return;
    }

    try {
        const response = await fetch(`/api/users/${currentUser.username}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity: 1 }), // Передаємо productId і quantity
        });

        if (response.ok) {
            alert('Товар додано до кошика!');
        } else {
            const error = await response.json();
            alert(error.error);
        }
    } catch (err) {
        console.error('Помилка при додаванні товару до кошика:', err);
    }
}

async function addToFavorites(productId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Ви повинні увійти в систему, щоб додати товар в улюблене!');
        window.location.href = '/auth.html';
        return;
    }

    try {
        const response = await fetch(`/api/users/${currentUser.username}/favorites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId }),
        });

        if (response.ok) {
            alert('Товар додано до улюбленого!');
        } else {
            const error = await response.json();
            alert(error.error);
        }
    } catch (err) {
        console.error('Помилка при додаванні до улюбленого:', err);
    }
}

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('favorite-btn') || event.target.classList.contains('cart-btn')) {
        const currentUser = getCurrentUser(); // Отримуємо авторизованого користувача
        if (!currentUser) {
            alert('Ви повинні увійти в систему, щоб додати товар!');
            window.location.href = '/auth.html';
            return;
        }

        const productId = event.target.dataset.productId;

        if (!productId) {
            console.error('Помилка: ID продукту не визначено.');
            alert('Не вдалося виконати дію через помилку.');
            return;
        }

        if (event.target.classList.contains('favorite-btn')) {
            addToFavorites(productId);
        }

        if (event.target.classList.contains('cart-btn')) {
            addToCart(productId);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('#login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = loginForm.querySelector('input[placeholder="username"]').value;
            const password = loginForm.querySelector('input[placeholder="password"]').value;

            try {
                const response = await fetch('/api/users');
                const users = await response.json();
                const user = users.find((u) => u.username === username && u.password === password);

                if (user) {
                    saveCurrentUser(user);
                    alert('Успішний вхід!');
                    window.location.href = '/main.html';
                } else {
                    alert('Невірний логін або пароль!');
                }
            } catch (err) {
                console.error('Помилка при авторизації:', err);
                alert('Не вдалося виконати вхід. Спробуйте пізніше.');
            }
        });
    } else {
        console.warn('Форма логіну не знайдена на цій сторінці.');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.querySelector('#logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            sessionStorage.removeItem('currentUser');
            window.location.href = '/auth.html';
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.querySelector('#login-btn');
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            window.location.href = '/auth.html';
        });
    }
});

carousels.forEach((carousel) => {
    carousel.nextButton.addEventListener('click', () => showNext(carousel));
    carousel.prevButton.addEventListener('click', () => showPrev(carousel));
});

fetchProducts();
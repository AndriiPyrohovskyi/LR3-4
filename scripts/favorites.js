document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Ви повинні увійти в систему, щоб переглянути цю сторінку!');
        window.location.href = '/auth.html';
        return;
    }

    const favoritesContainer = document.querySelector('#favorites');

    try {
        const userResponse = await fetch(`/api/users/${currentUser.username}`);
        if (!userResponse.ok) {
            throw new Error('Не вдалося отримати дані користувача');
        }
        const user = await userResponse.json();

        if (!user.favorites || user.favorites.length === 0) {
            favoritesContainer.innerHTML = '<p>У вас немає улюблених товарів.</p>';
            return;
        }
        const productsResponse = await fetch('/data/products.json');
        if (!productsResponse.ok) {
            throw new Error('Не вдалося отримати дані про товари');
        }
        const products = await productsResponse.json();
        const favoriteProducts = products.filter((product) => user.favorites.includes(product.id));
        favoriteProducts.forEach((product) => {
            const productElement = document.createElement('div');
            productElement.classList.add('product-item');
            productElement.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-details">
                    <h3>${product.name}</h3>
                    <p>Ціна: ${product.price}</p>
                    <p>Артикул: ${product.sku}</p>
                    <button class="add-to-cart-btn" data-product-id="${product.id}">Додати в кошик</button>
                    <button class="remove-btn" data-product-id="${product.id}">Видалити</button>
                </div>
            `;
            favoritesContainer.appendChild(productElement);
        });
        favoritesContainer.addEventListener('click', async (event) => {
            const productId = event.target.dataset.productId;

            if (event.target.classList.contains('add-to-cart-btn')) {
                await addToCart(productId);
            } else if (event.target.classList.contains('remove-btn')) {
                await removeFromFavorites(productId);
            }
        });

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
                    body: JSON.stringify({ productId, quantity: 1 }),
                });
        
                if (response.ok) {
                    alert('Товар додано до кошика!');
                } else {
                    throw new Error('Не вдалося додати товар до кошика');
                }
            } catch (err) {
                console.error('Помилка при додаванні товару до кошика:', err);
            }
        }

        async function removeFromFavorites(productId) {
            const currentUser = getCurrentUser();
            if (!currentUser) {
                alert('Ви повинні увійти в систему, щоб видалити товар з улюблених!');
                window.location.href = '/auth.html';
                return;
            }
        
            try {
                const response = await fetch(`/api/users/${currentUser.username}/favorites/${productId}`, {
                    method: 'DELETE',
                });
        
                if (response.ok) {
                    currentUser.favorites = currentUser.favorites.filter((id) => id !== productId);
                    saveCurrentUser(currentUser);
                    const productElement = document.querySelector(`[data-product-id="${productId}"]`).closest('.product-item');
                    if (productElement) {
                        productElement.remove();
                    }
        
                    alert('Товар видалено з улюблених!');
                } else {
                    const error = await response.json();
                    console.error('Помилка при видаленні товару з улюблених:', error.error);
                    alert('Не вдалося видалити товар з улюблених.');
                }
            } catch (err) {
                console.error('Помилка при видаленні товару з улюблених:', err);
            }
        }
    } catch (err) {
        console.error('Помилка при завантаженні улюблених товарів:', err);
        favoritesContainer.innerHTML = '<p>Не вдалося завантажити улюблені товари.</p>';
    }
});

function getCurrentUser() {
    return JSON.parse(sessionStorage.getItem('currentUser'));
}

function saveCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}
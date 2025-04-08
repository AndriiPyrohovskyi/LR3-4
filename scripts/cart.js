document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Ви повинні увійти в систему, щоб переглянути цю сторінку!');
        window.location.href = '/auth.html';
        return;
    }

    const cartContainer = document.querySelector('#cart');
    let user;

    try {
        const userResponse = await fetch(`/api/users/${currentUser.username}`);
        if (!userResponse.ok) {
            throw new Error('Не вдалося отримати дані користувача');
        }
        user = await userResponse.json();

        if (!user.cart || user.cart.length === 0) {
            cartContainer.innerHTML = '<p>Ваш кошик порожній.</p>';
            return;
        }

        const productsResponse = await fetch('/data/products.json');
        if (!productsResponse.ok) {
            throw new Error('Не вдалося отримати дані про товари');
        }
        const products = await productsResponse.json();

        const cartProducts = user.cart
            .filter((cartItem) => cartItem && cartItem.id && cartItem.quantity)
            .map((cartItem) => {
                const product = products.find((p) => p.id === cartItem.id);
                if (!product) {
                    console.error(`Продукт із ID ${cartItem.id} не знайдено.`);
                    return null;
                }
                return { ...product, quantity: cartItem.quantity };
            })
            .filter(Boolean);

        cartProducts.forEach((product) => {
            const productElement = document.createElement('div');
            productElement.classList.add('product-item');
            productElement.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-details">
                    <h3>${product.name}</h3>
                    <p>Ціна: ${product.price}</p>
                    <p>Кількість: ${product.quantity}</p>
                    <p>Артикул: ${product.sku}</p>
                    <button class="increase-btn" data-product-id="${product.id}">+</button>
                    <button class="decrease-btn" data-product-id="${product.id}">-</button>
                    <button class="remove-btn" data-product-id="${product.id}">Видалити</button>
                </div>
            `;
            cartContainer.appendChild(productElement);
        });

        cartContainer.addEventListener('click', async (event) => {
            const productId = event.target.dataset.productId;

            if (event.target.classList.contains('increase-btn')) {
                await updateCartQuantity(productId, 1);
            } else if (event.target.classList.contains('decrease-btn')) {
                await updateCartQuantity(productId, -1);
            } else if (event.target.classList.contains('remove-btn')) {
                await removeFromCart(productId);
            }
        });

        async function updateCartQuantity(productId, change) {
            try {
                const response = await fetch(`/api/users/${currentUser.username}/cart`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId, change }),
                });

                if (response.ok) {
                    location.reload();
                } else {
                    throw new Error('Не вдалося оновити кількість товару');
                }
            } catch (err) {
                console.error('Помилка при оновленні кількості товару:', err);
            }
        }

        async function removeFromCart(productId) {
            try {
                const response = await fetch(`/api/users/${currentUser.username}/cart/${productId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.ok) {
                    alert('Товар видалено з кошика!');
                    location.reload();
                } else {
                    const error = await response.json();
                    console.error('Помилка при видаленні товару з кошика:', error.error);
                    alert('Не вдалося видалити товар з кошика.');
                }
            } catch (err) {
                console.error('Помилка при видаленні товару з кошика:', err);
            }
        }
    } catch (err) {
        console.error('Помилка при завантаженні кошика:', err);
        cartContainer.innerHTML = '<p>Не вдалося завантажити кошик.</p>';
    }

    const orderForm = document.querySelector('#order-form');

    orderForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const fullName = document.querySelector('#fullName').value;
        const phone = document.querySelector('#phone').value;
        const address = document.querySelector('#address').value;

        const order = {
            fullName,
            phone,
            address,
            items: user.cart,
            date: new Date().toISOString(),
        };

        try {
            const response = await fetch(`/api/users/${currentUser.username}/orderHistory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order),
            });

            if (response.ok) {
                await fetch(`/api/users/${currentUser.username}/cart`, { method: 'DELETE' });
                alert('Замовлення успішно оформлено!');
                location.reload();
            } else {
                throw new Error('Не вдалося оформити замовлення');
            }
        } catch (err) {
            console.error('Помилка при оформленні замовлення:', err);
            alert('Не вдалося оформити замовлення. Спробуйте пізніше.');
        }
    });
});
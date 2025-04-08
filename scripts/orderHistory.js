document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Ви повинні увійти в систему, щоб переглянути цю сторінку!');
        window.location.href = '/auth.html';
        return;
    }

    const orderHistoryContainer = document.querySelector('#order-history-container');

    try {
        const userResponse = await fetch(`/api/users/${currentUser.username}`);
        if (!userResponse.ok) {
            throw new Error('Не вдалося отримати дані користувача');
        }
        const user = await userResponse.json();

        if (!user.orderHistory || user.orderHistory.length === 0) {
            orderHistoryContainer.innerHTML = '<p>У вас немає замовлень.</p>';
            return;
        }
        orderHistoryContainer.innerHTML = '';
        user.orderHistory.forEach((order) => {
            const orderElement = document.createElement('div');
            orderElement.classList.add('order-item');
            orderElement.innerHTML = `
                <h3>Замовлення від ${new Date(order.date).toLocaleString()}</h3>
                <p><strong>Ім'я:</strong> ${order.fullName}</p>
                <p><strong>Телефон:</strong> ${order.phone}</p>
                <p><strong>Адреса:</strong> ${order.address}</p>
                <h4>Товари:</h4>
                <ul>
                    ${order.items.map(item => `
                        <li>
                            <strong>ID:</strong> ${item.id}, 
                            <strong>Кількість:</strong> ${item.quantity}
                        </li>
                    `).join('')}
                </ul>
            `;
            orderHistoryContainer.appendChild(orderElement);
        });
    } catch (err) {
        console.error('Помилка при завантаженні історії замовлень:', err);
        orderHistoryContainer.innerHTML = '<p>Не вдалося завантажити історію замовлень.</p>';
    }
});
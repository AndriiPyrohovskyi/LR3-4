document.addEventListener('DOMContentLoaded', () => {
    // Реєстрація
    const registerForm = document.querySelector('#register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = registerForm.querySelector('input[placeholder="username"]').value;
            const password = registerForm.querySelector('input[placeholder="password"]').value;
            const confirmPassword = registerForm.querySelector('input[placeholder="confirm password"]').value;

            if (password !== confirmPassword) {
                alert('Паролі не збігаються!');
                return;
            }

            try {
                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, cart: [], favorites: [], orderHistory: [] }),
                });

                if (response.ok) {
                    alert('Реєстрація успішна!');
                    window.location.href = '/auth.html';
                } else {
                    const error = await response.json();
                    alert(error.error);
                }
            } catch (err) {
                console.error('Помилка при реєстрації:', err);
                alert('Не вдалося зареєструвати користувача. Спробуйте пізніше.');
            }
        });
    } else {
        console.error('Форма реєстрації не знайдена!');
    }

    // Логін
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
                    sessionStorage.setItem('currentUser', JSON.stringify(user));
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
        console.error('Форма логіну не знайдена!');
    }
});
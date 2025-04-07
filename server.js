const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8000;

const usersFilePath = path.join(__dirname, 'data', 'users.json');

app.use(express.json());
app.use('/data', express.static(path.join(__dirname, 'data')));
app.use(express.static(path.join(__dirname)));

app.use('/components', express.static(path.join(__dirname, 'components')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

app.get('/api/users', (req, res) => {
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Не вдалося прочитати файл' });
        }
        res.json(JSON.parse(data));
    });
});

app.get('/api/users/:username', (req, res) => {
    const { username } = req.params;

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Не вдалося прочитати файл' });
        }

        const users = JSON.parse(data);
        const user = users.find((u) => u.username === username);

        if (!user) {
            return res.status(404).json({ error: 'Користувача не знайдено' });
        }

        res.json(user);
    });
});

app.post('/api/users', (req, res) => {
    const newUser = req.body;

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Не вдалося прочитати файл' });
        }

        const users = JSON.parse(data);
        if (users.some((u) => u.username === newUser.username)) {
            return res.status(400).json({ error: 'Користувач із таким іменем вже існує' });
        }

        users.push(newUser);

        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Не вдалося записати файл' });
            }
            res.status(201).json(newUser);
        });
    });
});

// Оновити кошик користувача
app.post('/api/users/:username/cart', (req, res) => {
    const { username } = req.params;
    const { productId, quantity } = req.body; // Додаємо quantity

    // Валідація перед додаванням до кошика
    if (!productId || typeof productId !== 'string' || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ error: 'Некоректні дані для товару' });
    }

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Не вдалося прочитати файл' });
        }

        const users = JSON.parse(data);
        const user = users.find((u) => u.username === username);

        if (!user) {
            return res.status(404).json({ error: 'Користувача не знайдено' });
        }

        // Перевіряємо, чи товар вже є в кошику
        const cartItem = user.cart.find((item) => item.id === productId);
        if (cartItem) {
            // Якщо товар вже є, збільшуємо кількість
            cartItem.quantity += quantity;
        } else {
            // Якщо товару немає, додаємо його
            user.cart.push({ id: productId, quantity });
        }

        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Не вдалося записати файл' });
            }
            res.status(200).json(user.cart);
        });
    });
});

// Оновити улюблені користувача
app.post('/api/users/:username/favorites', (req, res) => {
    const { username } = req.params;
    const { productId } = req.body;

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Не вдалося прочитати файл' });
        }

        const users = JSON.parse(data);
        const user = users.find((u) => u.username === username);

        if (!user) {
            return res.status(404).json({ error: 'Користувача не знайдено' });
        }

        if (!user.favorites.includes(productId)) {
            user.favorites.push(productId);
        }

        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Не вдалося записати файл' });
            }
            res.status(200).json(user.favorites);
        });
    });
});

// Додати замовлення в історію
app.post('/api/users/:username/orderHistory', (req, res) => {
    const { username } = req.params;
    const newOrder = req.body;

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Не вдалося прочитати файл' });
        }

        const users = JSON.parse(data);
        const user = users.find((u) => u.username === username);

        if (!user) {
            return res.status(404).json({ error: 'Користувача не знайдено' });
        }

        // Додаємо замовлення в історію
        user.orderHistory.push(newOrder);

        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Не вдалося записати файл' });
            }
            res.status(201).json({ message: 'Замовлення додано до історії' });
        });
    });
});

// Очистити кошик
app.delete('/api/users/:username/cart', (req, res) => {
    const { username } = req.params;

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Не вдалося прочитати файл' });
        }

        const users = JSON.parse(data);
        const user = users.find((u) => u.username === username);

        if (!user) {
            return res.status(404).json({ error: 'Користувача не знайдено' });
        }

        // Очищаємо кошик
        user.cart = [];

        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Не вдалося записати файл' });
            }
            res.status(200).json({ message: 'Кошик очищено' });
        });
    });
});

// Зміна кількості товару в кошику
app.patch('/api/users/:username/cart', (req, res) => {
    const { username } = req.params;
    const { productId, change } = req.body;

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Не вдалося прочитати файл' });
        }

        const users = JSON.parse(data);
        const user = users.find((u) => u.username === username);

        if (!user) {
            return res.status(404).json({ error: 'Користувача не знайдено' });
        }

        const cartItem = user.cart.find((item) => item.id === productId);
        if (!cartItem) {
            return res.status(404).json({ error: 'Товар не знайдено в кошику' });
        }

        // Оновлюємо кількість товару
        cartItem.quantity += change;
        if (cartItem.quantity < 1) {
            cartItem.quantity = 1; // Мінімальна кількість — 1
        }

        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Не вдалося записати файл' });
            }
            res.status(200).json({ message: 'Кількість товару оновлено', cart: user.cart });
        });
    });
});

// Видалення товару з кошика
app.delete('/api/users/:username/cart/:productId', (req, res) => {
    const { username, productId } = req.params;

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Не вдалося прочитати файл' });
        }

        const users = JSON.parse(data);
        const user = users.find((u) => u.username === username);

        if (!user) {
            return res.status(404).json({ error: 'Користувача не знайдено' });
        }

        // Видаляємо товар з кошика
        const initialCartLength = user.cart.length;
        user.cart = user.cart.filter((item) => item.id !== productId);

        if (user.cart.length === initialCartLength) {
            return res.status(404).json({ error: 'Товар не знайдено в кошику' });
        }

        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Не вдалося записати файл' });
            }
            res.status(200).json({ message: 'Товар видалено з кошика', cart: user.cart });
        });
    });
});

app.delete('/api/users/:username/favorites/:productId', (req, res) => {
    const { username, productId } = req.params;

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Не вдалося прочитати файл' });
        }

        const users = JSON.parse(data);
        const user = users.find((u) => u.username === username);

        if (!user) {
            return res.status(404).json({ error: 'Користувача не знайдено' });
        }

        // Видаляємо товар з улюбленого
        const initialFavoritesLength = user.favorites.length;
        user.favorites = user.favorites.filter((id) => id !== productId);

        if (user.favorites.length === initialFavoritesLength) {
            return res.status(404).json({ error: 'Товар не знайдено в улюблених' });
        }

        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Не вдалося записати файл' });
            }
            res.status(200).json({ message: 'Товар видалено з улюблених', favorites: user.favorites });
        });
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});
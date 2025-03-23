document.addEventListener('DOMContentLoaded', () => {
    // Завантаження товарів (припустимо, з JSON-файлу)
    fetch('/data/products.json')
        .then(response => response.json())
        .then(products => {
            // Рандомізуємо товари
            const randomProducts = products.sort(() => Math.random() - 0.5);
            // Вставляємо товари у всі каруселі
            document.querySelectorAll('.carousel').forEach(carousel => {
                randomProducts.forEach(product => {
                    carousel.innerHTML += `
            <div class="carousel_item">
              <img src="${product.img}" alt="${product.alt}">
              <div class="tags">
                ${product.bestSeller ? '<span class="tag best-seller">Лідер продаж</span>' : ''}
                ${product.new ? '<span class="tag new">Новинка</span>' : ''}
              </div>
              <p class="sku">${product.sku}</p>
              <h3 class="product_name">${product.name}</h3>
              <p class="price">${product.price}</p>
            </div>`;
                });
            });
        });

    // Гортання каруселі за допомогою кнопок
    document.querySelectorAll('.carousel_btn a').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            const carousel = btn.closest('.carousel');
            const scrollDistance = 300;
            // Якщо кнопка зліва, прокручуємо вліво, інакше – вправо
            carousel.scrollBy({ left: btn.textContent.trim() === '❮' ? -scrollDistance : scrollDistance, behavior: 'smooth' });
        });
    });

    // Кнопка "Показати ще" для брендів
    const showMoreBtn = document.getElementById('show-more-brands');
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => {
            // Наприклад, показати приховані елементи брендів
            document.querySelectorAll('.brands_item.hidden').forEach(item => item.classList.remove('hidden'));
            showMoreBtn.style.display = 'none';
        });
    }

    // Оптимізація посилань (рути)
    const baseURL = window.location.origin;
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/')) {
            link.href = baseURL + href;
        }
    });
});
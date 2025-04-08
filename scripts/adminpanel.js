document.addEventListener('DOMContentLoaded', async () => {
    const productList = document.querySelector('#product-list');
    const addProductForm = document.querySelector('#add-product-form');

    async function fetchProducts() {
        const response = await fetch('/data/products.json');
        const products = await response.json();
        renderProducts(products);
    }

    function renderProducts(products) {
        productList.innerHTML = '';
        products.forEach((product) => {
            const productElement = document.createElement('div');
            productElement.classList.add('product-item');
            productElement.innerHTML = `
                <span>${product.name} (${product.sku}) - ${product.price} грн</span>
                <button class="delete-btn" data-id="${product.id}">Видалити</button>
            `;
            productList.appendChild(productElement);
        });

        document.querySelectorAll('.delete-btn').forEach((button) => {
            button.addEventListener('click', async (event) => {
                const productId = event.target.dataset.id;
                await deleteProduct(productId);
                fetchProducts();
            });
        });
    }

    async function deleteProduct(productId) {
        await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    }

    addProductForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.querySelector('#product-name').value;
        const sku = document.querySelector('#product-sku').value;
        const price = document.querySelector('#product-price').value;
        const image = document.querySelector('#product-image').value;

        await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, sku, price, image }),
        });

        fetchProducts();
        addProductForm.reset();
    });

    fetchProducts();
});
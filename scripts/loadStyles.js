function loadStyles(styles) {
    styles.forEach((style) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = style;
        document.head.appendChild(link);
    });
}

const styles = [
    '/CSS/global_page_elements.css',
    '/CSS/header.css',
    '/CSS/footer.css',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
];

loadStyles(styles);
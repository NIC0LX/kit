
// ========================================
// NAVEGACIÓN ENTRE LAS VISTAS
// CASA NÓMADA
// ========================================

function switchView(viewId) {

    const views = document.querySelectorAll('.view-section');

    views.forEach(v => v.classList.remove('active'));

    const targetView = document.getElementById('view-' + viewId);

    if (targetView) {
        targetView.classList.add('active');

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        if (viewId === 'forum') {
            cargarPublicaciones();
        }
    }
}


// ========================================
// MENÚ RESPONSIVE PARA CELULARES
// ========================================

const menuButton = document.querySelector('.menu-button');
const navLinks = document.querySelector('.nav-links');

if (menuButton && navLinks) {

    menuButton.addEventListener('click', function() {

        navLinks.classList.toggle('show');

        const menuAbierto = navLinks.classList.contains('show');

        menuButton.textContent = menuAbierto ? '✕' : '☰';

        menuButton.setAttribute(
            'aria-expanded',
            menuAbierto
        );

        menuButton.setAttribute(
            'aria-label',
            menuAbierto ? 'Cerrar menú' : 'Abrir menú'
        );
    });


    // CERRAR MENÚ AL SELECCIONAR UNA OPCIÓN

    navLinks.querySelectorAll('a').forEach(link => {

        link.addEventListener('click', function() {

            navLinks.classList.remove('show');

            menuButton.textContent = '☰';

            menuButton.setAttribute('aria-expanded', 'false');

            menuButton.setAttribute('aria-label', 'Abrir menú');

        });

    });

}


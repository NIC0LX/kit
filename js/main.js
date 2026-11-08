
// ========================================
// NAVEGACIÓN ENTRE LAS VISTAS
// CASA NÓMADA
// ========================================

function switchView(viewId) {

    // Ocultar todas las vistas
    const views = document.querySelectorAll('.view-section');

    views.forEach(view => {
        view.classList.remove('active');
    });

    // Mostrar la vista seleccionada
    const targetView = document.getElementById('view-' + viewId);

    if (targetView) {

        targetView.classList.add('active');

        // Subir al inicio
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // Cargar publicaciones del foro
        if (viewId === 'forum' &&
            typeof cargarPublicaciones === 'function') {

            cargarPublicaciones();
        }

    } else {
        console.error('No se encontró la vista: view-' + viewId);
    }

    // Cerrar menú móvil al cambiar de sección
    const navLinks = document.querySelector('.nav-links');
    const menuButton = document.querySelector('.menu-button');

    if (navLinks) {
        navLinks.classList.remove('show');
    }

    if (menuButton) {
        menuButton.textContent = '☰';
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Abrir menú');
    }
}


// ========================================
// MENÚ RESPONSIVE PARA CELULARES
// ========================================

document.addEventListener('DOMContentLoaded', function() {

    const menuButton = document.querySelector('.menu-button');
    const navLinks = document.querySelector('.nav-links');

    if (menuButton && navLinks) {

        menuButton.addEventListener('click', function() {

            navLinks.classList.toggle('show');

            const menuAbierto = navLinks.classList.contains('show');

            menuButton.textContent = menuAbierto ? '✕' : '☰';

            menuButton.setAttribute(
                'aria-expanded',
                menuAbierto ? 'true' : 'false'
            );

            menuButton.setAttribute(
                'aria-label',
                menuAbierto ? 'Cerrar menú' : 'Abrir menú'
            );

        });

    }

});


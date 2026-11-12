
// ========================================
// CASA NÓMADA - FORO COMUNITARIO
// ========================================

// 1. CONEXIÓN CON SUPABASE

const SUPABASE_URL =
    'https://jctlrvwtbqcfdwrogups.supabase.co';

const SUPABASE_PUBLIC_KEY =
    'sb_publishable_DZCUCodvCBUNs5rXYqMJ7Q_mfO1t3jg';

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLIC_KEY
);

let usuarioActual = null;
let modoRegistro = true;


// ========================================
// 2. INICIAR EL FORO
// ========================================

document.addEventListener('DOMContentLoaded', async () => {

    // Detectar si alguien entra o sale
    supabaseClient.auth.onAuthStateChange(
        (_evento, sesion) => {
            mostrarSesion(sesion?.user ?? null);
        }
    );

    // Recuperar una sesión guardada
    const { data, error } =
        await supabaseClient.auth.getUser();

    if (error) {
        console.error('Error de sesión:', error);
    }

    mostrarSesion(data?.user ?? null);

    // Mostrar mensajes guardados
    await cargarPublicaciones();
});


// ========================================
// 3. CAMBIAR ENTRE REGISTRO E INGRESO
// ========================================

function cambiarModoAcceso() {

    modoRegistro = !modoRegistro;

    document.getElementById('nombre-grupo')
        .style.display = modoRegistro ? 'block' : 'none';

    document.getElementById('btn-registro')
        .style.display = modoRegistro ? 'block' : 'none';

    document.getElementById('btn-login')
        .style.display = modoRegistro ? 'none' : 'block';

    document.getElementById('auth-title')
        .textContent = modoRegistro
            ? 'Crea tu cuenta'
            : 'Bienvenida de nuevo';

    document.getElementById('auth-toggle')
        .textContent = modoRegistro
            ? '¿Ya tienes cuenta? Inicia sesión'
            : '¿No tienes cuenta? Regístrate';

    document.getElementById('password-input').value = '';

    document.getElementById('auth-message').textContent = '';
}


// ========================================
// 4. REGISTRAR UNA PERSONA
// ========================================

async function registrarUsuario() {

    const nombre = document.getElementById('username-input')
        .value.trim();

    const email = document.getElementById('email-input')
        .value.trim();

    const password = document.getElementById('password-input')
        .value;

    const boton = document.getElementById('btn-registro');

    if (nombre.length < 2 || nombre.length > 40) {
        alert('Escribe un apodo de 2 a 40 caracteres.');
        return;
    }

    if (!email.includes('@')) {
        alert('Escribe un correo electrónico válido.');
        return;
    }

    if (password.length < 8) {
        alert('Tu contraseña debe tener al menos 8 caracteres.');
        return;
    }

    boton.disabled = true;
    boton.textContent = 'Creando cuenta...';

    try {

        const { data, error } =
            await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        nombre: nombre
                    }
                }
            });

        if (error) throw error;

        document.getElementById('password-input').value = '';

        if (data.session) {

            mostrarSesion(data.user);

            alert('¡Bienvenida a Casa Nómada! Tu cuenta está lista.');

        } else {

            alert(
                'La cuenta fue solicitada, pero no se inició sesión. ' +
                'Revisa que Confirm email esté desactivado en Supabase.'
            );
        }

    } catch (error) {

        console.error('Error al registrar:', error);

        alert('No se pudo crear la cuenta: ' + error.message);

    } finally {

        boton.disabled = false;
        boton.textContent = 'Crear mi cuenta';
    }
}


// ========================================
// 5. INICIAR SESIÓN
// ========================================

async function iniciarSesion() {

    const email = document.getElementById('email-input')
        .value.trim();

    const password = document.getElementById('password-input')
        .value;

    const boton = document.getElementById('btn-login');

    if (!email || !password) {
        alert('Escribe tu correo y contraseña.');
        return;
    }

    boton.disabled = true;
    boton.textContent = 'Entrando...';

    try {

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (error) throw error;

        document.getElementById('password-input').value = '';

        mostrarSesion(data.user);

        alert('¡Bienvenida nuevamente!');

    } catch (error) {

        console.error('Error al ingresar:', error);

        alert('No se pudo iniciar sesión: ' + error.message);

    } finally {

        boton.disabled = false;
        boton.textContent = 'Iniciar sesión';
    }
}


// ========================================
// 6. MOSTRAR LA SESIÓN
// ========================================

function mostrarSesion(user) {

    usuarioActual = user;

    const acceso = document.getElementById('auth-container');
    const publicar = document.getElementById('post-container');
    const nombre = document.getElementById('display-user');

    if (!acceso || !publicar || !nombre) return;

    if (user) {

        acceso.style.display = 'none';
        publicar.style.display = 'block';

        nombre.textContent =
            user.user_metadata?.nombre || 'Participante';

    } else {

        acceso.style.display = 'block';
        publicar.style.display = 'none';

        nombre.textContent = '';
    }
}


// ========================================
// 7. CERRAR SESIÓN
// ========================================

async function cerrarSesion() {

    try {

        const { error } = await supabaseClient.auth.signOut();

        if (error) throw error;

        mostrarSesion(null);

        document.getElementById('password-input').value = '';

        alert('Has cerrado sesión correctamente.');

    } catch (error) {

        console.error('Error al cerrar sesión:', error);

        alert('No fue posible cerrar sesión.');
    }
}


// ========================================
// 8. PUBLICAR UN MENSAJE
// ========================================

async function publicarMensaje() {

    const titulo = document.getElementById('post-title')
        .value.trim();

    const contenido = document.getElementById('post-content')
        .value.trim();

    if (!titulo || !contenido) {
        alert('Completa el título y el mensaje.');
        return;
    }

    if (titulo.length > 150 || contenido.length > 5000) {
        alert('El título o el mensaje es demasiado largo.');
        return;
    }

    const boton = document.querySelector(
        '#post-container .button-primary'
    );

    boton.disabled = true;
    boton.textContent = 'Publicando...';

    try {

        // Comprobar que la cuenta existe y tiene sesión
        const { data, error: errorUsuario } =
            await supabaseClient.auth.getUser();

        if (errorUsuario) throw errorUsuario;

        const user = data.user;

        if (!user) {
            throw new Error('Debes iniciar sesión.');
        }

        const nombre =
            user.user_metadata?.nombre || 'Participante';

        // Guardar en la base de datos
        const { error } = await supabaseClient
            .from('publicaciones')
            .insert({
                usuario_id: user.id,
                usuario: nombre,
                titulo: titulo,
                contenido: contenido
            });

        if (error) throw error;

        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';

        alert('¡Tu publicación se guardó correctamente!');

        await cargarPublicaciones();

    } catch (error) {

        console.error('Error al publicar:', error);

        alert('No fue posible publicar: ' + error.message);

    } finally {

        boton.disabled = false;
        boton.textContent = 'Publicar en el Foro';
    }
}


// ========================================
// 9. CARGAR LOS MENSAJES GUARDADOS
// ========================================

async function cargarPublicaciones() {

    const feed = document.getElementById('posts-feed');

    if (!feed) return;

    feed.textContent = 'Cargando conversaciones...';

    try {

        const { data, error } = await supabaseClient
            .from('publicaciones')
            .select('id, usuario, titulo, contenido, creado_en')
            .order('creado_en', { ascending: false })
            .limit(100);

        if (error) throw error;

        feed.replaceChildren();

        if (!data || data.length === 0) {

            feed.textContent =
                'Todavía no hay publicaciones. ¡Inicia una conversación!';

            return;
        }

        data.forEach(post => {

            const tarjeta = document.createElement('article');
            tarjeta.className = 'post-item';

            const autor = document.createElement('div');
            autor.className = 'post-author';
            autor.textContent = post.usuario || 'Participante';

            const titulo = document.createElement('h4');
            titulo.textContent = post.titulo;

            const mensaje = document.createElement('p');
            mensaje.textContent = post.contenido;

            tarjeta.appendChild(autor);
            tarjeta.appendChild(titulo);
            tarjeta.appendChild(mensaje);

            if (post.creado_en) {

                const fecha = document.createElement('small');

                fecha.textContent = new Date(
                    post.creado_en
                ).toLocaleDateString('es-CO');

                tarjeta.appendChild(fecha);
            }

            feed.appendChild(tarjeta);
        });

    } catch (error) {

        console.error('Error al cargar mensajes:', error);

        feed.textContent =
            'No fue posible cargar las publicaciones.';
    }
}

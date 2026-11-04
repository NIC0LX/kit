
// ========================================
// CASA NÓMADA - FORO COMUNITARIO
// ========================================

// Usuario que está utilizando el foro
let usuarioActual = "";


// ========================================
// 1. REGISTRAR USUARIO
// ========================================

function registrarUsuario() {

    const input = document.getElementById('username-input');
    const nombre = input.value.trim();

    if (nombre === "") {
        alert("Por favor ingresa un nombre o apodo para continuar.");
        return;
    }

    usuarioActual = nombre;

    document.getElementById('display-user').textContent = usuarioActual;

    document.getElementById('auth-container').style.display = 'none';

    document.getElementById('post-container').style.display = 'block';
}


// ========================================
// 2. CERRAR SESIÓN
// ========================================

function cerrarSesion() {

    usuarioActual = "";

    document.getElementById('username-input').value = "";

    document.getElementById('auth-container').style.display = 'block';

    document.getElementById('post-container').style.display = 'none';
}


// ========================================
// 3. PUBLICAR MENSAJE
// ========================================

async function publicarMensaje() {

    const titulo = document.getElementById('post-title').value.trim();

    const contenido = document.getElementById('post-content').value.trim();

    if (!usuarioActual) {
        alert("Primero debes ingresar al foro.");
        return;
    }

    if (titulo === "" || contenido === "") {
        alert("Completa el título y el mensaje.");
        return;
    }

    const boton = document.querySelector('#post-container .button-primary');

    boton.disabled = true;
    boton.textContent = "Publicando...";

    try {

        const { error } = await supabaseClient
            .from('publicaciones')
            .insert([
                {
                    usuario: usuarioActual,
                    titulo: titulo,
                    contenido: contenido
                }
            ]);

        if (error) {
            throw error;
        }

        document.getElementById('post-title').value = "";

        document.getElementById('post-content').value = "";

        alert("¡Tu publicación se guardó correctamente!");

        await cargarPublicaciones();

    } catch (error) {

        console.error("Error al publicar:", error);

        alert("No fue posible publicar. Intenta nuevamente.");

    } finally {

        boton.disabled = false;
        boton.textContent = "Publicar en el Foro";

    }
}


// ========================================
// 4. CARGAR PUBLICACIONES
// ========================================

async function cargarPublicaciones() {

    const feed = document.getElementById('posts-feed');

    if (!feed) return;

    feed.textContent = "Cargando conversaciones...";

    try {

        const { data, error } = await supabaseClient
            .from('publicaciones')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        feed.replaceChildren();

        if (!data || data.length === 0) {

            feed.textContent = "Todavía no hay publicaciones. ¡Anímate a iniciar una conversación!";

            return;
        }

        data.forEach(post => {

            const nuevoPost = document.createElement('div');

            nuevoPost.className = 'post-item';

            const autor = document.createElement('div');

            autor.className = 'post-author';

            autor.textContent = post.usuario;

            const encabezado = document.createElement('h4');

            encabezado.textContent = post.titulo;

            const mensaje = document.createElement('p');

            mensaje.textContent = post.contenido;

            nuevoPost.appendChild(autor);

            nuevoPost.appendChild(encabezado);

            nuevoPost.appendChild(mensaje);

            feed.appendChild(nuevoPost);

        });

    } catch (error) {

        console.error("Error al cargar publicaciones:", error);

        feed.textContent = "No fue posible cargar las conversaciones.";

    }
}


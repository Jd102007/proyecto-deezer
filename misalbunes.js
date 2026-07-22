function eraseCookie(nombre) {   
    document.cookie = nombre + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function getCookie(nombre) {
    const nombreEQ = nombre + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nombreEQ) === 0) return decodeURIComponent(c.substring(nombreEQ.length, c.length));
    }
    return null;
}


function obtenerFavoritos() {
    const guardados = localStorage.getItem('mis_albumes_favoritos');
    if (guardados) {
        return JSON.parse(guardados);
    } else {
        
        localStorage.setItem('mis_albumes_favoritos', JSON.stringify(albumesFavoritosMock));
        return albumesFavoritosMock;
    }
}


function renderizarColeccion(listaAlbumes) {
    const contenedor = document.getElementById('contenedor-favoritos');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';

    if (listaAlbumes.length === 0) {
        contenedor.innerHTML = '<p>No hay álbumes con esa calificación.</p>';
        return;
    }

    listaAlbumes.forEach(album => {
        const card = document.createElement('div');
        card.className = 'album-card';
        card.innerHTML = `
            <img src="${album.portada}" alt="${album.titulo}" style="width: 100px; height: 100px;">
            <h4>${album.titulo}</h4>
            <p>${album.artista}</p>
            <div class="rating-stars" data-id="${album.id}">
            </div>
        `;
        contenedor.appendChild(card);
    });
}

function filtrarPorCalificacion(estrellas) {
    const todos = obtenerFavoritos();
    if (estrellas === 'todos') {
        renderizarColeccion(todos);
    } else {
        const filtrados = todos.filter(album => album.rating === parseInt(estrellas));
        renderizarColeccion(filtrados);
    }
}


document.addEventListener('DOMContentLoaded', () => {

    const token = getCookie('session_token');
    if (!token) {
        console.warn("Acceso no autorizado. Redirigiendo a inicio...");
        window.location.href = "inicioDeezer.html";
    }

    renderizarColeccion(obtenerFavoritos());

    document.getElementById('filtro-rating')?.addEventListener('change', (e) => {
        filtrarPorCalificacion(e.target.value);
    });

    document.getElementById('cerrar')?.addEventListener('click', () => {
        eraseCookie('session_token');
        eraseCookie('usuario_activo');
        window.location.href = 'inicioDeezer.html';
    });
});
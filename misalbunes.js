function eraseCookie(nombre) {
    document.cookie = nombre + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function getCookie(nombre) {
    const nombreEQ = nombre + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
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
        return [];
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
        
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            starsHtml += `<span class="star ${i <= (album.rating || 0) ? 'active' : ''}" data-value="${i}">★</span>`;
        }

        card.innerHTML = `
            <img src="${album.portada}" alt="${album.titulo}" style="width: 100px; height: 100px;">
            <h4>${album.titulo}</h4>
            <p>${album.artista}</p>
            <div class="rating-stars" data-id="${album.id}">
                ${starsHtml}
            </div>
        `;
        
        const starsContainer = card.querySelector('.rating-stars');
        starsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('star')) {
                const newRating = parseInt(e.target.dataset.value);
                guardarCalificacion(album.id, newRating);
                
                // Actualizar la vista dependiendo de si hay un filtro activo
                const filtroActual = document.getElementById('filtro-rating')?.value || 'todos';
                filtrarPorCalificacion(filtroActual);
            }
        });

        contenedor.appendChild(card);
    });
}

function guardarCalificacion(albumId, rating) {
    let favoritos = obtenerFavoritos();
    let index = favoritos.findIndex(a => a.id === String(albumId));
    if (index !== -1) {
        favoritos[index].rating = rating;
        localStorage.setItem('mis_albumes_favoritos', JSON.stringify(favoritos));
    }
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
    let oscuroRecuperado = localStorage.getItem('modo-dark');
    let oscuroConstante = oscuroRecuperado ? JSON.parse(oscuroRecuperado) : 0;
    const elOscuro = document.getElementById('darkSkin');
    if (oscuroConstante === 1) {
        document.body.classList.add("dark-mode");
    }

    renderizarColeccion(obtenerFavoritos());

    document.getElementById('filtro-rating')?.addEventListener('change', (e) => {
        filtrarPorCalificacion(e.target.value);
    });

    document.getElementById('Cerrar')?.addEventListener('click', () => {
        eraseCookie('session_token');
        eraseCookie('usuario_activo');
        window.location.href = 'inicioDeezer.html';
    });
});
const elOscuro = document.getElementById('darkSkin');
elOscuro.addEventListener("click", (e) => {
    e.preventDefault();

    document.body.classList.toggle("dark-mode");
    oscuroConstante = document.body.classList.contains("dark-mode") ? 1 : 0;
    localStorage.setItem('modo-dark', JSON.stringify(oscuroConstante));

    console.log("¿Modo oscuro activo?:", document.body.classList.contains("dark-mode"));
});
// Función auxiliar para hacer peticiones JSONP a la API de Deezer y evitar problemas de CORS
function fetchDeezer(url) {
    return new Promise((resolve, reject) => {
        const callbackName = 'deezer_cb_' + Math.round(100000 * Math.random());
        
        const timeoutId = setTimeout(() => {
            delete window[callbackName];
            if (script.parentNode) script.parentNode.removeChild(script);
            reject(new Error("Tiempo de espera agotado al conectar con Deezer."));
        }, 8000); // 8 segundos de timeout maximo

        window[callbackName] = function(data) {
            clearTimeout(timeoutId);
            delete window[callbackName];
            if (script.parentNode) script.parentNode.removeChild(script);
            resolve(data);
        };
        
        const script = document.createElement('script');
        const sep = url.includes('?') ? '&' : '?';
        script.src = url + sep + 'output=jsonp&callback=' + callbackName;
        script.onerror = () => {
            clearTimeout(timeoutId);
            reject(new Error("Error de red al conectar con Deezer."));
        };
        document.body.appendChild(script);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const formBuscador = document.getElementById('form-buscador');
    const inputBusqueda = document.getElementById('input-busqueda');
    const btnBuscar = document.getElementById('btn-buscar');
    const spinner = document.getElementById('spinner-busqueda');
    const mensajeEstado = document.getElementById('mensaje-estado');
    const resultadosGrid = document.getElementById('resultados-busqueda');
    
    const detalleArtista = document.getElementById('detalle-artista');
    const infoArtista = document.getElementById('info-artista');
    const albumesArtista = document.getElementById('albumes-artista');
    const btnVolver = document.getElementById('btn-volver');

    const reproductorContenedor = document.getElementById('reproductor-contenedor');
    const audioPlayer = document.getElementById('reproductor-audio');
    const repImg = document.getElementById('reproductor-img');
    const repTitulo = document.getElementById('reproductor-titulo');
    const repArtista = document.getElementById('reproductor-artista');
    const btnCerrarReproductor = document.getElementById('btn-cerrar-reproductor');

    // 1. Buscador dinámico
    formBuscador.addEventListener('submit', async (e) => {
        e.preventDefault();

    if (!navigator.onLine) {
        mostrarMensaje("Sin conexión a Internet. No se pueden realizar búsquedas en tiempo real.");
        return;
    }



        const query = inputBusqueda.value.trim();
        if (!query) return;

        // Limpiar estado
        resultadosGrid.innerHTML = '';
        resultadosGrid.classList.remove('hidden');
        detalleArtista.classList.add('hidden');
        mensajeEstado.classList.add('hidden');
        spinner.classList.remove('hidden');
        btnBuscar.disabled = true;

        try {
            const res = await fetchDeezer(`https://api.deezer.com/search/artist?q=${encodeURIComponent(query)}`);
            
            if (res.error) {
                mostrarMensaje("Error de la API de Deezer: " + res.error.message);
                return;
            }

            if (!res.data || res.data.length === 0) {
                mostrarMensaje("No se encontraron resultados para: " + query);
                return;
            }

            renderizarArtistas(res.data);
        } catch (error) {
            mostrarMensaje("Hubo un error de conexión al buscar.");
        } finally {
            spinner.classList.add('hidden');
            btnBuscar.disabled = false;
        }
    });

    function mostrarMensaje(msj) {
        mensajeEstado.textContent = msj;
        mensajeEstado.classList.remove('hidden');
    }

    // 2. Renderizar artistas (Resultados)
    function renderizarArtistas(artistas) {
        resultadosGrid.innerHTML = '';
        artistas.forEach(artista => {
            const card = document.createElement('div');
            card.className = 'artist-card';
            card.setAttribute('tabindex','0')
            card.setAttribute('role','button')
            card.innerHTML = `
                <img src="${artista.picture_medium || 'https://via.placeholder.com/150'}" alt="${artista.name}">
                <h4>${artista.name}</h4>
            `;
            card.addEventListener('click', () => cargarDetalleArtista(artista));
            card.addEventListener('keypress',(e)=>{
                if(e.key==='Enter'||e.key===' '){
                    e.preventDefault()
                    cargarDetalleArtista(artista)
                }
            })
            resultadosGrid.appendChild(card);
        });
    }

    // 3. Cargar Detalle de Artista (Álbumes)
    async function cargarDetalleArtista(artista) {
        resultadosGrid.classList.add('hidden');
        detalleArtista.classList.remove('hidden');
        albumesArtista.innerHTML = '';
        infoArtista.innerHTML = `
            <img src="${artista.picture_medium || 'https://via.placeholder.com/150'}" alt="${artista.name}">
            <h2>${artista.name}</h2>
        `;
        
        spinner.classList.remove('hidden');
        try {
            const res = await fetchDeezer(`https://api.deezer.com/artist/${artista.id}/albums`);
            if (res.data && res.data.length > 0) {
                renderizarAlbumes(res.data, artista.name);
            } else {
                albumesArtista.innerHTML = '<p>Este artista no tiene álbumes disponibles.</p>';
            }
        } catch (error) {
            albumesArtista.innerHTML = '<p>Error al cargar los álbumes.</p>';
        } finally {
            spinner.classList.add('hidden');
        }
    }

    // Volver a resultados
    btnVolver.addEventListener('click', () => {
        detalleArtista.classList.add('hidden');
        resultadosGrid.classList.remove('hidden');
    });

    // Renderizar álbumes
    function renderizarAlbumes(albumes, artistName) {
        albumesArtista.innerHTML = '';
        albumes.forEach(album => {
            const item = document.createElement('div');
            item.className = 'album-item';
            
            const header = document.createElement('div');
            header.className = 'album-header';
            header.setAttribute('tabindex','0')
            header.setAttribute('role','button')
            header.innerHTML = `
                <img src="${album.cover_medium || 'https://via.placeholder.com/150'}" alt="${album.title}">
                <div>
                    <h4>${album.title}</h4>
                    <p>${album.release_date || ''}</p>
                </div>
            `;
            
            const btnGuardar = document.createElement('button');
            btnGuardar.className = 'btn-guardar';
            btnGuardar.textContent = 'Guardar';
            
            let favoritos = JSON.parse(localStorage.getItem('mis_albumes_favoritos')) || [];
            if(favoritos.some(fav => fav.id === String(album.id))) {
                btnGuardar.textContent = 'Guardado';
                btnGuardar.disabled = true;
            }
            
            btnGuardar.addEventListener('click', (e) => {
                e.stopPropagation(); // Evitar que se abra la lista de canciones
                
                let favs = JSON.parse(localStorage.getItem('mis_albumes_favoritos')) || [];
                if(!favs.some(fav => fav.id === String(album.id))) {
                    favs.push({
                        id: String(album.id),
                        titulo: album.title,
                        artista: artistName,
                        portada: album.cover_medium,
                        rating: 0 // Inicia sin calificación
                    });
                    localStorage.setItem('mis_albumes_favoritos', JSON.stringify(favs));
                    btnGuardar.textContent = 'Guardado';
                    btnGuardar.disabled = true;
                    
                    // Actualizar el sidebar lateral inmediatamente si la función existe
                    if (typeof renderizarColeccion === 'function' && typeof obtenerFavoritos === 'function') {
                        renderizarColeccion(obtenerFavoritos());
                    }
                }
            });

            header.appendChild(btnGuardar);
            
            const trackListContainer = document.createElement('div');
            trackListContainer.className = 'track-list hidden';
            


const alternarAlbum = async () => {
    if (trackListContainer.classList.contains('hidden')) {
        trackListContainer.classList.remove('hidden');
        if (trackListContainer.innerHTML === '') {
            trackListContainer.innerHTML = '<i>Cargando pistas...</i>';
            try {
                const res = await fetchDeezer(`https://api.deezer.com/album/${album.id}/tracks`);
                if (res.data) {
                    renderizarTracks(res.data, trackListContainer, album, artistName);
                } else {
                    trackListContainer.innerHTML = '<p>No hay pistas.</p>';
                }
            } catch (error) {
                trackListContainer.innerHTML = '<p>Error al cargar pistas.</p>';
            }
        }
    } else {
        trackListContainer.classList.add('hidden');
    }
};

header.addEventListener('click', alternarAlbum);
header.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        alternarAlbum();
    }
});

            item.appendChild(header);
            item.appendChild(trackListContainer);
            albumesArtista.appendChild(item);
        });
    }

    // Renderizar pistas (Tracks) de un álbum
    function renderizarTracks(tracks, container, album, artistName) {
        container.innerHTML = '';
        tracks.forEach((track, index) => {
            const trackEl = document.createElement('div');
            trackEl.className = 'track-item';
            trackEl.innerHTML = `
                <span>${index + 1}. ${track.title}</span>
                <button class="btn-play">▶</button>
            `;
            
            // Reproducir canción
            const btnPlay = trackEl.querySelector('.btn-play');
            btnPlay.addEventListener('click', (e) => {
                e.stopPropagation(); // Evitar que el álbum se cierre
                if(track.preview) {
                    reproducir(track, album, artistName);
                } else {
                    alert("Deezer no provee un preview para esta canción.");
                }
            });

            container.appendChild(trackEl);
        });
    }

    // 4. Reproductor Integrado
    function reproducir(track, album, artistName) {
        repImg.src = album.cover_medium || 'https://via.placeholder.com/50';
        repTitulo.textContent = track.title;
        repArtista.textContent = artistName;
        audioPlayer.src = track.preview;
        audioPlayer.play();
        reproductorContenedor.classList.remove('hidden');
    }

    btnCerrarReproductor.addEventListener('click', () => {
        audioPlayer.pause();
        audioPlayer.src = "";
        reproductorContenedor.classList.add('hidden');
    });

});

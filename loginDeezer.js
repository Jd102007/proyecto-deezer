function setCookie(nombre, valor, dias) {
    let expira = "";
    if (dias) {
        const fecha = new Date();
        fecha.setTime(fecha.getTime() + (dias * 24 * 60 * 60 * 1000));
        expira = "; expires=" + fecha.toUTCString();
    }
    document.cookie = nombre + "=" + (encodeURIComponent(valor) || "") + expira + "; path=/; SameSite=Lax";
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

document.addEventListener('DOMContentLoaded', () => {
    const token = getCookie('session_token');
    
    
    if (token) {
        console.log("Sesión activa detectada. Redirigiendo...");
        window.location.href = "albunes.html";
    }
});

let oscuroRecuperado = localStorage.getItem('modo-dark');
let oscuroConstante = oscuroRecuperado ? JSON.parse(oscuroRecuperado) : 0;

const spinner = document.getElementById('spinner');
const elOscuro = document.getElementById('darkSkin');
const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));


if (oscuroConstante === 1) {
    document.body.classList.add("dark-mode");
}


document.getElementById("form-login").addEventListener('submit', async (e) => {
    e.preventDefault();

    const inputUsuario = document.getElementById("usuario").value;
    const inputPassword = document.getElementById("password").value;

    spinner.classList.remove('hidden');
    document.getElementById("btn-ingresar").disabled = true;

    try {
        await esperar(2000); 

        
        const tokenSimulado = "authToken_" + btoa(inputUsuario + ":" + Date.now());

        
        setCookie('session_token', tokenSimulado, 1);
        setCookie('usuario_activo', inputUsuario, 1);

        console.log("¡Sesión iniciada! Token guardado:", getCookie('session_token'));

    } catch (error) {
        console.error("Error durante el login:", error);
    } finally {
        spinner.classList.add('hidden');
        document.getElementById("btn-ingresar").disabled = false;
        window.location.href = "albunes.html";
        
    }
    
    
});


elOscuro.addEventListener("click", (e) => {
    e.preventDefault();

    document.body.classList.toggle("dark-mode");
    oscuroConstante = document.body.classList.contains("dark-mode") ? 1 : 0;
    localStorage.setItem('modo-dark', JSON.stringify(oscuroConstante));

    console.log("¿Modo oscuro activo?:", document.body.classList.contains("dark-mode"));
});
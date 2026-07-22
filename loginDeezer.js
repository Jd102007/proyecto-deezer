let datosRecuperados = localStorage.getItem('usuariosRegistrados');
let listaUsuarios = datosRecuperados ? JSON.parse(datosRecuperados) : [];
let oscuroRecuperado= localStorage.getItem('modo-dark');
let oscuroConstante= oscuroRecuperado? JSON.parse(oscuroRecuperado) : null;
const spinner = document.getElementById('spinner');

const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));


const elOscuro= document.getElementById('darkSkin');

if (oscuroConstante=== null) {
    oscuroConstante= 0;
}

if (oscuroConstante=== 1){
    document.body.classList.toggle("dark-mode");
    const estaEnDark = document.body.classList.contains("dark-mode");
    console.log("¿Modo oscuro activo?:", estaEnDark);
}

document.getElementById("btn-ingresar").addEventListener('click', (e) => {
    e.preventDefault();

    let userIngresado = document.querySelector('input[type="text"]').value;
    let contraseñaIngresada = document.querySelector('input[type="password"]').value;


    let cuentaEncontrada = listaUsuarios.find(cuenta =>
        cuenta.nombre === userIngresado && cuenta.contraseña === contraseñaIngresada
    );

    if (cuentaEncontrada) {
        localStorage.setItem('cuentaActiva', JSON.stringify(cuentaEncontrada));
        console.log(listaUsuarios);
        
    } else {
        alert("Usuario o contraseña incorrectos");
    }
});
document.getElementById("btn-registro").addEventListener('click', async (e) => {
    e.preventDefault();

    spinner.classList.remove('hidden');
    document.getElementById("btn-registro").disabled = true;
    try{
    
        await esperar(2000);
        class cuenta {
        constructor(nombre, contraseña, oscuro) {
            this.nombre = nombre;
            this.contraseña = contraseña;
            this.oscuro = oscuro;
            
        }
        }
        const inputUsuario = document.getElementById("usuario");
        const inputContraseña = document.getElementById("password");
        const inputCedula = document.getElementById("CI");
        const inputTlf = document.getElementById("telefono");

        document.querySelector('#form-preguntas button').addEventListener('click', (e) => { 
            e.preventDefault();

            let usuarioExtraido = inputUsuario.value;
            let contraseñaExtraida = inputContraseña.value;
        
            let user = new cuenta(
                usuarioExtraido, 
                contraseñaExtraida,  
                0 
                
            );

            listaUsuarios.push(user);
            localStorage.setItem('usuariosRegistrados', JSON.stringify(listaUsuarios));
        
        
        
    })
}finally{
    spinner.classList.add('hidden');
        document.getElementById("btn-registro").disabled = false;
        alert(`¡Registro exitoso!\n`);
}
});

elOscuro.addEventListener("click", (e) => {
    e.preventDefault();

    document.body.classList.toggle("dark-mode");
    if(oscuroConstante===0){
        oscuroConstante=1;
    }
    else{
        oscuroConstante=0;
    }
    localStorage.setItem('modo-dark', JSON.stringify(oscuroConstante));

    const estaEnDark = document.body.classList.contains("dark-mode");
    console.log("¿Modo oscuro activo?:", estaEnDark);
});
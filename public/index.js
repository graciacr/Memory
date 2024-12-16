document.addEventListener("DOMContentLoaded", function() {
    let btn = document.getElementById("btn");
    btn.addEventListener("click", userInfo);
});

function userInfo() {
    // Coger elementos del server
    let serverInput = document.getElementById("server");
    // let parent = serverInput.closest(".entryarea");
    // let labelText = serverParent.querySelector(".labelline")?.textContent.trim();
    // Coger elementos del puerto
    let portInput = document.getElementById("port");
    //Coger elementos del nombre
    let nameInput = document.getElementById("name");

    String.prototype.isAlpha = function() {
        return /^[a-zA-Z]+$/.test(this);
    };
    

    if (serverInput.value.trim().toLowerCase() !== "localhost") {
        Swal.fire({
            title: "Oops...",
            heightAuto: false,
            text: 'Por favor, asegúrate de que el servidor sea localhost. Este sistema está diseñado para ejecutarse exclusivamente en un entorno local.',
            icon: 'error',
            button: '',
            customClass: {
                container: 'swal-custom-container'
            }
        });
    } else if (portInput.value.trim() !== "8888") {
        Swal.fire({
            title: "Oops...",
            heightAuto: false,
            text: 'Parece que has ingresado un puerto no válido. Por favor, asegúrate de usar el puerto 8888 para acceder correctamente.',
            icon: 'error',
            button: '',
            customClass: {
                container: 'swal-custom-container'
            }
        });
    } else if (!/^[a-zA-Z]+$/.test(nameInput.value.trim())) {
        Swal.fire({
            title: "Oops...",
            heightAuto: false,
            text: 'Parece que has ingresado un nombre no válido. Por favor, asegúrate de que el nombre contenga solo letras.',
            icon: 'error',
            button: '',
            customClass: {
                container: 'swal-custom-container'
            }
        });
    } else {
        Swal.fire({
            title: "Correcto",
            heightAuto: false,
            text: 'Has puesto todos los datos correctamente, ahora se te llevará a la siguiente página donde deberás esperar hasta conectar para jugar contra otro usuario.',
            icon: 'success',
            button: '',
            customClass: {
                container: 'swal-custom-container'
            }
        });
    }
    // <!-- comentario para subirlo -->
}    
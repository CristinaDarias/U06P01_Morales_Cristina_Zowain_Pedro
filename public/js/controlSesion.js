//Botones
let btnRegistroEmail = document.getElementById('registroEmail');
let btnLoginEmail = document.getElementById('loginEmail');

//Rows
let formLogIn = document.getElementById('formularioLogIn');
let formLogUp = document.getElementById('formularioLogUp');

//Etiqueta
let errordbLogUp = document.getElementById('errordbLogUp');
let errordbLogIn = document.getElementById('errordbLogIn');
let labelErrorPass = document.getElementById('errorPass')

window.onload = inicializar();

function inicializar() {
    // Your web app's Firebase configuration
    var firebaseConfig = {
        apiKey: "AIzaSyAucMBZ1TfRw3HX6u6o5_Bib3FV51qvVu8",
        authDomain: "visualizandomapas.firebaseapp.com",
        databaseURL: "https://visualizandomapas.firebaseio.com",
        projectId: "visualizandomapas",
        storageBucket: "visualizandomapas.appspot.com",
        messagingSenderId: "485414984050",
        appId: "1:485414984050:web:feaeef6e3e1125c09fa5eb",
        measurementId: "G-69ZY16K34G"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
}

//LogIn y Log Up
function logIn() {
    formLogIn.setAttribute('class', 'border p-2 bg-white text-dark');
    formLogUp.setAttribute('class', 'border p-2 bg-white text-dark d-none');
}
function logUp() {
    formLogIn.setAttribute('class', 'border p-2 bg-white text-dark d-none');
    formLogUp.setAttribute('class', 'border p-2 bg-white text-dark');
}

//Registro de usuarios y logeo por Email
function registroEmail() {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let verificacionPassword = document.getElementById('passwordRepetida').value;
    if (password == verificacionPassword) {
        firebase.auth().createUserWithEmailAndPassword(email, password).then(function () {
            window.location.href = '/mapa.html';
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            errordbLogUp.innerHTML = errorCode + ': ' + errorMessage;
        });
    } else
        labelErrorPass.innerHTML = 'Las contraseñas no coinciden';

}
function logInEmail() {
    let userEmail = document.getElementById('email_field').value;
    let userPass = document.getElementById('password_field').value;
    firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        errordbLogIn.innerHTML = errorCode + ': ' + errorMessage;
    });

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            window.location.href = '/mapa.html';
        }
    });
}
function logOut() {
    firebase.auth().signOut().then(function () {
        window.location.href = '/index.html';
    }).catch(function (error) {
        alert('imposible');
    });
}
if (btnLoginEmail)
    btnLoginEmail.addEventListener('click', logInEmail, true);
if (btnRegistroEmail)
    btnRegistroEmail.addEventListener('click', registroEmail, true);

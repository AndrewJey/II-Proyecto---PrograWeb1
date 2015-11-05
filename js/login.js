function prepareBinding() {

    $("#ok").click(function() {
        if (validar()) {
         window.close();
         window.open("DashDoard.html");
         close();
     }
 });
}
function validar(){
    var pass = $('.pass').val();
    var user = $('.user').val();
    var usuarios = JSON.parse(localStorage.getItem('usuarios'));
    for (var i = 0; i < usuarios.length; i++) {
        if ((usuarios[i].contrasena == pass) && (usuarios[i].nombreUsuario == user)) {
            return true;
        }
    }
    if (pass == "12345" && user == "admin") {
        return true;
    }else{
        return false;
    }
    return false;
}
var Select;
var imagen = "";
var title = "";
var nuevaCarrera = true;
var nuevoUsuario = true;
var nuevoEstudiante = true;

function prepareBinding() {
    UpdateStudent();
    UpdateCareer();
    UpdateUser();
    //el table-hover es el "metodo" para la sombrita
    $('.table-hover tr').click(function() {
        Select = $(this).data("rowKey");
        seleccionar();
    });
    $("#search2").click(function(){
        if (Select != null) {
            popupVer(1);
        }
    });
    $("#edit2").click(function(){
        if (Select != null) {
            buttonEditCarrer();
        }
    });
    $("#add2").click(function(){
        buttonAddCarrer();
    });
    $("#delete2").click(function(){
        if (Select != null) {
            popup(1);
        }
    });

    $("#edit1").click(function(){
        if (Select != null) {
            buttonEditUser();
        }
    });
    $("#add1").click(function(){
        buttonAddUser();
    });
    $("#search1").click(function(){
        if (Select != null) {
            popupVer(2);
        }
    });
    $("#delete1").click(function(){
        if (Select != null) {
            popup(2);
        }
    });
    $("#search3").click(function(){
        if (Select != null) {
            popupVer(3);
        }
    });
    $("#edit3").click(function(){
        if (Select != null) {
            buttonEditStudent();
        }
    });
    $("#add3").click(function(){
        buttonAddStudent();
    });
    $("#delete3").click(function(){
        if (Select != null) {
            popup(3);
        }
    });
}
function my_alert(text) {
    alert(text);
}

function UpdateCareer(){
    var carreras = JSON.parse(localStorage.getItem('carreras'));
    var rows = "<table class='table table-hover careers step_wrapper'><tr disabled><th>Nombre</th><th>C&oacute;digo</th></tr>";
    if (carreras === null)
    {
        carreras = []
    };

    for(var i = 0; i< carreras.length; i++){
        rows += "<tr class='step_box' data-row-key="+i+"><td>"+carreras[i].nombreCarrera+"</td><td>"+carreras[i].codigoCareer+"</td></tr>" 
    };
    rows += "</table>";
    var buttoms ="<div id='buttoms2first'><button id='add2' type='button' class='btn btn-default'><span class='glyphicon glyphicon-plus-sign'></span></button><button id='edit2' type='button' class='btn btn-default'><span class='glyphicon glyphicon-pencil'></span></button><button id='delete2' type='button' class='btn btn-default'><span class='glyphicon glyphicon-minus-sign'></span></button><button id='search2' type='button' class='btn btn-default'><span class='glyphicon glyphicon-search'></span></button></div>"
    $('#table_wrapper2').html(rows+buttoms);
}

function buttonEditCarrer(){
    var div = "<form action='' method='post'><div id='editar2'><label>Nombre: </label><input title='Se necesita un nombre' type='text' size='20' maxlength='20' id='nombreCareer' name='nombreCareer' required autofocus/><br/><label>C&oacute;digo: </label><input type='text' id='codigoCareer' name='codigo' required autofocus/><br/></div>";
    var buttoms = "<div id='buttoms2second'><button id='ok2' type='submit' class='btn btn-default'><span class='glyphicon glyphicon-ok'></span></button><button id='cancel2' type='submit' class='btn btn-default'><span class='glyphicon glyphicon-remove'></span></button></div></form>"
    $('#table_wrapper2').html(div+buttoms);
    var carreras = JSON.parse(localStorage.getItem('carreras'));
    $("#nombreCareer").val(carreras[Select].nombreCarrera);
    $("#codigoCareer").val(carreras[Select].codigoCareer);
    $("#cancel2").click(function(){
        $("#buttoms2second").remove();
        $("#editar2").remove();
        prepareBinding();
    });
    $("#ok2").click(function(){
        if (($("#nombreCareer").val() === "") || ($("#codigoCareer").val() === "")) {

        }else{
            EditCareer(Select);
            prepareBinding();
        }
    });
}
function EditCareer (element)
{
    nuevaCarrera = false;

    var carreras = JSON.parse(localStorage.getItem('carreras'));
    carreras[element].nombreCarrera = $('#nombreCareer').val();
    carreras[element].codigoCareer = $('#codigoCareer').val();
    localStorage.setItem('carreras',JSON.stringify(carreras));
    UpdateCareer();
}

function buttonAddCarrer(){
    var div = "<form action='' method='post'><div id='editar2'><label>Nombre: </label><input title='Se necesita un nombre' type='text' size='20' maxlength='20' id='nombreCareer' name='nombreCareer' required autofocus/><br/><label>C&oacute;digo: </label><input type='text' id='codigoCareer' name='codigo' required autofocus/><br/></div>";
    var buttoms = "<div id='buttoms2second'><button id='ok2' type='submit' class='btn btn-default'><span class='glyphicon glyphicon-ok'></span></button><button id='cancel2' type='submit' class='btn btn-default'><span class='glyphicon glyphicon-remove'></span></button></div></form>"
    $('#table_wrapper2').html(div+buttoms);
    $("#cancel2").click(function(){
        prepareBinding();
    });
    $("#ok2").click(function(){
        if (($("#nombreCareer").val() === "") || ($("#codigoCareer").val() === "")) {

        }else{
           AddCareer();
           prepareBinding();
       }
   });
}
function AddCareer()
{
    var nombreCarrera = $('#nombreCareer').val();
    var codigo = $('#codigoCareer').val();
    if(nombreCarrera == "" || codigo == ""){

    }else if(nuevaCarrera==true){
        var carrera = {"nombreCarrera":nombreCarrera,"codigoCareer":codigo};
        var carreras = JSON.parse(localStorage.getItem('carreras'));
        if (carreras === null)
        {
            carreras = []
        };
        carreras.push(carrera);
        localStorage.setItem('carreras',JSON.stringify(carreras));
        prepareBinding();
    }else{
        var carreras = JSON.parse(localStorage.getItem('carreras'));
        var carrera = {"nombreCarrera":nombreCarrera,"codigoCareer":codigo};
        carreras.push(carrera);
        localStorage.setItem('carreras',JSON.stringify(carreras));
        prepareBinding();
    }
}

function deleteCareer (){
    var carreras = JSON.parse(localStorage.getItem('carreras'));
    var carreras2 = [];
    delete carreras[Select];
    for (var i = 0; carreras.length > i; i++) {
        if (carreras[i]==null) {

        }else{
            carreras2.push(carreras[i]);
        }
    };
    localStorage.setItem("carreras",JSON.stringify(carreras2));
    prepareBinding();
}


function UpdateUser(){
    var Usuarios = JSON.parse(localStorage.getItem('usuarios'));
    var rows = "<table class='table table-hover users step_wrapper'><tr disabled><th>C&eacute;dula</th><th>Nombre de Usuario</th><th>Nombre Completo</th><th>Rol</th></tr>";
    if (Usuarios === null)
    {
        Usuarios = []
    };

    for(var i = 0; i< Usuarios.length; i++){
        rows += "<tr class='step_box' data-row-key="+i+"><td>"+Usuarios[i].cedula+"</td><td>"+Usuarios[i].nombreUsuario+"</td><td>"+Usuarios[i].nombreCompleto+"</td><td>"+Usuarios[i].rol+"</td></tr>" 
    };
    rows += "</table>";
    var buttoms ="<div id='buttoms1first'><button id='add1' type='button' class='btn btn-default'><span class='glyphicon glyphicon-plus-sign'></span></button><button id='edit1' type='button' class='btn btn-default'><span class='glyphicon glyphicon-pencil'></span></button><button id='delete1' type='button' class='btn btn-default'><span class='glyphicon glyphicon-minus-sign'></span></button><button id='search1' type='button' class='btn btn-default'><span class='glyphicon glyphicon-search'></span></button></div>"
    $('#table_wrapper1').html(rows+buttoms);
}

function buttonEditUser(){
    var div = "<form action='' method='post'><div id='editar1'><label>C&eacute;dula: </label><input title='Se necesita una cedula' type='text' id='cedula' name='cedula' required autofocus/><br/><label>Nombre de usuario: </label><input type='text' id='nombreUsuario' name='nombreUsuario' required autofocus/><br/><label>Nombre Completo: </label><input type='text' id='nombreCompleto' name='nombreCompleto' required autofocus/><br/><label>Contrase&ntilde;a: </label><input type='password' id='contrasena' name='contrasena' required autofocus/><br/><label>Rol: </label><label><select class='rol'><option selected>Administrador</option><option >Director de carrera</option><option >Auxiliar</option></select></div>";
    var buttoms = "<div id='buttoms1second'><button id='ok1' type='submit' class='btn btn-default'><span class='glyphicon glyphicon-ok'></span></button><button id='cancel1' type='submit' class='btn btn-default'><span class='glyphicon glyphicon-remove'></span></button></div></form>"
    $('#table_wrapper1').html(div+buttoms);
    var usuarios = JSON.parse(localStorage.getItem('usuarios'));
    $("#cedula").val(usuarios[Select].cedula);
    $("#nombreUsuario").val(usuarios[Select].cedula);
    $("#nombreCompleto").val(usuarios[Select].nombreCompleto);
    $("#contrasena").val(usuarios[Select].contrasena);
    $("#cancel1").click(function(){
        $("#buttoms1second").remove();
        $("#editar1").remove();
        prepareBinding();
    });
    $("#ok1").click(function(){
        if (($("#cedula").val() === "") || ($("#nombreUsuario").val() === "")|| ($("#nombreCompleto").val() === "")|| ($("#contrasena").val() === "")) {

        }else{
           EditUser(Select);
       }
   });
}
function EditUser (element)
{
    nuevoUsuario = false;

    var usuarios = JSON.parse(localStorage.getItem('usuarios'));
    usuarios[element].cedula = $('#cedula').val();
    usuarios[element].nombreUsuario = $('#nombreUsuario').val();
    usuarios[element].nombreCompleto = $('#nombreCompleto').val();
    usuarios[element].contrasena = $('#contrasena').val();
    usuarios[element].rol = document.getElementsByClassName("rol")[0].value;
    localStorage.setItem('usuarios',JSON.stringify(usuarios));
    prepareBinding();
}

function buttonAddUser(){
    var div = "<form action='' method='post'><div id='editar1'><label>C&eacute;dula: </label><input title='Se necesita una cedula' type='text' id='cedula' name='cedula' required autofocus/><br/><label>Nombre de usuario: </label><input type='text' id='nombreUsuario' name='nombreUsuario' required autofocus/><br/><label>Nombre Completo: </label><input type='text' id='nombreCompleto' name='nombreCompleto' required autofocus/><br/><label>Contrase&ntilde;a: </label><input type='password' id='contrasena' name='contrasena' required autofocus/><br/><label>Rol: </label><label><select class='rol'><option selected>Administrador</option><option >Director de carrera</option><option >Auxiliar</option></select></div>";
    var buttoms = "<div id='buttoms1second'><button id='ok1' type='submit' class='btn btn-default'><span class='glyphicon glyphicon-ok'></span></button><button id='cancel1' type='submit' class='btn btn-default'><span class='glyphicon glyphicon-remove'></span></button></div></form>"
    $('#table_wrapper1').html(div+buttoms);
    $("#cancel1").click(function(){
        $("#buttoms1second").remove();
        $("#editar1").remove();
        prepareBinding();
    });
    $("#ok1").click(function(){
        if (($("#cedula").val() === "") || ($("#nombreUsuario").val() === "")|| ($("#nombreCompleto").val() === "")|| ($("#contrasena").val() === "")) {

        }else{
           AddUser();
       }
   });
}
function AddUser()
{
    var cedula = $('#cedula').val();
    var nombreUsuario = $('#nombreUsuario').val();
    var nombreCompleto = $('#nombreCompleto').val();
    var contrasena = $('#contrasena').val();
    var rol=document.getElementsByClassName("rol")[0].value;
    if(cedula == "" || nombreUsuario == ""){

    }else if(nuevoUsuario==true){
        var usuario = {"cedula":cedula,"nombreUsuario":nombreUsuario,"nombreCompleto":nombreCompleto,"contrasena":contrasena,"rol":rol};
        var usuarios = JSON.parse(localStorage.getItem('usuarios'));
        if (usuarios === null)
        {
            usuarios = []
        };
        usuarios.push(usuario);
        localStorage.setItem('usuarios',JSON.stringify(usuarios));
        prepareBinding();
    }else{
        var usuarios = JSON.parse(localStorage.getItem('usuarios'));
        var usuario = {"cedula":cedula,"nombreUsuario":nombreUsuario,"nombreCompleto":nombreCompleto,"contrasena":contrasena,"rol":rol};
        usuarios.push(usuario);
        localStorage.setItem('usuarios',JSON.stringify(usuarios));
        prepareBinding();
    }
}

function deleteUser(){
    var usuarios = JSON.parse(localStorage.getItem('usuarios'));
    var usuarios2 = [];
    delete usuarios[Select];
    for (var i = 0; usuarios.length > i; i++) {
        if (usuarios[i]==null) {

        }else{
            usuarios2.push(usuarios[i]);
        }
    };
    localStorage.setItem("usuarios",JSON.stringify(usuarios2));
    prepareBinding();
};

function popup(tipo){
    var div = "<div class='window-container zoomin'><h3>Advertencia</h3><br/><br/><span class='delete btn btn-default'>Eliminar</span><span id='close' class='btn btn-default'>Cancelar</span></div>";
    $('.overlay-container').html(div);
    $('.overlay-container').fadeIn(function() {

        window.setTimeout(function(){

            $('.window-container.zoomin').addClass('window-container-visible');
        }, 100);

    });
    $('#close').click(function() {
        $('.overlay-container').fadeOut().end().find('.window-container').removeClass('window-container-visible');
    });
    $('.delete').click(function() {
        if (tipo == 1) {
            deleteCareer();
        }
        if (tipo == 2) {
            deleteUser();
        }
        if (tipo == 3) {
            deleteStudent();
        }
        $('.overlay-container').fadeOut().end().find('.window-container').removeClass('window-container-visible');
    });
    
};
function seleccionar(){
    $('.step_wrapper').on('click','.step_box',function () {
       $('.step_box').removeClass('selected');
       $(this).addClass('selected');
   });
};

function UpdateStudent(){
    var Estudiante = JSON.parse(localStorage.getItem('estudiante'));
    var rows = "<table class='table table-hover users step_wrapper'><tr disabled><th>C&eacute;dula</th><th>Nombre Completo</th><th>Carrera</th><th>Ingles</th></tr>";
    if (Estudiante === null)
    {
        Estudiante = []
    };

    for(var i = 0; i< Estudiante.length; i++){
        rows += "<tr class='step_box' data-row-key="+i+"><td>"+Estudiante[i].cedula+"</td><td>"+Estudiante[i].nombre+"</td><td>"+Estudiante[i].carrera+"</td><td>"+Estudiante[i].ingles+"</td>" 
    };
    rows += "</table>";
    var buttoms ="<div id='buttoms3first'><button id='add3' type='button' class='btn btn-default'><span class='glyphicon glyphicon-plus-sign'></span></button><button id='edit3' type='button' class='btn btn-default'><span class='glyphicon glyphicon-pencil'></span></button><button id='delete3' type='button' class='btn btn-default'><span class='glyphicon glyphicon-minus-sign'></span></button><button id='search3' type='button' class='btn btn-default'><span class='glyphicon glyphicon-search'></span></button></div>"
    $('#table_wrapper3').html(rows+buttoms);
};

function buttonEditStudent(){
    var div = "<form action='' method='post'><div id='editar3'><label>C&eacute;dula: </label><input title='Se necesita una cedula' type='text' id='cedula' name='cedula' required autofocus/><br/><label>Nombre Completo: </label><input type='text' id='nombre' name='nombre' required autofocus/><br/><label>Carrera: </label><select id='comboCarrera' class='carrera'>";
    var carreras = JSON.parse(localStorage.getItem('carreras'));
    for (var i = 0; i < carreras.length; i++) {
        div += "<option>"+carreras[i].nombreCarrera+"</option>";
    }
    div += "</select><br/><label>Seleccione la imagen</label><input id='files' type='file' size='15' required/><output id='list'></output><br/><div class='ingles'><h4>Nivel de Ingles</h4><div class='part1'><select class='cajas'><option>Principiante</option><option>Intermedio</option><option>Avanzado</option></select><br/></div></div>";
    var buttoms = "<div id='buttoms3second'><button id='ok3' type='submit' class='btn btn-default'><span class='glyphicon glyphicon-ok'></span></button><button id='cancel3' type='submit' class='btn btn-default'><span class='glyphicon glyphicon-remove'></span></button></div></form>"
    $('#table_wrapper3').html(div+buttoms);
    var estudiante = JSON.parse(localStorage.getItem('estudiante'));
    var img = estudiante[Select].imagen;
    var span = document.createElement('span');
    span.innerHTML = ['<img class="thumb" src="', img,
    '" title="imagen"/>'].join('');
    $('#list').html(span);
    $("#cedula").val(estudiante[Select].cedula);
    $("#nombre").val(estudiante[Select].nombre);
    $("#cancel3").click(function(){
        $("#buttoms3second").remove();
        $("#editar3").remove();
        prepareBinding();
    });

    document.getElementById('files').addEventListener('change', cargar, false);
    $("#ok3").click(function(){
        if (($("#cedula").val() === "") || ($("#nombre").val() === "") || (document.getElementById("files").value === "")) {

        }else{
           EditStudent(Select);
       }
   });
};
function EditStudent (element)
{
    nuevoEstudiante = false;
    var img = imagen;
    var estudiante = JSON.parse(localStorage.getItem('estudiante'));
    estudiante[element].cedula = $('#cedula').val();
    estudiante[element].nombre = $('#nombre').val();
    estudiante[element].carrera = document.getElementsByClassName("carrera")[0].value;
    estudiante[element].ingles = document.getElementsByClassName("cajas")[0].value;
    estudiante[element].imagen = img;
    var selected = [];
    $('div.skills input[type=checkbox]').each(function() {
     if ($(this).checked) {
         selected.push($(this).attr('name'));
     }
 });
    estudiante[element].skills = selected;
    localStorage.setItem('estudiante',JSON.stringify(estudiante));
    prepareBinding();
};

function buttonAddStudent(){
    var div = "<form action='' method='post'><div id='editar3'><label>C&eacute;dula: </label><input title='Se necesita una cedula' type='text' id='cedula' name='cedula' required autofocus/><br/><label>Nombre Completo: </label><input type='text' id='nombre' name='nombre' required autofocus/><br/><label>Carrera: </label><select class='carrera'>";
    var carreras = JSON.parse(localStorage.getItem('carreras'));
    for (var i = 0; i < carreras.length; i++) {
        div += "<option>"+carreras[i].nombreCarrera+"</option>";
    }
    div += "</select><br/><label>Seleccione la imagen</label><input id='files' type='file' size='15' required/><output id='list'></output><br/><div class='ingles'><h4>Nivel de Ingles</h4><div class='part1'><select class='cajas'><option>Principiante</option><option>Intermedio</option><option>Avanzado</option></select><br/></div></div>";
    var buttoms = "<div id='buttoms3second'><button id='ok3' type='submit' class='btn btn-default'><span class='glyphicon glyphicon-ok'></span></button><button id='cancel3' type='submit' class='btn btn-default'><span class='glyphicon glyphicon-remove'></span></button></div></form>"
    $('#table_wrapper3').html(div+buttoms);
    $("#cancel3").click(function(){
        $("#buttoms3second").remove();
        $("#editar3").remove();
        prepareBinding();
    });

    document.getElementById('files').addEventListener('change', cargar, false);
    $("#ok3").click(function(){
        if (($("#cedula").val() === "") || ($("#nombre").val() === "") || (document.getElementById("files").value === "")) {

        }else{

           AddStudent(Select);
       }
   });
};
function cargar(evt) {

    var files = evt.target.files; // FileList object
    var f = files[0];
    var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
          // Render thumbnail.
          var span = document.createElement('span');
          imagen = e.target.result;
          title = escape(theFile.name);
          span.innerHTML = ['<img class="thumb" src="', e.target.result,
          '" title="', escape(theFile.name), '"/>'].join('');
          $('#list').html(span);
      };
  })(f);

      // Read in the image file as a data URL.
      reader.readAsDataURL(f);
  };
  function AddStudent()
  {
    var img = imagen;
    var cedula = $('#cedula').val();
    var nombre = $('#nombre').val();
    var carrera=document.getElementsByClassName("carrera")[0].value;
    var ingles=document.getElementsByClassName("cajas")[0].value;
    if(cedula == "" || nombre == ""){

    }else if(nuevoEstudiante==true){
        var estudiante = {"cedula":cedula,"nombre":nombre,"carrera":carrera,"ingles":ingles,"imagen":img};
        var estudiantes = JSON.parse(localStorage.getItem('estudiante'));
        if (estudiantes === null)
        {
            estudiantes = []
        };
        estudiantes.push(estudiante);
        localStorage.setItem('estudiante',JSON.stringify(estudiantes));
        prepareBinding();
    }else{
        var estudiantes = JSON.parse(localStorage.getItem('estudiante'));
        var estudiante = {"cedula":cedula,"nombre":nombre,"carrera":carrera,"ingles":ingles,"imagen":img};
        estudiantes.push(estudiante);
        localStorage.setItem('estudiante',JSON.stringify(estudiantes));
        prepareBinding();
    }
};

function deleteStudent(){
    var Estudiante = JSON.parse(localStorage.getItem('estudiante'));
    var estudiante2 = [];
    delete Estudiante[Select];
    for (var i = 0; Estudiante.length > i; i++) {
        if (Estudiante[i]==null) {

        }else{
            estudiante2.push(Estudiante[i]);
        }
    };
    localStorage.setItem("estudiante",JSON.stringify(estudiante2));
    prepareBinding();
};

function popupVer(tipo){
    var div = "<div class='window-container zoomin'></div>";
    $('.overlay-container').html(div);
    $('.overlay-container').fadeIn(function() {

        window.setTimeout(function(){

            $('.window-container.zoomin').addClass('window-container-visible');
        }, 100);

    });
    
    if (tipo == 1) {
        var carreras = JSON.parse(localStorage.getItem('carreras'));
        var rows = "<table class='table table-hover careers step_wrapper'><tr disabled><th>Nombre</th><th>C&oacute;digo</th></tr>";
        rows += "<tr class='step_box' data-row-key="+Select+"><td>"+carreras[Select].nombreCarrera+"</td><td>"+carreras[Select].codigoCareer+"</td></tr>" 
        rows += "</table>";
        var buttom = "<span id='cancel' class='btn btn-default'>Cerrar</span>";
        $('.window-container').html(rows+buttom);

    }
    if (tipo == 2) {
     var Usuarios = JSON.parse(localStorage.getItem('usuarios'));
     var rows = "<table class='table table-hover users step_wrapper'><tr disabled><th>C&eacute;dula</th><th>Nombre de Usuario</th><th>Nombre Completo</th><th>Rol</th></tr>";
     rows += "<tr class='step_box' data-row-key="+Select+"><td>"+Usuarios[Select].cedula+"</td><td>"+Usuarios[Select].nombreUsuario+"</td><td>"+Usuarios[Select].nombreCompleto+"</td><td>"+Usuarios[Select].rol+"</td></tr>" 
     rows += "</table>";
     var buttom = "<span id='cancel' class='btn btn-default'>Cerrar</span>";
     $('.window-container').html(rows+buttom);
 }
 if (tipo == 3) {
     var Estudiante = JSON.parse(localStorage.getItem('estudiante'));
     var img = Estudiante[Select].imagen;
     var span = document.createElement('span');
     span.innerHTML = ['<img class="thumb" src="', img,
     '" title="imagen"/>'].join('');
     var div = "<div class='foto'></div>";
     var rows = "<table class='table table-hover users step_wrapper'><tr disabled><th>C&eacute;dula</th><th>Nombre Completo</th><th>Carrera</th><th>Ingles</th></tr>";
     rows += "<tr class='step_box' data-row-key="+Select+"><td>"+Estudiante[Select].cedula+"</td><td>"+Estudiante[Select].nombre+"</td><td>"+Estudiante[Select].carrera+"</td><td>"+Estudiante[Select].ingles+"</td>" 
     rows += "</table>";
     var buttom = "<span id='cancel' class='btn btn-default'>Cerrar</span>";
     $('.window-container').html(div+rows+buttom);
     $('.foto').html(span);
 }
 $('#cancel').click(function() {
    $('.overlay-container').fadeOut().end().find('.window-container').removeClass('window-container-visible');
});
};

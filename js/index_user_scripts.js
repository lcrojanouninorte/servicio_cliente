(function() {
    "use strict";
    var db = getLocalStorage();

    /*
      hook up event handlers 
    */
    var horaMaxima = 18;
    var horaMinima = 8;
    var countdown = 5;
    var files;


    function register_event_handlers() {
        $('#loadingDiv').hide();
        upload_calificaciones();
        var bar = $('.bar');
        var percent = $('.percent');
        var status = $('#onsuccessmsg');

        //show img
        $(document).on('change', '#fileupload', function(evt) {
            var ext = $('#fileupload').val().split('.').pop().toLowerCase();
            if ($.inArray(ext, ['gif', 'png', 'jpg', 'jpeg']) !== -1) {
                var oFReader = new FileReader();
                oFReader.readAsDataURL(document.getElementById('fileupload').files[0]);
                oFReader.onload = function(oFREvent) {
                    $("#uploadPreview").attr({
                        src: oFREvent.target.result
                    });
                };

                files = evt.target.files;
            } else {
                alert("Archivo no Valido");
                $("#fileupload").replaceWith($("#fileupload").val('').clone(true));
            }
        });

        /*conteo*/
        $('#modal').hide();

        /*clic en calificación*/
        $(document).on("click", "#rating div", function(evt) {
                  
                iniciar_loading();
                var calif = parseNota(evt.currentTarget.id);
                var datetime = getDateString();
                var dataString = {
                    fecha: "" + datetime,
                    user_id: db.getItem("id"),
                    calificacion: calif

            };

            $.when(calificar(dataString)).done(

                function(calificado) {

                    if (calificado.status === "ok") {
                        setTimeout(modal, 1000);
                    } else {
                        if (calificar_local(dataString)) {
                            setTimeout(modal, 1000);

                        } else {
                            alert("No fue posible guardar");
                        }
                    }
                    n = countdown;

                }



            );
            $(document.elementFromPoint(2, 2)).click();
        });

        /*  clic en salir */
        $(document).on("click", "#salir", function(evt) {
            localStorage.removeItem("nombre");
            $.ui.loadContent('mainpage', false, false, 'pop');

        });

        /* button  Login */
        $(document).on("click", ".uib_w_10", function(evt) {
            var username = $("#user").val();
            var password = $("#password").val();
            username = username.trim();
            password = password.trim();
            if (username.length > 0 && password.length > 0) {
                login_register("", username, password, "", 2);
            } else {
                //animation effect.         
                $("#password").val('');
                $("#error").html("<span style='color:#cc0000'>Error:</span> Campos estan Vacios ");
            }
        });

        /* button  Register */
        // wait for the DOM to be loaded 
        // bind 'myForm' and provide a simple callback function 
        $('#uploadform').ajaxForm();

        $(document).on("submit", "#uploadform", function(evt) {
            var options = {
                url: "http://registrouninorte.uphero.com/register.php",
                type: 'POST',
                beforeSend: function() {
                                status.empty();
                                var percentVal = '0%';
                                bar.width(percentVal)
                                percent.html(percentVal);
                                },
                uploadProgress: function(event, position, total, percentComplete) {
                                var percentVal = percentComplete + '%';
                                bar.width(percentVal)
                                percent.html(percentVal);
                            },
                success: function(responseText, statusText, xhr, $form) {
                                var percentVal = '100%';
                                bar.width(percentVal)
                                percent.html(percentVal);
                            },
                complete: function(xhr) {
                                status.html(xhr.responseText);
                            },
            //    beforeSubmit: showRequest, // pre-submit callback 
                dataType:  'json',
                error: function(a,b,c,d){
                    alert("Error ocurrio");
                }
            };

            $("#uploadform").ajaxSubmit(options);
            return false;

        });

        /*
                $(document).on("click", "#register", function(evt) {
                    if (typeof jQuery != 'undefined') {
                        var name = $("#nombre").val();
                        var username = $("#nombreusuario").val();
                        var password = $("#r_pass").val();
                        var image = $("#fileupload").val();

                        if(name !=="" && username !== "" && password !== "" && image !== ""){

                            $.when(login_register(name, username, password, image, 1)).done(
                                function(evt){
                                    if(evt.status === "ok"){
                                        //Subir fotografia
                                    alert("Creado Correctamente");}
                                    else{
                                         alert("verifique la conección");
                                    }
                                });
                            
                        }else{
                            alert("Campos Vacios");
                        }
                    }

                });
            }
        */
    }

    var n = countdown;

    function modal() {
        n--;
        if (n > 0) {
            $('#modal').fadeIn('slow');
            //bloquear pantalla
            setTimeout(modal, 1000);
        } else {
            $('#modal').fadeOut('slow/400/fast');
        }
        $('#modal span').text("" + n);
        finalizar_loading();
    }

    function login_register(nombre, nombreusuario, pass, image, id) {

        var dataString = {
            name: nombre,
            username: nombreusuario,
            password: pass,
            pic: image,
            optionID: id
        };
        $.ajax({
            type: "POST",
            url: "http://registrouninorte.uphero.com/options.php",
            data: dataString,
            dataType: "text json",
            success: function(json) {
                if (json.result === false) {
                    alert(json.jerror);
                } else {
                    if (json.identification === 0 || json.identification == 1) {
                        // register: do some stuff
                    } else if (json.identification == 2) {
                        //  login: do some stuff
                        if (json.status == "logged") {
                            //crear variables de seccion
                            //pasar pagina
                            //$(":mobile-pagecontainer").pagecontainer("change", "#survey");
                            $.ui.loadContent('survey', false, false, 'slide');
                            db.setItem("id", json.id);
                            db.setItem("username", json.username);
                            db.setItem("nombre", json.nombre);
                            db.setItem("dirfoto", json.dirfoto);



                        } else {
                            $("#password").val('');
                            $("#error").html("<span style='color:#cc0000'>Error:</span> Contraseña no valida ");
                        }
                    } else {
                        return (false);
                    }
                }
            },
            error: function(xhr, textStatus, errorThrown) {
                alert('error:' + errorThrown + ',status:' + textStatus + ',xhr:' + xhr);
            },
            complete: function(jqXHR, textStatus) {
                //alert(textStatus);
                $("#survey #nombre").text(db.getItem("nombre"));
                $('<style> .circle-text:after {background-image: url(' + db.getItem("dirfoto") + ');}</style>').appendTo('head');
               // $(".circle-text2").css("background-image", "url('" + db.getItem("dirfoto") + "')");


            }
        });
    }

    function calificar(dataString) {
        return $.ajax({
            type: "POST",
            url: "http://registrouninorte.uphero.com/calificar.php",
            data: dataString,
            dataType: "json",
            success: function(json) {
                if (json.status !== "ok") {
                    alert(json.status);

                    return (false);
                } else {
                    return (true); //OO
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                alert('error:' + errorThrown + ',status:' + textStatus + ',xhr:' + xhr);


            },
            complete: function(jqXHR, textStatus) {
                //alert(textStatus);
                /*$("#survey #nombre").text(db.getItem("nombre"));
                $("#survey #foto").css("background-image", "url('" + db.getItem("dirfoto") + "')");*/



            }
        });

    }

    function calificar_local(dataString) {
        db = getLocalStorage();
        if (typeof db !== 'undefined' && db !== null) {
            if (typeof db.getItem("lTable") !== 'undefined' && db.getItem("lTable") !== null) {
                return insert(dataString);
            } else {
                lTable = create(dataString);
                return (insert(dataString));
            }

        }
        //localCalificaciones = db.getItem("calificaciones");
        //localCalificaciones.add(dataString);
        //db.setItem("calificaciones", localCalificaciones);
        return false;
    }

    function insert(dataString) {
        var lTable = $.parseJSON(db.getItem("lTable"));
        lTable.push(dataString);
        db.setItem("lTable", JSON.stringify(lTable));
        return true;
    }

    function create(dataString) {
        var lTable = [];
        lTable.push(dataString);
        return lTable;
    }

    function getlTable() {
        if (typeof db.getItem("lTable") !== 'undefined' && db.getItem("lTable") !== null) {
            var lTable = JSON.parse(db.getItem("lTable"));
            return lTable;
        } else {
            return null;
        }

    }

    function parseNota(nota) {
        var calif = 0;
        switch (nota) {
            case 'excelent':
                calif = 4;
                break;
            case 'good':
                calif = 3;
                break;
            case 'bad':
                calif = 2;
                break;
            case 'poor':
                calif = 1;
                break;
            default:
                calif = 0;

        }

        return calif;
    }

    function getDateString() {
        var currentdate = new Date();
        var datetime =
            currentdate.getDate() + "/" +
            (currentdate.getMonth() + 1) + "/" +
            currentdate.getFullYear() + "@" +
            currentdate.getHours() + ":" +
            currentdate.getMinutes() + ":" +
            currentdate.getSeconds();
        return datetime;
    }

    function getLocalStorage() {
        try {
            if (window.localStorage) return window.localStorage;
        } catch (e) {
            return undefined;
        }
    }

    function check() {
        if (db.getItem("nombre") === null) {
            $.ui.popup("Hola,  Debes Iniciar seccion con tus credenciales");
            $.ui.loadContent('login_page', false, false, 'pop');
            //  intel.xdk.notification.alert("Hammertime!","STOP","Can\'t Touch This");  

        } else {
            $.ui.popup("Hola, " + db.getItem("nombre") + " ya habias iniciado");
            $.ui.loadContent('survey', false, false, 'slide');
            /* alert("ya esta logeado");
                $("#survey #nombre").text(db.getItem("nombre"));
                $("#survey #foto").css("background-image","url('"+ db.getItem("dirfoto") + "')");
                */
        }
    }

    function iniciar_loading() {
        $('#loadingDiv').show('slow/400/fast');

    }



    function finalizar_loading() {
        $('#loadingDiv').hide('slow/400/fast');

    }

    function upload_calificaciones() {
        var currentdate = new Date();
        if (currentdate.getHours() >= horaMaxima || currentdate.getHours() <= horaMinima) {
            //subir datos
            var lTable = getlTable();
            if (lTable !== null) {
                //subir
                $.each(lTable, function(index, val) {
                    calificar(val);
                });
                db.removeItem("lTable");
            }
        }
    }

    // pre-submit callback 
    function showRequest(formData, jqForm, options) {
            // formData is an array; here we use $.param to convert it to a string to display it 
            // but the form plugin does this for you automatically when it submits the data 
            var queryString = $.param(formData);

            // jqForm is a jQuery object encapsulating the form element.  To access the 
            // DOM element for the form do this: 
            // var formElement = jqForm[0]; 

            alert('About to submit: \n\n' + queryString);

            // here we could return false to prevent the form from being submitted; 
            // returning anything other than false will allow the form submit to continue 
            return true;
        }
        // post-submit callback 
    function showResponse(responseText, statusText, xhr, $form) {
          alert(data.message);
        // for normal html responses, the first argument to the success callback 
        // is the XMLHttpRequest object's responseText property 

        // if the ajaxForm method was passed an Options Object with the dataType 
        // property set to 'xml' then the first argument to the success callback 
        // is the XMLHttpRequest object's responseXML property 

        // if the ajaxForm method was passed an Options Object with the dataType 
        // property set to 'json' then the first argument to the success callback 
        // is the json data object returned by the server 
        $("#onsuccessmsg").html("Status :<b>" + statusText +
            '</b><br><br>Response Data :<div id="msg" style="border:5px solid #CCC;padding:15px;">' + responseText + '</div>');

    }
    function showUploadProgress(evt, position, total, percent){

        $("#onsuccessmsg").html("porcentaje: <b>" + percent + " Total:<b> "+ total + " position: <b>" + position);

    }


    $(document).ready(register_event_handlers);
    //document.addEventListener("app.Ready", register_event_handlers, false);
})();

// configuracion map, con todas las variables globales usadas
const conf_map = new Map();

// segun dificultad elegida, genera tam_max y almacena en conf_map
function generarTamMax() {
    let dificultad = document.getElementById("idDificultad").value;
    if (dificultad == 'facil') {
        conf_map.set("tam_max", 11);
    } else if (dificultad == 'normal') {
        conf_map.set("tam_max", 13);
    } else if (dificultad == 'dificil') {
        conf_map.set("tam_max", 19);
    }
}    
 
// segun dificultad elegida, genera num_minas y almacena en conf_map
function generarNumeroMinas() {
    let dificultad = document.getElementById("idDificultad").value;
    let minas;
    if (dificultad == 'facil') {
        minas = parseInt(Math.pow(conf_map.get("tam_max"), 2) * 0.13);
    } else if (dificultad == 'normal') {
        minas = parseInt(Math.pow(conf_map.get("tam_max"), 2) * 0.16);
    } else if (dificultad == 'dificil') {
        minas = parseInt(Math.pow(conf_map.get("tam_max"), 2) * 0.2);
    }
    conf_map.set("num_minas", minas);
}

// segun num_minas, almacena num_banderitas en conf_map
function generarNumBanderitas() {
        conf_map.set("num_banderitas", conf_map.get("num_minas"));
}  

// genera variables y contadores de casillas y almacena en conf_map
function generarContadores(){
    conf_map.set("partida_iniciada", false);
    conf_map.set("num_casillas_clicadas_exitosamente", 0);
    let num_total_casillas = Math.pow(conf_map.get("tam_max"), 2);
    conf_map.set("num_casillas_totales", num_total_casillas);
    conf_map.set("num_casillas_sin_mina", num_total_casillas - conf_map.get("num_minas"));
}

// genera array de base rellenando con ceros
function generarArrayBombas(){
    const tablero = new Array();
    for(let fila = 0; fila < conf_map.get("tam_max"); fila++){
        tablero[fila] = new Array();
        for(let columna = 0; columna < conf_map.get("tam_max"); columna++){
            tablero[fila].push(0);
        }
    }
    conf_map.set("tablero", tablero);
}

// num aleatorio basado en tam_max para colocar minas aleatoriamente en array de base
function generarNumAleatorio() {
    return parseInt(Math.random() * conf_map.get("tam_max"));
}

// situa en array de base las minas, sustituyendo 1 por 0
function situarMinasEnArray() {
    let contadorMinas = 0;
    while(contadorMinas < conf_map.get("num_minas")){
        let fila = generarNumAleatorio();
        let columna = generarNumAleatorio();
        if(conf_map.get("tablero")[fila][columna] == 0){
            conf_map.get("tablero")[fila][columna] = 1;
            contadorMinas++;
        }
    }
}

// muestra letrero con numero de minas total en el tablero
function mostrarLetreroMinas(){
    let numMinas = conf_map.get("num_minas");
    document.getElementById("idNumMinas").innerHTML = `${numMinas}`;
}

// muestra tablero en el html
function mostrarTablero() {
    let tabla = document.createElement('table');
    tabla.setAttribute("id", "idTabla");
    for (let i = 0; i < conf_map.get("tam_max"); i++) {
        let fila = document.createElement('tr');
        for (let j = 0; j < conf_map.get("tam_max"); j++) {
            crearCasillero(fila, i, j);
        }
        tabla.appendChild(fila);
    }
    document.getElementById("idTablero").appendChild(tabla);
}

// crea una celda para el tablero
function crearCasillero(fila, i, j){
    let casilla = document.createElement("td");
    casilla.setAttribute("id", `idCelda_${i}_${j}`);
    casilla.classList.add("blue");
    fila.appendChild(casilla);
}

// analiza la casilla clicada mientras no haya game_over y aplica funciones
// pasa como parametro a algunas de las funciones un array con las coordenadas de la casilla clicada
function analizarCasillaClicada(){
    let arrayId = this.getAttribute("id").split("_");
    if(!conf_map.get("game_over")){
        sumarCasillaClicada(arrayId);
        iniciarTemporizador();
        if(conf_map.get("num_casillas_clicadas_exitosamente") < conf_map.get("num_casillas_totales") * 0.05){
            destaparIniciales(arrayId);
        } else {
            destaparCasilla(arrayId);
        }    
        comprobarVictoria();
    }
}

// para destapar el 5% las casillas iniciales sin que pueda haber game_over
function destaparIniciales(arrayId){
    let tablero = conf_map.get("tablero");
    if(document.getElementById(`idCelda_${arrayId[1]}_${arrayId[2]}`).classList.contains("blue")){
        if(tablero[arrayId[1]][arrayId[2]] == 1){
            tablero[arrayId[1]][arrayId[2]] = 0;
            insertarNuevaBomba(arrayId);
            mostrarNumeroBombas(arrayId);
        } else { 
            mostrarNumeroBombas(arrayId);
        }
    }
}

// añade una nueva nueva bomba (1) en lugar de un 0 al azar
function insertarNuevaBomba(arrayId){
    let fila, col;
    let tablero = conf_map.get("tablero");
    do {
        fila = generarNumAleatorio();
        col = generarNumAleatorio();
    } while (tablero[fila][col] == 1 || (fila == arrayId[1] && col == arrayId[2]) || document.getElementById(`idCelda_${fila}_${col}`).classList.contains("unaBom") || document.getElementById(`idCelda_${fila}_${col}`).classList.contains("dosBom") || document.getElementById(`idCelda_${fila}_${col}`).classList.contains("tresBom") );
    tablero[fila][col] = 1;
}

// suma una casilla clicada a num_casillas_clicadas_exitosamente si está despejada
// utiliza array con las coordenadas de la casilla que recibe como parametro
function sumarCasillaClicada(arrayId){
    let tablero = conf_map.get("tablero");
    let casilla = document.getElementById(`idCelda_${arrayId[1]}_${arrayId[2]}`);
    if(casilla.classList.contains("blue")){
        conf_map.set("num_casillas_clicadas_exitosamente", conf_map.get("num_casillas_clicadas_exitosamente") + 1);
    }
}

// inicia temporizador si no se ha iniciado partida y lo almacena conf_map
function iniciarTemporizador(){
    if(!conf_map.get("partida_iniciada")){
        conf_map.set("partida_iniciada", true);
        document.getElementById("idTemporizador").innerHTML = "0";
        let temporizador = setInterval(incrementarTiempo, 1000);
        conf_map.set("temporizador", temporizador);
    }
}

// destapa la casilla: si hay bomba(game over) si no, continua juego
function destaparCasilla(arrayId){
    let tablero = conf_map.get("tablero");
    if(document.getElementById(`idCelda_${arrayId[1]}_${arrayId[2]}`).classList.contains("blue")){
        if(tablero[arrayId[1]][arrayId[2]] == 1){
            mostrarMinasGameOver();
        } else { 
            mostrarNumeroBombas(arrayId);
        }
    }
}

// destapa las minas al clicar casilla minada además de parar temporizador y mostrar mensaje game over
function mostrarMinasGameOver() {
    if(!conf_map.get("game_over")){
        for(let fila = 0; fila < conf_map.get("tam_max"); fila++){
            for(let columna = 0; columna < conf_map.get("tam_max"); columna++){
                if(conf_map.get("tablero")[fila][columna] == 1)
                    mostrarCasillaMinada(fila, columna);
            }
        }
        conf_map.set("game_over", true);
        pararTemporizador();
        mostrarMensajeGameOver();
    }   
}

// crear casilla minada si hay mina
function mostrarCasillaMinada(fila, columna){
    document.getElementById(`idCelda_${fila}_${columna}`).classList.remove("destapada");
    document.getElementById(`idCelda_${fila}_${columna}`).classList.remove("yellow");
    document.getElementById(`idCelda_${fila}_${columna}`).classList.remove("blue");
    document.getElementById(`idCelda_${fila}_${columna}`).classList.remove("banderilla");
    document.getElementById(`idCelda_${fila}_${columna}`).classList.add("minada");
}

// para el temporizador
function pararTemporizador(){
    clearInterval(conf_map.get("temporizador"));
}

// mensaje gameover sweetalert
function mostrarMensajeGameOver(){
    Swal.fire({
        title: 'UPSSS!',
        text: `Mira donde clicas`,
        imageUrl: 'img/chicken.gif',
        imageWidth: 400,
        imageAlt: 'bomba'
    });
}

// imprime numero de bombas si las hay alrededor, sino llama destaparCasillasCircundantes()
function mostrarNumeroBombas(arrayId){
    let numeroDeMinasAlrededor = contarMinasAlrededor(arrayId);
    let casilla = document.getElementById(`idCelda_${arrayId[1]}_${arrayId[2]}`);
    casilla.classList.remove("blue");
    casilla.classList.add("destapada");
    if(numeroDeMinasAlrededor != 0){
        if(numeroDeMinasAlrededor == 1){
            casilla.classList.add("unaBom");
        } else if(numeroDeMinasAlrededor == 2){
            casilla.classList.add("dosBom");
        } else {
            casilla.classList.add("tresBom");
        }
        casilla.innerHTML = `<b>${numeroDeMinasAlrededor}</b>`;
    } else {
        destaparCasillasCircundantes(arrayId);
    }
}

// cuenta numero de minas alrededor de una casilla clicada y lo devuelve
function contarMinasAlrededor(arrayId){
    let f = parseInt(arrayId[1]);
    let c = parseInt(arrayId[2]);
    let contadorDeBombas = 0;
    let tablero = conf_map.get("tablero");
    const pos = [[f-1,c],[f-1,c+1],[f,c+1],[f+1,c+1],[f+1,c],[f+1,c-1],[f,c-1],[f-1,c-1]];
    for(let i = 0; i < pos.length; i++){
        if(pos[i][0] >= 0 && pos[i][1] >= 0 && pos[i][0] < conf_map.get("tam_max") && pos[i][1] < conf_map.get("tam_max") && tablero[pos[i][0]][pos[i][1]] == 1)
            contadorDeBombas++;
    }
    return contadorDeBombas;
}

// destapar casillas circundantes, se comprueban para despejarlas, las casillas circundantes a la clicada
// si la casilla circundante comprobada tiene una posición posible, se obtiene su id
// a partir del id  y si la casilla aun no ha sido clicada, se aumenta num_casillas_clicadas_exitosamente y
// se llama a mostrarNumeroBombas(idCasillaComprobada) 
// asi se comprobara si esa casilla circundante tiene minas alrederor o no (se llamaría de nuevo a destaparCasillasCircundantes())
// hasta que la recursividad mutua terminase al comprobarse una casilla que tenga un numero de bombas
function destaparCasillasCircundantes(arrayId){
    let f = parseInt(arrayId[1]);
    let c = parseInt(arrayId[2]);
    let tablero = conf_map.get("tablero");
    const pos = [[f-1,c],[f-1,c+1],[f,c+1],[f+1,c+1],[f+1,c],[f+1,c-1],[f,c-1],[f-1,c-1]];
    for(let i = 0; i < pos.length; i++){
        if(pos[i][0] >= 0 && pos[i][1] >= 0 && pos[i][0] < conf_map.get("tam_max") && pos[i][1] < conf_map.get("tam_max") && tablero[pos[i][0]][pos[i][1]] == 0){
            let arrayIdSiguienteCasilla = `idCelda_${pos[i][0]}_${pos[i][1]}`.split("_");
            if(document.getElementById(`idCelda_${pos[i][0]}_${pos[i][1]}`).classList.contains("blue")){
                conf_map.set("num_casillas_clicadas_exitosamente", conf_map.get("num_casillas_clicadas_exitosamente") + 1);
                mostrarNumeroBombas(arrayIdSiguienteCasilla);
            }
        }
    }
}

// si hay victoria muestra mensaje sweetalert (varía en funcion del tiempo logrado < o > de 60' )
// además activa la variable game_over y para el temporizador
function comprobarVictoria() {
    if(conf_map.get("num_casillas_clicadas_exitosamente") == conf_map.get("num_casillas_sin_mina") && !conf_map.get("game_over")){
        let segs = document.getElementById("idTemporizador").innerHTML;
        if(segs > 60){
            Swal.fire({
                title: 'Enhorabuena!',
                text: `Tablero despejado en: ${Math.floor(segs/60)}' ${segs%=60}"`,
                imageUrl: 'img/kratos.gif',
                imageWidth: 450,
                imageAlt: 'bomba'
            });
        } else {
            Swal.fire({
                title: 'Enhorabuena!',
                text: `Tablero despejado en: ${segs}"`,
                imageUrl: 'img/nyan-cat-kawaii.gif',
                imageWidth: 450,
                imageAlt: 'bomba'
            })
        }
        conf_map.set("game_over", true);
        pararTemporizador();
    }
}

// borra el tablero si ya existe para iniciar nuevo juego posteriormente
function borrarTablero(){
    if(document.getElementById("idTablero").children.length == 1){
        document.getElementById("idTabla").remove();
    }
}

// genera una nueva partida
function generadorPartida(){
    borrarTablero();
    pararTemporizador();
    generarTamMax();
    generarNumeroMinas();
    generarNumBanderitas();
    generarContadores();
    generarArrayBombas();
    situarMinasEnArray();
    mostrarTablero();
    asociarEventosCeldas();
    mostrarLetreroMinas();
    mostrarLetreroBanderitas()
    conf_map.set("game_over", false);
}

// incrementa el segundero
function incrementarTiempo(){
    let secs = parseInt(document.getElementById("idTemporizador").innerHTML);
    document.getElementById("idTemporizador").innerHTML = secs + 1;
}

// método testeo para testear juego que colorea casillas minadas de amarillo
function testearFinDeJuego(){
    const tablero = conf_map.get("tablero");
    for(let fila = 0; fila < conf_map.get("tam_max"); fila++){
        for(let col = 0; col < conf_map.get("tam_max"); col++){
            if(tablero[fila][col] == 1){
                document.getElementById(`idCelda_${fila}_${col}`).classList.add("yellow");
            }
        }
    }
}

// muestra numero de banderitas restantes
function mostrarLetreroBanderitas(){
    let numBanderitas = conf_map.get("num_banderitas");
    document.getElementById("idBanderitas").innerHTML = `${numBanderitas}`;
}

// numero de banderitas menos uno
function restarBanderita(){
    let numActual = conf_map.get("num_banderitas");
    conf_map.set("num_banderitas", numActual - 1);
}

// numero_banderitas mas uno
function sumarBanderita(){
    let numActual = conf_map.get("num_banderitas");
    conf_map.set("num_banderitas", numActual + 1);
}

// coloca o quita bandera en casilla
function colocarBanderita(event){
    if(!conf_map.get("game_over")){
        iniciarTemporizador();
        if(conf_map.get("num_banderitas") > 0 && event.target.classList.contains("blue")){
            event.target.classList.remove("blue");
            event.target.classList.add("banderilla");
            restarBanderita();
            mostrarLetreroBanderitas();
        } else if ( event.target.classList.contains("banderilla")) {
            event.target.classList.remove("banderilla");
            event.target.classList.add("blue");
            sumarBanderita();
            mostrarLetreroBanderitas();
        }
    }
}

// recarga partida/tablero con boton de recargar
function recargarPartida(){
    generadorPartida();
    Swal.fire({
        title: 'Recarga exitosa',
        text: `________________________________`,
        imageUrl: 'img/whales.gif',
        imageWidth: 450,
        imageAlt: 'bomba'
    })
}

// asociamos eventos
function asociarEventosCeldas(){
    let celdas = document.querySelectorAll('td[id^="idCelda_"]');
    celdas.forEach(e => {
        e.addEventListener("click", analizarCasillaClicada);
        e.addEventListener("contextmenu", colocarBanderita);
        e.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });
    });
}
document.querySelector("body").addEventListener("load", generadorPartida());
document.getElementById("idConfirmar").addEventListener("click", generadorPartida);
document.getElementById("idRecargar").addEventListener("click", recargarPartida);
// document.getElementById("idTesteo").addEventListener("click", testearFinDeJuego);
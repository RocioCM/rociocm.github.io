const apiKey = "VZ4N6ebz6BSdgrhUNiKAAU0dNYws5GSn";

//Inicializa los favoritos.
if (!localStorage.getItem("favGifs")) localStorage.setItem("favGifs", "[]");


//0. Links del header funcionales.
const headerMenuSwitch = document.getElementById("burguer-switch");
const homeLogo = document.getElementById("home-logo");
const navBar = document.getElementById("header-links");
const hiddenSections = Array.from(document.querySelectorAll(".hidden-section"));
//Datos: hiddenSection[0] y [1] trae a search-section y searched-section respectivamente.
//Y [2] y [3] se corresponden a las secciones de favoritos y myGifos respectivamente.
//Y [4] es la pantalla de fullscreen gif.
const fullscreen = hiddenSections.pop()

//Si el usuario proviene de CreateGifo desde los links del headerNav:
if (window.location.hash === "#favorites") {
    openFavorites();
} else if (window.location.hash === "#gifos") {
    openMyGifos();
};

navBar.children[1].addEventListener("click", openFavorites);
navBar.children[2].addEventListener("click", openMyGifos);
homeLogo.addEventListener("click", displayHomescreen);


function openFavorites() {
    const favoritesSection = hiddenSections[2];
    const favoritesGifs = JSON.parse(localStorage.getItem("favGifs"));
    displayGifsByIdGallery(favoritesGifs, favoritesSection);
}
function openMyGifos() {
    const myGifosSection = hiddenSections[3];
    const myGifs = JSON.parse(localStorage.getItem("myGifs"));
    displayGifsByIdGallery(myGifs, myGifosSection);
}

function displayGifsByIdGallery(gifsIds, gallerySection) {

    headerMenuSwitch.checked = false;
    hiddenSections.forEach(section => section.classList.add("hidden"));
    gallerySection.classList.remove("hidden");

    if (gifsIds !== null && gifsIds.length !== 0) {//Muestra la galería.
        gallerySection.children[2].classList.remove("hidden");
        gallerySection.children[3].classList.add("hidden");
        displaySectionGifs(gifsIds, gallerySection.children[2].firstElementChild);
        if (gifsIds.length <= 12) { gallerySection.children[2].lastElementChild.classList.add("hidden") }
        else { gallerySection.children[2].lastElementChild.classList.remove("hidden") };
    } else { //Muestra la sección de "No hay Gifos".
        gallerySection.children[2].classList.add("hidden");
        gallerySection.children[3].classList.remove("hidden");
    }
}


function displaySectionGifs(gifsIds, gifsCtn) {//Muestra en gifsCtn los gifs cuyos ids están en el array gifsIds.
    gifsCtn.innerHTML = "";
    gifsIds.forEach(async (gifId) => {
        try {
            let gif = await fetch(`https://api.giphy.com/v1/gifs/${gifId}?api_key=${apiKey}`);
            gif = await gif.json();
            gif = gif.data;
            addGifToDOM(gif, gifsCtn);
        } catch (error) {
            console.log(error);
        }
    });
}

function displayHomescreen() {
    const searchSection = hiddenSections[0];
    hiddenSections.forEach(section => section.classList.add("hidden")); //Oculta todas las secciones.
    searchSection.classList.remove("hidden") //Muestra sólo la sección deseada.
}




//1. Funcionalidad de búsqueda.
const searchCtn = document.getElementById("search-ctn"); //Contenedor de la barra y las sugerencias.
const suggestionsCtn = searchCtn.children[1]; //Contenedor de todas las sugerencias.
const suggestionTemplate = suggestionsCtn.firstElementChild.content.firstElementChild; //Template para cada sugerencia.
const searchBar = searchCtn.children[0]; //Contenedor de la cruz, el input y la lupa.
const searchInput = searchBar.children[1];
const searchButton = searchBar.children[2];
const clearSearchButton = searchBar.children[0];
const searchResultsCtn = hiddenSections[1].children[1].firstElementChild; //Contenedor de los resultados de la búsqueda.


//1.1. Predicción de búsqueda (suggestions).

searchInput.addEventListener("keyup", getSuggestions);

async function getSuggestions(e) { //Busca las sugerencias para la frase en searchInput.

    if (e.key === "Enter" || e.keyCode === 13) { //Si el usuario apretó enter, lanza la búsqueda.
        makeSearch();
        return;
    };

    let terms = this.value.split(" ").join("+") //Une los términos para la búsqueda.
    ///console.log(terms)
    let suggestions = await fetch(`https://api.giphy.com/v1/tags/related/${terms}?api_key=${apiKey}`)
    try {
        if (suggestions.status != 200) throw new Error("No se pudieron cargar sugerencias de búsqueda.");
        suggestions = await suggestions.json();
        if (suggestions.data.length == 0) throw new Error("No se han encontrado sugerencias para la búsqueda.")
        suggestions = suggestions.data; //Las sugerencias están en el array data.
        if (suggestions.length > 5) suggestions.splice(5, suggestions.length); //Me quedo sólo con 5 sugerencias.

        suggestionsCtn.innerHTML = ""; //Borra las sugerencias anteriores.
        suggestions.forEach(object => addSuggestionToDOM(object.name, suggestionTemplate));

    } catch (error) {
        suggestionsCtn.innerHTML = ""; //Borra las sugerencias anteriores.
        console.log(`Search suggestions failed: ${error}`);
    }
}

function addSuggestionToDOM(suggestion, containerTemplate) {
    let ctn = containerTemplate.cloneNode(true);
    ctn.children[1].textContent = suggestion;
    ctn.addEventListener("mousedown", () => { //Cuando se clickea una sugerencia, lanza su búsqueda.
        searchInput.value = ctn.children[1].textContent;
        makeSearch();
    });
    suggestionsCtn.appendChild(ctn);
}


//1.2. Barra, Búsqueda y display de resultados.

//a. Dar vuelta los botones. >
searchBar.addEventListener("focusin", enableSearchBar);
searchBar.addEventListener("focusout", disableSearchBar);

//b. Realizar búsqueda al apretar la lupa. >
searchButton.addEventListener("mousedown", makeSearch)

//c. Funcionalidad del botón vaciar cuadro de búsqueda.
clearSearchButton.addEventListener("mousedown", () => searchInput.value = "")



//>a. Cambia el orden de los íconos en la search-bar.
function enableSearchBar() { searchBar.classList.add("active-search") };
function disableSearchBar() {
    searchBar.classList.remove("active-search");
    suggestionsCtn.innerHTML = "";
};

//>b. Realiza la búsqueda de las palabras en searchInput.
async function makeSearch() {
    disableSearchBar();
    let text = searchInput.value; //Captura los términos a buscar.
    ///console.log("Ahora voy a buscar esto: "+text) ///
    text = text.split(" ").join("+"); //Le da el formato correcto para el fetch.
    let results = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${text}&limit=12`);
    results = await results.json();
    try {
        if (results.message) throw new Error(results.message);
        if (results.data.lenght == 0) throw new Error("No se han encontrado coincidencias con la búsqueda.")

        const gifs = results.data;
        //console.log(hiddenSections[1]) //Es el contenedor .searched-section
        const sectionTitle = searchResultsCtn.parentNode.parentNode.firstElementChild;
        sectionTitle.textContent = searchInput.value;


        const resultsSection = hiddenSections[1];
        resultsSection.classList.remove("hidden"); //Muestra la sección de searched-gifs.

        if (gifs.length === 0) { //Muestra la sección de "No se encontraron resultados".
            resultsSection.children[1].classList.add("hidden");
            resultsSection.children[2].classList.remove("hidden");
            return;
        }
        //Muestra la galería de gifs encontrados.
        resultsSection.children[1].classList.remove("hidden");
        resultsSection.children[2].classList.add("hidden");
        if (gifs.length < 12) { resultsSection.children[1].lastElementChild.classList.add("hidden") } //Esconde el botón ver más.
        else { resultsSection.children[1].lastElementChild.classList.remove("hidden") };
        searchResultsCtn.innerHTML = "";
        gifs.forEach(gif => addGifToDOM(gif, searchResultsCtn));

    }
    catch (error) {
        console.log(`Search failed: \n${error}`);
    }
}





//2. Rellena el campo de trending topics. 

setTrendingTopics(document.getElementById("trending-topics-ctn"))

async function setTrendingTopics(trendingTopicsCtn) {
    let topics = await fetch(`https://api.giphy.com/v1/trending/searches?api_key=${apiKey}`);
    try {
        if (topics.status != 200) throw new Error("No se pudieron cargar los trending topics");

        topics = await topics.json();
        const topicsList = topics.data.splice(0, 5); //De la promesa, obtiene data, que tiene 20 términos y saca sólo 5.
        topicsList.forEach((topic, index) => addTrendingTopic(topic, trendingTopicsCtn, index)); //Agrega al DOM todos cada topic.
    }
    catch (error) {
        console.log(`Trending Topics: \n${error}`);
    }
}

function addTrendingTopic(topic, topicsCtn, index) { //Agrega un topic al DOM y le pone un Listener para lanzar el search cuando se lo clickea.
    let ctn = document.createElement("span");
    ctn.textContent = topic;

    ctn.textContent += (index !== 4) ? ", " : "  ";

    ctn.addEventListener("click", () => {
        searchInput.value = ctn.textContent.slice(0, -2); //Lo busca sin la coma.
        makeSearch()
    }
    );
    topicsCtn.appendChild(ctn); //Agrega la palabra al párrafo en el DOM.
}






////EEEEEEPA: DETALLES
//3. En addTrendingGifToDOM, cuando setea el gif, también podría ser .downsized_medium.url, pesa un poco más. Pero, dato, nunca uses los still, no funcionan.
//4. Para mover el carrousel en desktop hay que usar JS. Y creo que va a funcionar usar: transform: translateX(-...px); (Y así hacer que se mueva.)
//9. Arreglar/completar event listeners de los botones en addTrendingGifToDOM.
//10. Hacé el llamado posta de la línea 4.
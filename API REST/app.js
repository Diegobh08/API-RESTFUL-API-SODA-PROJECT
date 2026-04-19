
const API_KEY = "673a9b11b53e35ee4a76aaffc34109ef";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

const yearInput = document.getElementById("yearInput");
const searchBtn = document.getElementById("searchBtn");
const resultsTitle = document.getElementById("resultsTitle");
const moviesGrid = document.getElementById("moviesGrid");
const errorMsg = document.getElementById("errorMsg");

// Función para mostrar errores
function mostrarError(mensaje) {
    errorMsg.textContent = mensaje;
    errorMsg.classList.remove("oculto");
    setTimeout(() => errorMsg.classList.add("oculto"), 5000);
}

// Función para limpiar y mostrar loading
function limpiarGrid() {
    moviesGrid.innerHTML = '<div style="text-align:center; padding:2rem;">Cargando...</div>';
}

// Obtener películas de TMDB
async function obtenerPeliculas(year) {
    const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=es-ES&sort_by=vote_average.desc&vote_count.gte=100&primary_release_year=${year}&page=1`;
    const resp = await fetch(url);

    if (!resp.ok) {
        if (resp.status === 401) throw new Error("Error 401: API key inválida. Obtén una gratis en themoviedb.org");
        if (resp.status === 404) throw new Error("Error 404: No se encontró el recurso");
        throw new Error(`Error ${resp.status}: No se pudo conectar con TMDB`);
    }

    const data = await resp.json();
    const movies = data.results || [];
    return movies.slice(0, 10);
}

// Mostrar películas en el grid
function mostrarPeliculas(peliculas, year) {
    if (!peliculas.length) {
        moviesGrid.innerHTML = `<div style="text-align:center; padding:2rem;">No hay películas para el año ${year}</div>`;
        resultsTitle.textContent = `Sin resultados para ${year}`;
        return;
    }

    resultsTitle.textContent = `Top ${peliculas.length} películas de ${year}`;

    moviesGrid.innerHTML = peliculas.map((pelicula, index) => {
        const titulo = pelicula.title || "Sin título";
        const rating = pelicula.vote_average ? pelicula.vote_average.toFixed(1) : "?";
        const fecha = pelicula.release_date ? pelicula.release_date.split("-")[0] : year;
        const descripcion = pelicula.overview || "Sin descripción disponible.";
        const posterPath = pelicula.poster_path
            ? `${IMG_URL}${pelicula.poster_path}`
            : "https://placehold.co/500x750/1e2438/aaa?text=Sin+imagen";

        return `
            <div class="card">
                <img class="card-img" src="${posterPath}" alt="${titulo}" loading="lazy" 
                     onerror="this.src='https://placehold.co/500x750/1e2438/aaa?text=Error+imagen'">
                <div class="card-info">
                    <div class="card-title">${index+1}. ${escapeHtml(titulo)}</div>
                    <div class="rating">⭐ ${rating} / 10</div>
                    <div class="year">📅 ${fecha}</div>
                    <div class="desc">${escapeHtml(descripcion.substring(0, 100))}${descripcion.length > 100 ? "…" : ""}</div>
                </div>
            </div>
        `;
    }).join("");
}

// Búsqueda principal
async function buscar() {
    const year = yearInput.value.trim();
    if (!year || isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
        mostrarError("⚠️ Ingresa un año válido entre 1900 y " + new Date().getFullYear());
        return;
    }

    limpiarGrid();
    try {
        const peliculas = await obtenerPeliculas(year);
        mostrarPeliculas(peliculas, year);
    } catch (error) {
        mostrarError(error.message);
        moviesGrid.innerHTML = `<div style="text-align:center; padding:2rem;">❌ ${error.message}</div>`;
        resultsTitle.textContent = "Error al cargar";
    }
}

// Escape HTML para seguridad
function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>]/g, function(m) {
        if (m === "&") return "&amp;";
        if (m === "<") return "&lt;";
        if (m === ">") return "&gt;";
        return m;
    });
}

// Eventos
searchBtn.addEventListener("click", buscar);
yearInput.addEventListener("keypress", (e) => { if (e.key === "Enter") buscar(); });

// Comprobar API key
if (!API_KEY || API_KEY === "TU_API_KEY_AQUI") {
    mostrarError("⚠️ Configura tu API key de TMDB en el archivo app.js (const API_KEY). Obtén una gratis en themoviedb.org");
} else {
    // Cargar año actual por defecto
    yearInput.value = new Date().getFullYear();
    buscar();
}
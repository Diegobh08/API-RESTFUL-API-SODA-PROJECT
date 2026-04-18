const API_KEY = "TU_API_KEY";

const btn = document.getElementById("btnBuscar");
const resultsDiv = document.getElementById("results");

btn.addEventListener("click", buscar);

async function buscar() {
    const year = document.getElementById("year").value;

    if (!year) {
        alert("Por favor ingresa un año");
        return;
    }

    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&primary_release_year=${year}&sort_by=vote_average.desc&vote_count.gte=2000`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        const top10 = data.results.slice(0, 10);

        mostrarPeliculas(top10);
    } catch (error) {
        console.error("Error:", error);
    }
}

function mostrarPeliculas(peliculas) {
    resultsDiv.innerHTML = peliculas.map(movie => `
    <div class="card">
      <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
      <div class="card-content">
        <h3>${movie.title}</h3>
        <p class="rating">⭐ ${movie.vote_average}</p>
        <p>${movie.overview.substring(0, 100)}...</p>
      </div>
    </div>
  `).join("");
}
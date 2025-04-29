const pokedex = document.getElementById('pokedex');
const modal = document.getElementById('modal');
const modalDetails = document.getElementById('modalDetails');
const closeModal = document.getElementById('closeModal');
const searchBar = document.getElementById('searchBar');
const generationFilter = document.getElementById('generationFilter');
const sortType = document.getElementById('sortType');

let allPokemon = [];

const generationRanges = {
  1: [1, 151],
  2: [152, 251],
  3: [252, 386]
};

async function fetchAllPokemon() {
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=386');
  const data = await res.json();
  const results = data.results;

  for (const result of results) {
    const res = await fetch(result.url);
    const pokeData = await res.json();
    allPokemon.push(pokeData);
  }

  renderPokemon();
}

function renderPokemon() {
  const gen = generationFilter.value;
  const searchTerm = searchBar.value.toLowerCase();
  const sort = sortType.value;

  let filtered = allPokemon.filter(pokemon => {
    if (gen !== 'all') {
      const [min, max] = generationRanges[gen];
      if (pokemon.id < min || pokemon.id > max) return false;
    }
    return pokemon.name.includes(searchTerm);
  });

  if (sort === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'type') {
    filtered.sort((a, b) => a.types[0].type.name.localeCompare(b.types[0].type.name));
  } else {
    filtered.sort((a, b) => a.id - b.id);
  }

  pokedex.innerHTML = '';
  filtered.forEach(createCard);
}

function createCard(pokemon) {
  const card = document.createElement('div');
  card.className = 'pokemon-card';
  card.innerHTML = `
    <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
    <h2>${pokemon.name}</h2>
  `;
  card.addEventListener('click', () => showModal(pokemon));
  pokedex.appendChild(card);
}

function showModal(pokemon) {
  const descriptionUrl = pokemon.species.url;

  fetch(descriptionUrl)
    .then(res => res.json())
    .then(data => {
      const flavor = data.flavor_text_entries.find(entry => entry.language.name === 'en');
      const description = flavor ? flavor.flavor_text.replace(/\f/g, ' ') : 'No description available.';

      modalDetails.innerHTML = `
        <h2>${pokemon.name}</h2>
        <div class="modal-image-container">
          <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}" />
        </div>
        <div class="modal-info-row">
          <p><strong>Height:</strong> ${pokemon.height / 10} m</p>
          <p><strong>Weight:</strong> ${pokemon.weight / 10} kg</p>
        </div>
        <p style="margin-top: 1rem; font-style: italic;">${description}</p>
        <h3 style="margin-top: 1rem;">Base Stats:</h3>
        <ul>
          ${pokemon.stats.map(stat => `<li>${stat.stat.name.toUpperCase()}: ${stat.base_stat}</li>`).join('')}
        </ul>
      `;

      modal.classList.remove('hidden');
    });
}

closeModal.addEventListener('click', () => {
  modal.classList.add('hidden');
});

searchBar.addEventListener('input', renderPokemon);
generationFilter.addEventListener('change', renderPokemon);
sortType.addEventListener('change', renderPokemon);

fetchAllPokemon();

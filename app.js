const express = require('express');
const axios = require('axios');
const cor = require('cors');

const port = 3001;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/list', async (req, res) => {
  let fetchPokemonUrl;
  const { search, nextUrl } = req.body;

  if (search) {
    fetchPokemonUrl = 'https://pokeapi.co/api/v2/pokemon?limit=1118';
  } else {
    fetchPokemonUrl = nextUrl || 'https://pokeapi.co/api/v2/pokemon?limit=48';
  }

  const { data } = await axios.get(fetchPokemonUrl);

  if (search) {
    data.results = data.results.filter((pokemon) => pokemon.name.includes(search.toLowerCase()));
  }

  const pokemonListPromises = data.results.map(({ url }) => axios.get(url));

  const pokemonFullList = await Promise.all(pokemonListPromises);

  const pokemonList = pokemonFullList.map(({ data: pokemon }) => {
    const {
      id, name, sprites, types,
    } = pokemon;

    const imageUrl = sprites.front_default;

    return {
      id,
      name,
      types,
      imageUrl,
    };
  });

  const { next, previous } = data;

  res.send({ pokemonList, next, previous  })
})

app.listen(port, () => {
  console.log('Listening on port ' + port);
})
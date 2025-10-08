const imageUrl = 'https://cdn.thesimpsonsapi.com/500'
const fetchCharacter = async (id = 1) => {
    const response = await fetch(`https://thesimpsonsapi.com/api/characters/${id}`);
    const data = await response.json();
    console.log(data); 
    return data;
};

(async () => {
    const character = await fetchCharacter(20);
    const spinnerElement = document.getElementById('spinner');
    spinnerElement.style.display = 'none';
    const characterElement = document.getElementById('character');
    characterElement.textContent = JSON.stringify(character, null, 4);

    const characterImageElement = document.getElementById('character-image');
    characterImageElement.src = `${imageUrl}${character.portrait_path}`;
})();
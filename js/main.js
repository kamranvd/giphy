const categoryContainer = document.querySelector('.js-category-container');
let categories = null;
const giphyContainer = document.querySelector('.js-giphy-container');

function getCategoryById(id) {
    if (categories === null) {
        return null;
    }
    return categories.find(category => category.idCategory === String(id));
}

async function loadCategories() {
    giphyContainer.innerHTML = '';
    if (categories === null) {
        await fetchCategories();
    } 
    displayCategories();
}

function renderCategory(category, wide=false) {
    return `
        <div 
            class="category-item ${wide===true ? 'wide' : ''}" 
            data-id="${category.idCategory}">
            <h2>${category.strCategory}</h2>
            <img 
                src="${category.strCategoryThumb}" 
                alt="${category.strCategory}" />
            <p>${category.strCategoryDescription}</p>
        </div>
    `;
}


function displayCategories() { 
    if (categories === null) {
        return;
    }
    categoryContainer.innerHTML = categories
        .map(category => renderCategory(category))
        .join('');
}

async function fetchCategories() {
    const data = await fetch('https://api.giphy.com/v1/gifs/search?api_key=PyhEEbDmQ4BCug4My9GQOJcEBWNpqlpz&q=homer&limit=25&offset=0&rating=g&lang=en&bundle=messaging_non_clips');
    const response = await data.json();
    categories = response.categories;
    return {
        categoriesLoaded: true
    };
}


function renderIngredients(giphy) {
    let html = '<ul class="ingredient-list">';
    for (let i = 1; i <= 20; ++i) {
        const ingredientValue = giphy['strIngredient' + i];
        const ingredientMeasure = giphy['strMeasure' + i];
        if (typeof ingredientValue === 'string' && ingredientValue.length > 0) {
            html += `<li>${ingredientValue} (${ingredientMeasure})</li>`;
        }
    }
    html += '</ul>';
    return html;
}

function renderGiphy(giphy) {
    const ingredientsHtml = renderIngredients(giphy);

    return `
        <div class="giphy wide">
            <h2>${giphy.strGiphy}</h2>
            <img src="${giphy.strGiphyThumb}" alt="${giphy.strGiphy}" />
            <p>${giphy.strInstructions}</p>
            ${ingredientsHtml}
        </div>
    `;
}

function isPromiseFulfilled(response) {
    return response => response.status === 'fulfilled';
}

function displayGiphyDetails(giphyResponses) {
    giphyContainer.innerHTML = giphyResponses 
        .filter(isPromiseFulfilled)
        .map(response => response.value.giphy[0]) // these arrays have a length of 1
        .map(giphy => renderGiphy(giphy)) 
        .join('');
}

async function loadGiphyByCategory(response) {
    const giphyList = response.giphy.slice(0, 10); 

    const giphyPromiseList = giphyList.map(giphy => 
        fetch(`https://api.giphy.com/v1/gifs/search?api_key=PyhEEbDmQ4BCug4My9GQOJcEBWNpqlpz&q=homer&limit=25&offset=0&rating=g&lang=en&bundle=messaging_non_clips?i=${giphy.idGiphy}`)
            .then(data => data.json())
    );

    let results = await Promise.allSettled(giphyPromiseList); 
    await displayGiphyDetails(results);
}


async function fetchGiphyListByCategory(currentCategory) {
    const categoryName = currentCategory.strCategory;
    const URL_PREFIX = `hhttps://api.giphy.com/v1/gifs/search?api_key=PyhEEbDmQ4BCug4My9GQOJcEBWNpqlpz&q=homer&limit=25&offset=0&rating=g&lang=en&bundle=messaging_non_clips`;

    const data = await fetch(URL_PREFIX + categoryName);
    return data.json();
}

async function categoryClicked(event) {
    const id = event.target.dataset.id || event.target.parentElement.dataset.id;
    if (typeof id === 'undefined') {
        return;
    } else if (id === 'all') {
        loadCategories();
    } else {
        const currentCategory = getCategoryById(id);
        categoryContainer.innerHTML = `
            ${renderCategory(currentCategory, true)}
            <button data-id="all">Choose another category</button>
        `;

        giphyContainer.innerHTML = 'Loading...';

        let giphyList = await fetchGiphyListByCategory(currentCategory);
        await loadGiphyByCategory(giphyList);
    }
}

categoryContainer.addEventListener('click', categoryClicked);
loadCategories();
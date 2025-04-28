const dataContainer = document.querySelector('.js-data-container');
let data = null;
const giphyContainer = document.querySelector('.js-giphy-container');

async function loadData() {
    giphyContainer.innerHTML = '';
    if (data === null) {
        await fetchData();
    } 
    displayData();
}

function renderData(data, wide=false) {
    return `
        <div 
            class="data-item ${wide===true ? 'wide' : ''}" 
            data-id="${data.id}">
            <h2>${data.title}</h2>
            <img 
                src="${data.strDataImg}" 
                alt="${data.strTitle}" />
            <p>${data.strDataDescription}</p>
        </div>
    `;
}


function displayData() { 
    if (data === null) {
        return;
    }
    dataContainer.innerHTML = data
        .map(data => renderData(data))
        .join('');
}

async function fetchData() {
    const giphyData = await fetch('https://api.giphy.com/v1/gifs/search?api_key=PyhEEbDmQ4BCug4My9GQOJcEBWNpqlpz&q=homer&limit=25&offset=0&rating=g&lang=en&bundle=messaging_non_clips');
    const response = await giphyData.json();
    data = response.data;

    data = (response.data || []).map(item => ({
        id: item.id ?? '',
        strTitle: item.title?.trim() || 'No Title',
        strDataImg: item.images?.downsized_medium?.url || item.images?.downsized?.url || '', // Prefer higher quality if available
        strDataDescription: item.slug?.replace(/-/g, ' ').trim() || 'No Description'
    }));

    console.log(data);
    return {
        dataLoaded: true
    };
}

async function dataClicked(event) {
    const id = event.target.dataset.id || event.target.parentElement.dataset.id;
    if (typeof id === 'undefined') {
        return;
    } else {
        loadData();
    }
}

dataContainer.addEventListener('click', dataClicked);
loadData();
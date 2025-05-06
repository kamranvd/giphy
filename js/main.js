document.addEventListener('DOMContentLoaded', () => {
    const dataContainer = document.querySelector('.js-data-container');
    const giphyContainer = document.querySelector('.js-giphy-container');
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const fetchURL = 'https://api.giphy.com/v1/gifs/search?';
    let data = null;
    let searchTerm = 'homer';

    const giphySearchURLBase = {
        'api_key' : 'PyhEEbDmQ4BCug4My9GQOJcEBWNpqlpz',
        'limit' : 25,
        'offset' : 0,
        'rating' : 'g',
        'lang' : 'en',
        'bundle' : 'messaging_non_clips',
    }

    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();

        console.log('Form submitted');
        searchTerm = searchInput.value;
        console.log('search term is ' + searchTerm)
        loadData();

    });

    async function loadData() {
        giphyContainer.innerHTML = '';
        if (data === null || searchTerm !== 'homer') {
            await fetchData();
        } 
        displayData();
    }

    function renderData(data, wide=false) {
        return `
            <div 
                class="data-item ${wide===true ? 'wide' : ''}" 
                data-id="${data.id}">
                <h4 class="img-title">${data.strTitle}</h4>
                <img 
                    src="${data.strDataImg}" 
                    alt="${data.strTitle}" />
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

    function buildSearchURL(baseURL, params) {
        const url = new URL(baseURL);
        for (const key in params) {
            if (params.hasOwnProperty(key) && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        }
        return url.toString();
    }


    async function fetchData() {
        const searchParams = { ...giphySearchURLBase, q: searchTerm };
        const searchURL = buildSearchURL(fetchURL, searchParams);
        console.log('Fetching:', searchURL);

        try {
            const giphyData = await fetch(searchURL);
            const response = await giphyData.json();
            console.log('Raw API response:', response);
            data = (response.data || []).map(item => ({
                id: item.id ?? '',
                strTitle: item.title?.trim() || 'No Title',
                strDataImg: item.images?.fixed_height_small?.url || item.images?.fixed_height_downsampled?.url || '',
                strDataDescription: item.slug?.replace(/-/g, ' ').trim() || 'No Description'
            }));
            console.log(data);
            return { dataLoaded: true };
        } catch (error) {
            console.error("Error fetching data:", error);
            giphyContainer.innerHTML = '<p class="error-message">Failed to load data.</p>';
            data = []; // Ensure data is empty on error
            return { dataLoaded: false };
        }
    }

    loadData();

});

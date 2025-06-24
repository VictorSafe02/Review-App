document.addEventListener("DOMContentLoaded", () => {
  const currentMode = getCurrentMode();
  const pageTitle = document.getElementById("page-title");
  const searchInput = document.getElementById("search-input");
  const searchForm = document.getElementById("search-form");
  const searchResults = document.getElementById("search-results");

  pageTitle.textContent =
    currentMode === "books" ? "Search Books" : "Search Movies & TV Shows";
  searchInput.placeholder =
    currentMode === "books"
      ? "Search books by title or author..."
      : "Search movies/TV by title or director...";
  setActiveNavLink();

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
      searchResults.innerHTML = "<p>Please enter a search term.</p>";
      return;
    }
    performSearch(searchTerm);
  });

  function performSearch(term) {
    console.log("performSearch started with term:", term);
    searchResults.innerHTML = "<p>Searching...</p>";
    const currentMode = getCurrentMode();
    const encodedTerm = encodeURIComponent(term);
    const searchUrl = `/opinify/api/search.php?mode=${currentMode}&term=${encodedTerm}`;

    console.log("Attempting to fetch search URL:", searchUrl);

    fetch(searchUrl)
      .then((response) => {
        console.log("Received response from fetch");
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.error || `HTTP error ${response.status}`);
          });
        }
        return response.json();
      })
      .then((results) => {
        console.log("Raw search results:", results);
        displayResults(results, term);
      })
      .catch((error) => {
        console.log("Fetch encountered an error");
        searchResults.innerHTML = `<p>Error during search: ${error.message}</p>`;
        console.error("Search Fetch Error:", error);
      });
  }

  function displayResults(results, term) {
    searchResults.innerHTML = "";

    if (!results || results.length === 0) {
      searchResults.innerHTML = `<p>No results found for "${term}".</p>`;
      return;
    }

    const resultsContainer = document.createElement("div");
    resultsContainer.classList.add("search-results-container");

    results.forEach((item) => {
      console.log("Processing item:", item);
      const card = document.createElement("a");
      card.classList.add("item-card");
      card.href = `../HTML/review.html?id=${item.id}`;

      card.innerHTML = `
          <img src="${item.image_url}" alt="${item.title}">
          <p class="item-title">${item.title}</p>
      `;
      console.log("Card innerHTML:", card.innerHTML);

      resultsContainer.appendChild(card);
    });

    searchResults.appendChild(resultsContainer);
  }
});

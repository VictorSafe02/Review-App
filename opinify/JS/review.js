document.addEventListener("DOMContentLoaded", function () {
  setActiveNavLink();
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("id");
  if (!itemId) {
    showError(
      "Item ID is missing from the URL.",
      "Return Home",
      "../HTML/home.html"
    );
    return;
  }
  fetchItemDetails(itemId);
  fetchReviews(itemId);
  fetchSimilarItems(itemId);
  setupEventListeners(itemId);
  setupLoadMoreReviews();
});

function getCurrentMode() {
  return localStorage.getItem("opinifyMode") || "movies";
}

function fetchItemDetails(itemId) {
  const mode = getCurrentMode();
  const itemDetailsUrl = `../api/get_item_details.php?mode=${mode}&id=${itemId}`;

  fetch(itemDetailsUrl)
    .then(handleResponse)
    .then((item) => displayItemDetails(item, mode))
    .catch((error) =>
      showError(
        "Error loading item details.",
        "Return Home",
        "../HTML/home.html"
      )
    );
}

let allReviews = [];
let displayedReviewCount = 2;

function fetchReviews(itemId, sortBy = "newest") {
  const mode = getCurrentMode();
  const reviewsUrl = `../api/get_reviews.php?mode=${mode}&id=${itemId}`;

  fetch(reviewsUrl)
    .then(handleResponse)
    .then((reviews) => {
      allReviews = reviews;
      displayReviews(sortBy);
    })
    .catch(
      (error) =>
        (document.getElementById("reviews-container").innerHTML =
          "<p>Error loading reviews.</p>")
    );
}

function fetchSimilarItems(itemId) {
  const mode = getCurrentMode();
  const similarItemsUrl = `../api/get_similar_items.php?mode=${mode}&id=${itemId}`;

  fetch(similarItemsUrl)
    .then(handleResponse)
    .then(displaySimilarItems)
    .catch((error) => {
      console.error("Error fetching similar items:", error);
      document.getElementById("similar-items-container").innerHTML =
        "<p>Error loading similar items.</p>";
    });
}

function setupEventListeners(itemId) {
  const writeReviewBtn = document.getElementById("write-review-btn");
  const reviewModal = document.getElementById("review-modal");
  const closeModal = document.querySelector(".close-modal");
  const sortReviews = document.getElementById("sort-reviews");
  const loadMoreReviews = document.getElementById("load-more-reviews");
  const reviewForm = document.getElementById("review-form");
  const addToFavoritesBtn = document.getElementById("add-to-favorites-btn");

  writeReviewBtn.addEventListener(
    "click",
    () => (reviewModal.style.display = "flex")
  );

  closeModal.addEventListener(
    "click",
    () => (reviewModal.style.display = "none")
  );

  reviewModal.addEventListener("click", (e) => {
    if (e.target === reviewModal) reviewModal.style.display = "none";
  });

  setupStarRating();
  setupAddProCon();

  sortReviews.addEventListener("change", () =>
    fetchReviews(itemId, sortReviews.value)
  );

  reviewForm.addEventListener("submit", (e) => handleSubmitReview(e, itemId));

  if (addToFavoritesBtn) {
    addToFavoritesBtn.addEventListener("click", () =>
      handleAddToFavorites(itemId)
    );
  }
}

function displayItemDetails(item, mode) {
  if (!item) return;

  document.getElementById("item-title").textContent = item.title;
  document.getElementById("item-image").src = item.image;
  document.getElementById("item-image").alt = `${item.title} cover`;
  document.getElementById("item-creator").textContent =
    mode === "books" ? `by ${item.author}` : `Directed by ${item.director}`;
  document.getElementById("item-type").textContent =
    mode === "books" ? "Book" : item.type;
  document.getElementById("item-year").textContent = item.year;
  document.getElementById("item-description-text").textContent =
    item.description;
  document.getElementById("average-rating").textContent = parseFloat(
    item.rating
  ).toFixed(1);
  document.getElementById(
    "review-count"
  ).textContent = `(${item.reviewCount} reviews)`;

  displayStars(item.rating);
}

function displayReviews(sortBy = "newest") {
  const container = document.getElementById("reviews-container");
  container.innerHTML = "";

  if (!allReviews || allReviews.length === 0) {
    container.innerHTML = "<p>No reviews yet. Be the first to review!</p>";
    return;
  }

  let sortedReviews = [...allReviews];

  switch (sortBy) {
    case "newest":
      sortedReviews.sort(
        (a, b) => new Date(b.review_date) - new Date(a.review_date)
      );
      break;
    case "highest":
      sortedReviews.sort((a, b) => b.rating - a.rating);
      break;
    case "lowest":
      sortedReviews.sort((a, b) => a.rating - b.rating);
      break;
  }

  container.innerHTML = sortedReviews.map(createReviewCard).join("");
}

function createReviewCard(review) {
  const initials = review.username
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();
  const prosList = review.pros
    ? JSON.parse(review.pros)
        .map((pro) => `<li>${pro}</li>`)
        .join("")
    : "";
  const consList = review.cons
    ? JSON.parse(review.cons)
        .map((con) => `<li>${con}</li>`)
        .join("")
    : "";

  return `
    <section class="review-card">
      <section class="review-header">
        <section class="reviewer-info">
          <section class="reviewer-avatar">${initials}</section>
          <section>
            <section class="reviewer-name"><a href="../HTML/user_profile.html?id=${
              review.user_id
            }" >${review.username}</a></section>
            <section class="review-date">${formatDate(
              review.review_date
            )}</section>
          </section>
        </section>
        <section class="review-rating">${"★".repeat(
          Math.floor(review.rating)
        )}${"☆".repeat(5 - Math.floor(review.rating))}</section>
      </section>
      <h3 class="review-title">${review.title}</h3>
      <section class="review-content">${review.content}</section>
      <section class="pros-cons">
        <section class="pros"><h4>Pros</h4><ul>${prosList}</ul></section>
        <section class="cons"><h4>Cons</h4><ul>${consList}</ul></section>
      </section>
    </section>
  `;
}

function setupStarRating() {
  const stars = document.querySelectorAll(".star-rating .star");
  stars.forEach((star, index) => {
    star.addEventListener("click", () => {
      document.getElementById("review-rating").value = index + 1;
      stars.forEach((s, i) => (s.textContent = i <= index ? "★" : "☆"));
    });
  });
}

function setupAddProCon() {
  document.querySelectorAll(".add-pro-btn, .add-con-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const input = document.createElement("input");
      input.type = "text";
      input.className = e.target.className.replace("-btn", "-input");
      input.placeholder = `Add a ${
        e.target.className.includes("pro") ? "pro" : "con"
      }`;
      e.target.parentNode.insertBefore(input, e.target);
    });
  });
}

function handleSubmitReview(e, itemId) {
  e.preventDefault();

  const mode = getCurrentMode();
  const rating = document.getElementById("review-rating").value;
  const title = document.getElementById("review-title").value;
  const content = document.getElementById("review-text").value;
  const pros = getListValues(".pro-input");
  const cons = getListValues(".con-input");

  const reviewData = {
    item_id: itemId,
    item_type: mode === "books" ? "Book" : "MovieTV",
    rating: rating,
    title: title,
    content: content,
    pros: pros,
    cons: cons,
  };

  fetch("../api/submit_review.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reviewData),
  })
    .then(handleResponse)
    .then((data) => {
      alert("Thank you for your review!");
      document.getElementById("review-modal").style.display = "none";
      fetchReviews(itemId);
      if (data.average_rating !== undefined)
        updateAverageRatingDisplay(data.average_rating);
    })
    .catch((error) => alert("Error submitting review. Please try again."));
}

function handleAddToFavorites(itemId) {
  getUserIdPromise()
    .then((userId) => {
      if (!userId) return alert("You must be logged in to add to favorites.");

      const mode = getCurrentMode();
      const itemType = mode === "books" ? "Book" : "MovieTV";
      const data = { user_id: userId, item_id: itemId, item_type: itemType };

      fetch("../api/add_to_favorites.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then(handleResponse)
        .then((result) => {
          if (result.success) {
            alert("Added to favorites!");
          } else {
            alert("Failed to add to favorites: " + result.error);
          }
        })
        .catch((error) =>
          alert("An error occurred while adding to favorites.")
        );
    })
    .catch((error) => alert("An error occurred. Please try again.")); // Handle getUserIdPromise error
}

function getUserIdPromise() {
  return (
    userIdPromise ||
    (userIdPromise = new Promise((resolve) => {
      const userId = localStorage.getItem("user_id");
      if (userId) return resolve(userId);

      const intervalId = setInterval(() => {
        const userId = localStorage.getItem("user_id");
        if (userId) {
          clearInterval(intervalId);
          resolve(userId);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(intervalId);
        resolve(null);
      }, 5000);
    }))
  );
}

function handleResponse(response) {
  if (!response.ok) throw new Error(`HTTP error ${response.status}`);
  return response.json();
}

function getListValues(selector) {
  return Array.from(document.querySelectorAll(selector))
    .map((input) => input.value.trim())
    .filter((value) => value);
}

function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return dateString
    ? new Date(dateString).toLocaleDateString("en-US", options)
    : "";
}

function showError(message, btnText, btnLink) {
  document.querySelector("main").innerHTML = `
    <section class="error-state">
      <h3>${message}</h3>
      <p>Please try again later or contact support.</p>
      <a href="${btnLink}" class="btn">${btnText}</a>
    </section>
  `;
}

function displayStars(rating) {
  const starsContainer = document.getElementById("average-stars");
  if (!starsContainer) return;

  starsContainer.innerHTML = "";
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    if (i <= fullStars) {
      star.textContent = "★";
    } else if (i === fullStars + 1 && hasHalfStar) {
      star.textContent = "½";
    } else {
      star.textContent = "☆";
    }
    starsContainer.appendChild(star);
  }
}

function updateAverageRatingDisplay(newAverageRating) {
  const averageRatingElement = document.getElementById("average-rating");
  if (averageRatingElement)
    averageRatingElement.textContent = parseFloat(newAverageRating).toFixed(1);
  displayStars(newAverageRating);
}

function setupLoadMoreReviews() {
  const loadMoreButton = document.getElementById("load-more-reviews");
  if (!loadMoreButton) return;

  allReviews = [];
  displayedReviewCount = 2;
  loadMoreButton.style.display = "none";

  loadMoreButton.addEventListener("click", () => {
    displayedReviewCount += 1;
    displayReviews(allReviews.slice(0, displayedReviewCount));
    if (displayedReviewCount >= allReviews.length) {
      loadMoreButton.style.display = "none";
    }
  });
}

function displayReviews(sortBy = "newest") {
  const container = document.getElementById("reviews-container");
  const loadMoreButton = document.getElementById("load-more-reviews");
  container.innerHTML = "";

  if (!allReviews || allReviews.length === 0) {
    container.innerHTML = "<p>No reviews yet. Be the first to review!</p>";
    return;
  }

  let sortedReviews = [...allReviews];

  switch (sortBy) {
    case "newest":
      sortedReviews.sort(
        (a, b) => new Date(b.review_date) - new Date(a.review_date)
      );
      break;
    case "highest":
      sortedReviews.sort((a, b) => b.rating - a.rating);
      break;
    case "lowest":
      sortedReviews.sort((a, b) => a.rating - b.rating);
      break;
  }

  container.innerHTML = sortedReviews.map(createReviewCard).join("");

  if (allReviews.length > 2) {
    loadMoreButton.style.display = "block";
  } else {
    loadMoreButton.style.display = "none";
  }
}
function displaySimilarItems(items) {
  const container = document.getElementById("similar-items-container");
  container.innerHTML = "";

  if (!items || items.length === 0) {
    container.innerHTML = "<p>No similar items found.</p>";
    return;
  }

  const itemsHTML = items
    .map(
      (item) => `
    <a href="../HTML/review.html?id=${item.id}" class="similar-item">
      <img src="${item.image_url}" alt="${item.title}">
      <h4>${item.title}</h4>
    </a>
  `
    )
    .join("");

  container.innerHTML = itemsHTML;
}

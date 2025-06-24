document.addEventListener("DOMContentLoaded", () => {
  const currentMode = getCurrentMode();
  const contentArea = document.getElementById("categories-container");

  setActiveNavLink();

  fetch(`../api/get_items.php?mode=${currentMode}&grouped=true`)
    .then((res) => res.json())
    .then((groupedData) => {
      contentArea.innerHTML = "";

      if (Object.keys(groupedData).length === 0) {
        contentArea.innerHTML = "<p>No content to display.</p>";
        return;
      }

      Object.entries(groupedData).forEach(([category, items]) => {
        const section = document.createElement("section");
        section.classList.add("category-section");

        const title = document.createElement("h2");
        title.textContent =
          category === "uncategorized"
            ? "Uncategorized"
            : category.charAt(0).toUpperCase() + category.slice(1);

        section.appendChild(title);

        const row = document.createElement("div");
        row.classList.add("category-row");

        items.slice(0, 10).forEach((item) => {
          const card = document.createElement("a");
          card.classList.add("item-card");
          card.href = `../HTML/review.html?id=${item.id}`;
          card.innerHTML = `
            <img src="${item.image_url}" alt="${item.title}">
            <p class="item-title">${item.title}</p>
          `;
          row.appendChild(card);
        });

        section.appendChild(row);
        contentArea.appendChild(section);
      });
    })
    .catch((err) => {
      console.error("Failed to load grouped content:", err);
      contentArea.innerHTML = "<p>Error loading content.</p>";
    });
});

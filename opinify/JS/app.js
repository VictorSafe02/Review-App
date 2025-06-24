function getCurrentMode() {
  return localStorage.getItem("opinifyMode") || "movies";
}

function setMode(mode) {
  if (mode === "books" || mode === "movies") {
    localStorage.setItem("opinifyMode", mode);

    window.location.reload();
  } else {
    console.error("Invalid mode specified:", mode);
  }
}

let userIdPromise;

function getUserIdPromise() {
  if (userIdPromise) {
    return userIdPromise;
  }

  userIdPromise = new Promise((resolve) => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      resolve(userId);
    } else {
      const checkInterval = setInterval(() => {
        const userId = localStorage.getItem("user_id");
        if (userId) {
          clearInterval(checkInterval);
          resolve(userId);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(null);
      }, 5000);
    }
  });

  return userIdPromise;
}

function createModeSwitcher(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error("Mode switcher container not found:", containerId);
    return;
  }

  const currentMode = getCurrentMode();

  const switcher = document.createElement("div");
  switcher.className = "mode-switcher";

  const btnBooks = document.createElement("button");
  btnBooks.textContent = "📚 Books";
  btnBooks.dataset.mode = "books";
  if (currentMode === "books") {
    btnBooks.classList.add("active");
  }
  btnBooks.onclick = () => setMode("books");

  const btnMovies = document.createElement("button");
  btnMovies.textContent = "🎬 Movies & TV";
  btnMovies.dataset.mode = "movies";
  if (currentMode === "movies") {
    btnMovies.classList.add("active");
  }
  btnMovies.onclick = () => setMode("movies");

  switcher.appendChild(btnBooks);
  switcher.appendChild(btnMovies);

  container.appendChild(switcher);
}

function getCurrentPageName() {
  const path = window.location.pathname;
  const page = path.split("/").pop();
  return page || "../HTML/home.html";
}

function setActiveNavLink() {
  const currentPage = getCurrentPageName();
  const navLinks = document.querySelectorAll(".site-nav nav a");

  navLinks.forEach((link) => {
    if (link.getAttribute("href").split("/").pop() === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

function checkLoginStatus() {
  return fetch("../api/check_login.php")
    .then((response) => response.json())
    .then((data) => {
      return data.loggedIn;
    })
    .catch((error) => {
      console.error("Error checking login status:", error);
      return false;
    });
}

function updateUIForLoginStatus(loggedIn) {
  const nav = document.querySelector(".site-nav nav");
  const profileLink = nav.querySelector('a[href="../HTML/profile.html"]');
  const loginLink = nav.querySelector('a[href="../HTML/login.html"]');
  const registerLink = nav.querySelector('a[href="../HTML/register.html"]');

  if (loggedIn) {
    profileLink.style.display = "inline-block";
    loginLink.style.display = "none";
    registerLink.style.display = "none";
  } else {
    profileLink.style.display = "none";
    loginLink.style.display = "inline-block";
    registerLink.style.display = "inline-block";
  }
}

(async function init() {
  createModeSwitcher("mode-switcher-container");
  setActiveNavLink();

  const loggedIn = await checkLoginStatus();
  updateUIForLoginStatus(loggedIn);

  if (!loggedIn && getCurrentPageName() === "../HTML/profile.html") {
    window.location.href = "../HTML/login.html";
  }
})();

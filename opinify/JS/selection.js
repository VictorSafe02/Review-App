function navigateAndSetMode(category) {
  localStorage.setItem("opinifyMode", category);

  window.location.href = "./HTML/home.html";
}

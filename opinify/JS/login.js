const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const username_or_email = document.getElementById("username_or_email").value;
  const password = document.getElementById("password").value;

  const formData = new URLSearchParams();
  formData.append("username_or_email", username_or_email);
  formData.append("password", password);

  fetch("../api/login.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        loginMessage.textContent = data.error;
        loginMessage.style.color = "red";
      } else {
        loginMessage.textContent = data.message;
        loginMessage.style.color = "green";

        if (data.user_id) {
          localStorage.setItem("user_id", data.user_id);
        } else {
          console.error(
            "Login successful, but user_id not received from server."
          );
        }

        window.location.href = "../HTML/home.html";
      }
    })
    .catch((error) => {
      console.error("Login error:", error);
      loginMessage.textContent = "Login failed. Please try again.";
      loginMessage.style.color = "red";
    });
});

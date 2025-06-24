const registerForm = document.getElementById("register-form");
const registerMessage = document.getElementById("register-message");

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("email", email);
  formData.append("password", password);

  fetch("../api/register.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        registerMessage.textContent = data.error;
        registerMessage.style.color = "red";
      } else {
        registerMessage.textContent = data.message;
        registerMessage.style.color = "green";

        window.location.href = "../HTML/login.html";
      }
    })
    .catch((error) => {
      console.error("Registration error:", error);
      registerMessage.textContent = "Registration failed. Please try again.";
      registerMessage.style.color = "red";
    });
});

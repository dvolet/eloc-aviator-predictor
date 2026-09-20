document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const message = document.getElementById("registerMessage");
  const button = document.getElementById("registerButton");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    message.hidden = true;
    message.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword =
      document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      message.textContent = "Passwords do not match.";
      message.hidden = false;
      return;
    }

    button.disabled = true;
    button.textContent = "Creating Account...";

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Registration failed"
        );
      }

      window.location.href = "/";
    } catch (error) {
      message.textContent =
        error instanceof Error
          ? error.message
          : "Registration failed";

      message.hidden = false;

      button.disabled = false;
      button.textContent = "Create Account";
    }
  });
});

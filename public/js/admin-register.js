document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("adminRegisterForm");
  const message = document.getElementById("adminRegisterMessage");
  const button = document.getElementById("adminRegisterButton");

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
    button.textContent = "Creating Administrator...";

    try {
      const token = localStorage.getItem("eloc_session_token");

      if (!token) {
        window.location.href = "/";
        return;
      }

      const response = await fetch(
        "/api/auth/admin-register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("eloc_session_token");
        window.location.href = "/";
        return;
      }

      if (response.status === 403) {
        throw new Error(
          "Administrator access is required."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error || "Admin registration failed"
        );
      }

      window.location.href = "/admin.html";
    } catch (error) {
      message.textContent =
        error instanceof Error
          ? error.message
          : "Admin registration failed";

      message.hidden = false;

      button.disabled = false;
      button.textContent = "Create Administrator";
    }
  });
});

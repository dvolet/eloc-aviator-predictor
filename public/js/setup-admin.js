/**
 * 20.44 Initial Administrator Setup
 * ---------------------------------
 */

const form =
  document.getElementById(
    "setupAdminForm"
  );

const message =
  document.getElementById(
    "setupMessage"
  );

const button =
  document.getElementById(
    "setupButton"
  );

function showMessage(
  text,
  isError = true
) {
  message.textContent = text;

  message.style.color =
    isError
      ? "#ff6b6b"
      : "#4ade80";
}

form.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    const email =
      document
        .getElementById("email")
        .value
        .trim();

    const password =
      document
        .getElementById("password")
        .value;

    const confirmPassword =
      document
        .getElementById(
          "confirmPassword"
        )
        .value;

    if (
      password !==
      confirmPassword
    ) {
      showMessage(
        "Passwords do not match."
      );

      return;
    }

    button.disabled = true;
    button.textContent =
      "Creating Administrator...";

    showMessage(
      "",
      false
    );

    try {
      const response =
        await fetch(
          "/api/auth/setup-admin",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              email,
              password
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        showMessage(
          data.error ||
            "Administrator setup failed."
        );

        return;
      }

      showMessage(
        "Administrator created successfully. Redirecting to login...",
        false
      );

      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
    } catch {
      showMessage(
        "Unable to connect to the server."
      );
    } finally {
      button.disabled = false;
      button.textContent =
        "Create Administrator";
    }
  }
);

// 22.26 Administrator Login JavaScript
// -------------------------------------

// 01. Configuration

const SESSION_TOKEN_KEY =
  "eloc_session_token";

// 02. DOM References

const adminLoginForm =
  document.getElementById(
    "adminLoginForm"
  );

const adminEmailInput =
  document.getElementById(
    "adminEmail"
  );

const adminPasswordInput =
  document.getElementById(
    "adminPassword"
  );

const adminLoginButton =
  document.getElementById(
    "adminLoginButton"
  );

const adminLoginError =
  document.getElementById(
    "adminLoginError"
  );

// 03. Error Display

function showError(
  message
) {
  adminLoginError.textContent =
    message;

  adminLoginError.hidden =
    false;
}

// 04. Hide Error

function hideError() {
  adminLoginError.textContent =
    "";

  adminLoginError.hidden =
    true;
}

// 05. Administrator Login

async function loginAsAdministrator(
  email,
  password
) {
  const response =
    await fetch(
      "/api/auth/login",
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
    throw new Error(
      data.error ||
      "Authentication failed"
    );
  }

  if (
    !data.user ||
    data.user.role !== "admin"
  ) {
    throw new Error(
      "Administrator access is required."
    );
  }

  if (
    !data.session ||
    typeof data.session.token !==
      "string"
  ) {
    throw new Error(
      "Authentication session was not returned"
    );
  }

  return data;
}

// 06. Form Submission

adminLoginForm.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    hideError();

    const email =
      adminEmailInput.value.trim();

    const password =
      adminPasswordInput.value;

    if (!email || !password) {
      showError(
        "Email and password are required."
      );

      return;
    }

    adminLoginButton.disabled =
      true;

    adminLoginButton.textContent =
      "Signing in...";

    try {
      const data =
        await loginAsAdministrator(
          email,
          password
        );

      localStorage.setItem(
        SESSION_TOKEN_KEY,
        data.session.token
      );

      window.location.replace(
        "/admin.html"
      );
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Unable to log in."
      );

      adminLoginButton.disabled =
        false;

      adminLoginButton.textContent =
        "Administrator Login";
    }
  }
);

// 07. Back-Button Protection

window.addEventListener(
  "pageshow",
  () => {
    if (
      localStorage.getItem(
        SESSION_TOKEN_KEY
      )
    ) {
      window.location.replace(
        "/admin.html"
      );
    }
  }
);

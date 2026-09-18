// 13.56 Login JavaScript
// ---------------------

// 01. Configuration

const SESSION_TOKEN_KEY =
  "eloc_session_token";

// 02. DOM References

const loginForm =
  document.getElementById(
    "loginForm"
  );

const emailInput =
  document.getElementById(
    "email"
  );

const passwordInput =
  document.getElementById(
    "password"
  );

const loginButton =
  document.getElementById(
    "loginButton"
  );

const loginError =
  document.getElementById(
    "loginError"
  );

// 03. Redirect Existing Session

const existingToken =
  localStorage.getItem(
    SESSION_TOKEN_KEY
  );

if (existingToken) {
  window.location.href =
    "/dashboard.html";
}

// 04. Display Error

function showError(
  message
) {
  loginError.textContent =
    message;

  loginError.hidden =
    false;
}

// 05. Hide Error

function hideError() {
  loginError.textContent =
    "";

  loginError.hidden =
    true;
}

// 06. Login Request

async function login(
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

// 07. Form Submission

loginForm.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    hideError();

    const email =
      emailInput.value.trim();

    const password =
      passwordInput.value;

    if (!email || !password) {
      showError(
        "Email and password are required."
      );

      return;
    }

    loginButton.disabled =
      true;

    loginButton.textContent =
      "Logging in...";

    try {
      const data =
        await login(
          email,
          password
        );

      localStorage.setItem(
        SESSION_TOKEN_KEY,
        data.session.token
      );

      if (data.user && data.user.role === "admin") {
        window.location.href =
          "/admin.html";
      } else {
        window.location.href =
          "/dashboard.html";
      }
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Unable to log in."
      );

      loginButton.disabled =
        false;

      loginButton.textContent =
        "Login";
    }
  }
);

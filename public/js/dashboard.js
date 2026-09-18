// 13.42 Dashboard JavaScript
// -------------------------

// 01. Configuration

const API_BASE =
  "/api";

const SESSION_TOKEN_KEY =
  "eloc_session_token";

// 02. DOM References

const userEmailElement =
  document.getElementById(
    "userEmail"
  );

const welcomeMessageElement =
  document.getElementById(
    "welcomeMessage"
  );

const accuracyValueElement =
  document.getElementById(
    "accuracyValue"
  );

const predictionCountElement =
  document.getElementById(
    "predictionCount"
  );

const correctCountElement =
  document.getElementById(
    "correctCount"
  );

const confidenceValueElement =
  document.getElementById(
    "confidenceValue"
  );

const averageErrorValueElement =
  document.getElementById(
    "averageErrorValue"
  );

const averagePercentageErrorValueElement =
  document.getElementById(
    "averagePercentageErrorValue"
  );

const predictionsTableElement =
  document.getElementById(
    "predictionsTable"
  );

const roundsGridElement =
  document.getElementById(
    "roundsGrid"
  );

const logoutButton =
  document.getElementById(
    "logoutButton"
  );

// 03. Session Token

function getSessionToken() {
  return localStorage.getItem(
    SESSION_TOKEN_KEY
  );
}

// 04. Authentication Check

function requireSessionToken() {
  const token =
    getSessionToken();

  if (!token) {
    window.location.href =
      "/";
    return null;
  }

  return token;
}

// 05. API Request

async function apiRequest(
  endpoint,
  options = {}
) {
  const token =
    requireSessionToken();

  if (!token) {
    throw new Error(
      "Authentication required"
    );
  }

  const response =
    await fetch(
      `${API_BASE}${endpoint}`,
      {
        ...options,
        headers: {
          "Content-Type":
            "application/json",
          ...(options.headers || {}),
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
      "Request failed"
    );
  }

  return data;
}

// 06. Format Percentage

function formatPercentage(
  value
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return `${value.toFixed(2)}%`;
}

// 07. Format Multiplier

function formatMultiplier(
  value
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return `${value.toFixed(2)}x`;
}

// 08. Render User

function renderUser(
  user
) {
  userEmailElement.textContent =
    user.email;

  welcomeMessageElement.textContent =
    `Welcome back, ${user.email}.`;
}

// 09. Render Accuracy

function renderAccuracy(
  accuracy
) {
  if (!accuracy) {
    accuracyValueElement.textContent =
      "No data";

    predictionCountElement.textContent =
      "0";

    correctCountElement.textContent =
      "0";

    confidenceValueElement.textContent =
      "—";

    return;
  }

  accuracyValueElement.textContent =
    formatPercentage(
      accuracy.accuracyPercentage
    );

  predictionCountElement.textContent =
    String(
      accuracy.totalPredictions
    );

  correctCountElement.textContent =
    String(
      accuracy.correctPredictions
    );

  confidenceValueElement.textContent =
    formatPercentage(
      accuracy.averageConfidence *
        100
    );

  averageErrorValueElement.textContent =
    typeof accuracy.averageError ===
    "number"
      ? accuracy.averageError.toFixed(3)
      : "—";

  averagePercentageErrorValueElement.textContent =
    formatPercentage(
      accuracy.averagePercentageError
    );
}

// 10. Render Prediction Status

function renderPredictionStatus(
  predictions
) {
  const correctElement =
    document.getElementById(
      "statusCorrectCount"
    );

  const incorrectElement =
    document.getElementById(
      "statusIncorrectCount"
    );

  const pendingElement =
    document.getElementById(
      "statusPendingCount"
    );

  if (
    !correctElement ||
    !incorrectElement ||
    !pendingElement
  ) {
    return;
  }

  let correct = 0;
  let incorrect = 0;
  let pending = 0;

  if (Array.isArray(predictions)) {
    predictions.forEach(
      (prediction) => {
        if (prediction.is_correct === 1) {
          correct++;
        } else if (
          prediction.is_correct === 0
        ) {
          incorrect++;
        } else {
          pending++;
        }
      }
    );
  }

  correctElement.textContent =
    String(correct);

  incorrectElement.textContent =
    String(incorrect);

  pendingElement.textContent =
    String(pending);
}

// 11. Render Predictions

function renderPredictions(
  predictions
) {
  if (
    !predictions ||
    predictions.length === 0
  ) {
    predictionsTableElement.innerHTML =
      `
        <tr>
          <td colspan="6">
            No predictions available.
          </td>
        </tr>
      `;

    return;
  }

  predictionsTableElement.innerHTML =
    predictions
      .map(
        (prediction) => {
          const status =
            prediction.is_correct === 1
              ? "Correct"
              : prediction.is_correct === 0
                ? "Incorrect"
                : "Pending";

          const statusClass =
            prediction.is_correct === 1
              ? "status-correct"
              : prediction.is_correct === 0
                ? "status-incorrect"
                : "";

          const confidence =
            typeof prediction.confidence ===
            "number"
              ? formatPercentage(
                  prediction.confidence * 100
                )
              : "—";

          return `
            <tr>
              <td>${prediction.id}</td>
              <td>${prediction.model_name}</td>
              <td>
                ${formatMultiplier(
                  prediction.predicted_multiplier
                )}
              </td>
              <td>
                ${formatMultiplier(
                  prediction.actual_multiplier
                )}
              </td>
              <td>${confidence}</td>
              <td class="${statusClass}">
                ${status}
              </td>
            </tr>
          `;
        }
      )
      .join("");
}

// 11. Render Rounds

function renderRounds(
  rounds
) {
  if (
    !rounds ||
    rounds.length === 0
  ) {
    roundsGridElement.innerHTML =
      `
        <div class="loading">
          No rounds available.
        </div>
      `;

    return;
  }

  roundsGridElement.innerHTML =
    rounds
      .map(
        (round) => `
          <div class="round-card">
            <span class="round-multiplier">
              ${formatMultiplier(
                round.multiplier
              )}
            </span>

            <span class="round-id">
              Round #${round.id}
            </span>
          </div>
        `
      )
      .join("");
}

// 12. Load Dashboard

async function loadDashboard() {
  try {
    const data =
      await apiRequest(
        "/dashboard"
      );

    const dashboard =
      data.dashboard;

    renderUser(
      dashboard.user
    );

    renderAccuracy(
      dashboard.accuracy
    );

    renderPredictionStatus(
      dashboard.recentPredictions
    );

    renderPredictions(
      dashboard.recentPredictions
    );

    renderRounds(
      dashboard.recentRounds
    );
  } catch (error) {
    console.error(
      "Dashboard loading error:",
      error
    );

    welcomeMessageElement.textContent =
      error instanceof Error
        ? error.message
        : "Unable to load dashboard.";

    if (
      error instanceof Error &&
      error.message.toLowerCase()
        .includes("authentication")
    ) {
      localStorage.removeItem(
        SESSION_TOKEN_KEY
      );

      window.location.href =
        "/";
    }
  }
}

// 13. Logout

async function logout() {
  const token =
    getSessionToken();

  if (!token) {
    window.location.href =
      "/";

    return;
  }

  try {
    await fetch(
      `${API_BASE}/auth/logout`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${token}`
        }
      }
    );
  } catch (error) {
    console.error(
      "Logout request failed:",
      error
    );
  } finally {
    localStorage.removeItem(
      SESSION_TOKEN_KEY
    );

    window.location.href =
      "/";
  }
}

// 14. Event Handlers

logoutButton.addEventListener(
  "click",
  logout
);

// 15. Initialize Dashboard

loadDashboard();

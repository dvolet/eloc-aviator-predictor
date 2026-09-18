// 15.06 Admin Dashboard JavaScript
// --------------------------------

const API_BASE = "/api";
const SESSION_TOKEN_KEY = "eloc_session_token";

const adminConnectionStatusElement =
  document.getElementById(
    "adminConnectionStatus"
  );

const adminWelcomeElement =
  document.getElementById(
    "adminWelcome"
  );

const totalUsersElement =
  document.getElementById(
    "totalUsers"
  );

const activeUsersElement =
  document.getElementById(
    "activeUsers"
  );

const adminUsersElement =
  document.getElementById(
    "adminUsers"
  );

const auditEventsElement =
  document.getElementById(
    "auditEvents"
  );

const performanceWarningElement =
  document.getElementById(
    "performanceWarning"
  );

const performanceTotalElement =
  document.getElementById(
    "performanceTotal"
  );

const performanceAccuracyElement =
  document.getElementById(
    "performanceAccuracy"
  );

const performanceAverageErrorElement =
  document.getElementById(
    "performanceAverageError"
  );

const performanceAverageConfidenceElement =
  document.getElementById(
    "performanceAverageConfidence"
  );

const performanceTableBody =
  document.getElementById(
    "performanceTableBody"
  );

const refreshPerformanceButton =
  document.getElementById(
    "refreshPerformanceButton"
  );

const trendMessageElement =
  document.getElementById(
    "trendMessage"
  );

const trendTableBody =
  document.getElementById(
    "trendTableBody"
  );

const refreshTrendButton =
  document.getElementById(
    "refreshTrendButton"
  );

const confidenceMessageElement =
  document.getElementById(
    "confidenceMessage"
  );

const confidenceTableBody =
  document.getElementById(
    "confidenceTableBody"
  );

const refreshConfidenceButton =
  document.getElementById(
    "refreshConfidenceButton"
  );

const usersTableBody =
  document.getElementById(
    "usersTableBody"
  );

const auditTableBody =
  document.getElementById(
    "auditTableBody"
  );

const usersMessageElement =
  document.getElementById(
    "usersMessage"
  );

const refreshUsersButton =
  document.getElementById(
    "refreshUsersButton"
  );

const refreshAuditButton =
  document.getElementById(
    "refreshAuditButton"
  );

const liveButton =
  document.getElementById(
    "liveButton"
  );

const logoutButton =
  document.getElementById(
    "logoutButton"
  );

// 01. Authentication
// ------------------

function getSessionToken() {
  return localStorage.getItem(
    SESSION_TOKEN_KEY
  );
}

function requireSessionToken() {
  const token =
    getSessionToken();

  if (!token) {
    window.location.href = "/";
    return null;
  }

  return token;
}

// 02. API Request
// ---------------

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

  const headers = {
    Authorization:
      `Bearer ${token}`,
    ...(options.headers || {})
  };

  if (options.body) {
    headers["Content-Type"] =
      "application/json";
  }

  const response =
    await fetch(
      `${API_BASE}${endpoint}`,
      {
        ...options,
        headers
      }
    );

  let data;

  try {
    data =
      await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    if (
      response.status === 401 ||
      response.status === 403
    ) {
      throw new Error(
        data.error ||
        "Administrator access required."
      );
    }

    throw new Error(
      data.error ||
      "Unable to complete admin request."
    );
  }

  return data;
}

// 03. Connection Status
// ---------------------

function setAdminConnectionStatus(
  connected
) {
  adminConnectionStatusElement.textContent =
    connected
      ? "Connected"
      : "Disconnected";
}

// 04. HTML Escaping
// -----------------

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// 05. User Summary
// ----------------

function renderUserSummary(users) {
  const safeUsers =
    Array.isArray(users)
      ? users
      : [];

  const activeUsers =
    safeUsers.filter(
      (user) =>
        Boolean(user.isActive)
    );

  const administratorUsers =
    safeUsers.filter(
      (user) =>
        user.role === "admin"
    );

  totalUsersElement.textContent =
    String(safeUsers.length);

  activeUsersElement.textContent =
    String(activeUsers.length);

  adminUsersElement.textContent =
    String(administratorUsers.length);
}

// 06. Render Users
// ----------------

function renderUsers(users) {
  if (
    !Array.isArray(users) ||
    users.length === 0
  ) {
    usersTableBody.innerHTML = `
      <tr>
        <td
          colspan="5"
          class="empty-state"
        >
          No users found.
        </td>
      </tr>
    `;

    return;
  }

  usersTableBody.innerHTML =
    users
      .map((user) => {
        const isActive =
          Boolean(user.isActive);

        const role =
          user.role === "admin"
            ? "admin"
            : "user";

        return `
          <tr>

            <td>
              ${escapeHtml(user.id)}
            </td>

            <td>
              ${escapeHtml(user.email)}
            </td>

            <td>
              <span class="role-badge">
                ${escapeHtml(role)}
              </span>
            </td>

            <td>
              <span
                class="
                  status-badge
                  ${
                    isActive
                      ? "status-active"
                      : "status-inactive"
                  }
                "
              >
                ${
                  isActive
                    ? "Active"
                    : "Inactive"
                }
              </span>
            </td>

            <td>

              <div class="user-actions">

                <button
                  type="button"
                  data-action="toggle-status"
                  data-user-id="${escapeHtml(user.id)}"
                  data-active="${isActive}"
                >
                  ${
                    isActive
                      ? "Deactivate"
                      : "Activate"
                  }
                </button>

                <button
                  type="button"
                  data-action="toggle-role"
                  data-user-id="${escapeHtml(user.id)}"
                  data-role="${escapeHtml(role)}"
                >
                  ${
                    role === "admin"
                      ? "Make User"
                      : "Make Admin"
                  }
                </button>

                <button
                  type="button"
                  class="danger"
                  data-action="delete-user"
                  data-user-id="${escapeHtml(user.id)}"
                >
                  Delete
                </button>

              </div>

            </td>

          </tr>
        `;
      })
      .join("");
}

// 07. Load Users
// --------------

async function loadUsers() {
  usersMessageElement.textContent =
    "Loading users...";

  try {
    const data =
      await apiRequest(
        "/admin/users"
      );

    const users =
      data.users || [];

    renderUserSummary(users);
    renderUsers(users);

    usersMessageElement.textContent =
      `${users.length} user(s) loaded.`;
  } catch (error) {
    usersTableBody.innerHTML = `
      <tr>
        <td
          colspan="5"
          class="empty-state error-state"
        >
          Unable to load users.
        </td>
      </tr>
    `;

    usersMessageElement.textContent =
      error instanceof Error
        ? error.message
        : "Unable to load users.";

    setAdminConnectionStatus(false);
  }
}

// 16.17 Load Performance Monitoring
// ----------------------------------

function formatPerformanceNumber(value, decimals = 2) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return value.toFixed(decimals);
}

function renderPerformanceMonitoring(data) {
  const overall = data?.overall;
  const models = Array.isArray(data?.models)
    ? data.models
    : [];

  if (!overall) {
    throw new Error(
      "Performance monitoring data is unavailable."
    );
  }

  performanceTotalElement.textContent =
    String(overall.totalEvaluated ?? 0);

  performanceAccuracyElement.textContent =
    `${formatPerformanceNumber(
      overall.accuracyPercentage,
      1
    )}%`;

  performanceAverageErrorElement.textContent =
    formatPerformanceNumber(
      overall.averageError,
      3
    );

  performanceAverageConfidenceElement.textContent =
    overall.averageConfidence === null
      ? "—"
      : `${formatPerformanceNumber(
          overall.averageConfidence * 100,
          1
        )}%`;

  performanceWarningElement.textContent =
    overall.sampleSizeWarning ||
    "Performance sample size is sufficient for this monitoring view.";

  if (models.length === 0) {
    performanceTableBody.innerHTML = `
      <tr>
        <td colspan="6">
          No model performance data available.
        </td>
      </tr>
    `;

    return;
  }

  performanceTableBody.innerHTML =
    models
      .map(
        (model) => `
          <tr>
            <td>
              ${escapeHtml(model.modelName ?? "—")}
            </td>

            <td>
              ${escapeHtml(
                model.totalEvaluated ?? "0"
              )}
            </td>

            <td>
              ${escapeHtml(
                model.correctCount ?? "0"
              )}
            </td>

            <td>
              ${escapeHtml(
                model.incorrectCount ?? "0"
              )}
            </td>

            <td>
              ${escapeHtml(
                `${formatPerformanceNumber(
                  model.accuracyPercentage,
                  1
                )}%`
              )}
            </td>

            <td>
              ${escapeHtml(
                formatPerformanceNumber(
                  model.averageError,
                  3
                )
              )}
            </td>
          </tr>
        `
      )
      .join("");
}

async function loadPerformanceMonitoring() {
  try {
    const data =
      await apiRequest(
        "/admin/performance-monitoring"
      );

    renderPerformanceMonitoring(data);

    return true;
  } catch (error) {
    performanceWarningElement.textContent =
      error instanceof Error
        ? error.message
        : "Unable to load performance monitoring.";

    performanceTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="error-state">
          Unable to load performance monitoring.
        </td>
      </tr>
    `;

    console.error(
      "Performance monitoring loading error:",
      error
    );

    return false;
  }
}

// 16.26 Load Performance Trend
// ----------------------------

async function loadPerformanceTrend() {
  try {
    const data =
      await apiRequest(
        "/models/performance-over-time"
      );

    const performance =
      Array.isArray(data.performance)
        ? data.performance
        : [];

    if (performance.length === 0) {
      trendMessageElement.textContent =
        "No evaluated prediction trend data available.";

      trendTableBody.innerHTML = `
        <tr>
          <td colspan="7">
            No performance data available.
          </td>
        </tr>
      `;

      return true;
    }

    trendMessageElement.textContent =
      `${performance.length} evaluated prediction${
        performance.length === 1 ? "" : "s"
      } recorded.`;

    trendTableBody.innerHTML =
      performance
        .map(
          (point) => `
            <tr>
              <td>
                ${escapeHtml(
                  point.predictionId ?? "—"
                )}
              </td>

              <td>
                ${escapeHtml(
                  point.modelName ?? "—"
                )}
              </td>

              <td>
                ${escapeHtml(
                  `${formatPerformanceNumber(
                    point.predictedMultiplier,
                    2
                  )}x`
                )}
              </td>

              <td>
                ${escapeHtml(
                  `${formatPerformanceNumber(
                    point.actualMultiplier,
                    2
                  )}x`
                )}
              </td>

              <td>
                ${escapeHtml(
                  formatPerformanceNumber(
                    point.error,
                    3
                  )
                )}
              </td>

              <td>
                ${point.isCorrect
                  ? "Correct"
                  : "Incorrect"}
              </td>

              <td>
                ${escapeHtml(
                  `${formatPerformanceNumber(
                    point.cumulativeAccuracyPercentage,
                    1
                  )}%`
                )}
              </td>
            </tr>
          `
        )
        .join("");

    return true;
  } catch (error) {
    trendMessageElement.textContent =
      error instanceof Error
        ? error.message
        : "Unable to load performance trend.";

    trendTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="error-state">
          Unable to load performance trend.
        </td>
      </tr>
    `;

    console.error(
      "Performance trend loading error:",
      error
    );

    return false;
  }
}

// 16.34 Load Confidence Performance
// ----------------------------------

async function loadConfidencePerformance() {
  try {
    const data =
      await apiRequest(
        "/accuracy/confidence"
      );

    const results =
      Array.isArray(data.confidenceAccuracy)
        ? data.confidenceAccuracy
        : [];

    if (results.length === 0) {
      confidenceMessageElement.textContent =
        "No confidence performance data available.";

      confidenceTableBody.innerHTML = `
        <tr>
          <td colspan="5">
            No confidence data available.
          </td>
        </tr>
      `;

      return true;
    }

    confidenceMessageElement.textContent =
      "Confidence performance calculated from evaluated predictions.";

    confidenceTableBody.innerHTML =
      results
        .map(
          (result) => `
            <tr>
              <td>
                ${escapeHtml(
                  result.confidenceLevel ?? "—"
                )}
              </td>

              <td>
                ${escapeHtml(
                  result.totalPredictions ?? "0"
                )}
              </td>

              <td>
                ${escapeHtml(
                  result.correctPredictions ?? "0"
                )}
              </td>

              <td>
                ${escapeHtml(
                  result.incorrectPredictions ?? "0"
                )}
              </td>

              <td>
                ${escapeHtml(
                  `${formatPerformanceNumber(
                    result.accuracyPercentage,
                    1
                  )}%`
                )}
              </td>
            </tr>
          `
        )
        .join("");

    return true;
  } catch (error) {
    confidenceMessageElement.textContent =
      error instanceof Error
        ? error.message
        : "Unable to load confidence performance.";

    confidenceTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="error-state">
          Unable to load confidence performance.
        </td>
      </tr>
    `;

    console.error(
      "Confidence performance loading error:",
      error
    );

    return false;
  }
}

// 08. Load Audit Logs
// -------------------

async function loadAuditLogs() {
  try {
    const data =
      await apiRequest(
        "/admin/audit-logs?limit=100"
      );

    const logs =
      data.logs || [];

    auditEventsElement.textContent =
      String(
        data.count ??
        logs.length
      );

    if (
      !Array.isArray(logs) ||
      logs.length === 0
    ) {
      auditTableBody.innerHTML = `
        <tr>
          <td
            colspan="5"
            class="empty-state"
          >
            No audit events found.
          </td>
        </tr>
      `;

      return;
    }

    auditTableBody.innerHTML =
      logs
        .map(
          (log) => `
            <tr>

              <td>
                ${escapeHtml(log.id)}
              </td>

              <td>
                ${escapeHtml(
                  log.userId ?? "—"
                )}
              </td>

              <td>
                ${escapeHtml(
                  log.eventType ?? "—"
                )}
              </td>

              <td>
                ${escapeHtml(
                  log.eventMessage ?? "—"
                )}
              </td>

              <td>
                ${escapeHtml(
                  log.createdAt ?? "—"
                )}
              </td>

            </tr>
          `
        )
        .join("");

  } catch (error) {
    auditTableBody.innerHTML = `
      <tr>
        <td
          colspan="5"
          class="empty-state error-state"
        >
          Unable to load audit activity.
        </td>
      </tr>
    `;

    auditEventsElement.textContent =
      "—";

    console.error(
      "Audit log loading error:",
      error
    );
  }
}

// 09. Load Administrator
// ----------------------

async function loadAdministrator() {
  try {
    const data =
      await apiRequest(
        "/admin/test"
      );

    const user =
      data.user;

    if (user) {
      adminWelcomeElement.textContent =
        `Signed in as ${user.email}`;
    } else {
      adminWelcomeElement.textContent =
        "Administrator access confirmed.";
    }

    setAdminConnectionStatus(true);

  } catch (error) {
    setAdminConnectionStatus(false);

    adminWelcomeElement.textContent =
      error instanceof Error
        ? error.message
        : "Administrator access required.";

    if (
      error instanceof Error &&
      (
        error.message.includes(
          "Administrator access"
        ) ||
        error.message.includes(
          "Authentication"
        )
      )
    ) {
      window.location.href = "/";
    }
  }
}

// 10. User Actions
// ----------------

async function updateUserStatus(
  userId,
  isActive
) {
  await apiRequest(
    `/admin/users/${userId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        isActive: !isActive
      })
    }
  );

  await loadUsers();
  await loadAuditLogs();
  await loadPerformanceMonitoring();
  await loadPerformanceTrend();
  await loadConfidencePerformance();
}

async function updateUserRole(
  userId,
  currentRole
) {
  const nextRole =
    currentRole === "admin"
      ? "user"
      : "admin";

  await apiRequest(
    `/admin/users/${userId}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({
        role: nextRole
      })
    }
  );

  await loadUsers();
  await loadAuditLogs();
}

async function deleteUserAccount(
  userId
) {
  await apiRequest(
    `/admin/users/${userId}`,
    {
      method: "DELETE"
    }
  );

  await loadUsers();
  await loadAuditLogs();
}

// 11. User Table Events
// ---------------------

usersTableBody.addEventListener(
  "click",
  async (event) => {
    const button =
      event.target.closest(
        "button[data-action]"
      );

    if (!button) {
      return;
    }

    const userId =
      Number(
        button.dataset.userId
      );

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return;
    }

    const action =
      button.dataset.action;

    try {
      button.disabled = true;

      if (
        action ===
        "toggle-status"
      ) {
        const isActive =
          button.dataset.active ===
          "true";

        await updateUserStatus(
          userId,
          isActive
        );
      }

      if (
        action ===
        "toggle-role"
      ) {
        const role =
          button.dataset.role ||
          "user";

        await updateUserRole(
          userId,
          role
        );
      }

      if (
        action ===
        "delete-user"
      ) {
        const confirmed =
          window.confirm(
            `Delete user #${userId}? This action cannot be undone.`
          );

        if (!confirmed) {
          return;
        }

        await deleteUserAccount(
          userId
        );
      }

    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Admin action failed."
      );

    } finally {
      button.disabled = false;
    }
  }
);

// 12. Navigation
// --------------

if (liveButton) {
  liveButton.addEventListener(
    "click",
    () => {
      window.location.href =
        "/live.html";
    }
  );
}

if (refreshUsersButton) {
  refreshUsersButton.addEventListener(
    "click",
    loadUsers
  );
}

if (refreshAuditButton) {
  refreshAuditButton.addEventListener(
    "click",
    loadAuditLogs
  );
}

if (refreshPerformanceButton) {
  refreshPerformanceButton.addEventListener(
    "click",
    loadPerformanceMonitoring
  );
}

if (refreshTrendButton) {
  refreshTrendButton.addEventListener(
    "click",
    loadPerformanceTrend
  );
}

if (refreshConfidenceButton) {
  refreshConfidenceButton.addEventListener(
    "click",
    loadConfidencePerformance
  );
}

// 13. History Navigation Protection
// ---------------------------------

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    const token = getSessionToken();

    if (!token) {
      window.location.replace("/");
    }
  }
});

// 14. Logout
// ----------


if (logoutButton) {
  logoutButton.addEventListener(
    "click",
    async () => {
      try {
        const token =
          getSessionToken();

        if (token) {
          await fetch(
            `${API_BASE}/auth/logout`,
            {
              method: "POST",
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );
        }
      } catch (error) {
        console.error(
          "Logout error:",
          error
        );
      } finally {
        localStorage.removeItem(
          SESSION_TOKEN_KEY
        );

        window.location.href = "/";
      }
    }
  );
}

// 14. Initialize
// --------------

async function initializeAdminDashboard() {
  if (!requireSessionToken()) {
    return;
  }

  await loadAdministrator();
  await loadUsers();
  await loadAuditLogs();
}

initializeAdminDashboard();

// 14.51 Live Prediction Interface JavaScript
// -------------------------------------------

const API_BASE = "/api";
const SESSION_TOKEN_KEY = "eloc_session_token";

const connectionStatusElement =
  document.getElementById("connectionStatus");

const currentMultiplierElement =
  document.getElementById("currentMultiplier");

const roundStateElement =
  document.getElementById("roundState");

const predictedMultiplierElement =
  document.getElementById("predictedMultiplier");

const predictionConfidenceElement =
  document.getElementById("predictionConfidence");

const predictionModelElement =
  document.getElementById("predictionModel");

const predictionStatusElement =
  document.getElementById("predictionStatus");

const liveRoundsElement =
  document.getElementById("liveRounds");

const sampleSizeElement =
  document.getElementById("sampleSize");

const averageMultiplierElement =
  document.getElementById("averageMultiplier");

const lowestMultiplierElement =
  document.getElementById("lowestMultiplier");

const highestMultiplierElement =
  document.getElementById("highestMultiplier");

const predictionControlStatusElement =
  document.getElementById("predictionControlStatus");

const predictionControlButton =
  document.getElementById("predictionControlButton");

const controlPredictedMultiplierElement =
  document.getElementById("controlPredictedMultiplier");

const controlPredictionConfidenceElement =
  document.getElementById("controlPredictionConfidence");

const controlActualMultiplierElement =
  document.getElementById("controlActualMultiplier");

const controlPredictionErrorElement =
  document.getElementById("controlPredictionError");

const predictionControlMessageElement =
  document.getElementById("predictionControlMessage");

// 01. Formatting
// --------------

function formatMultiplier(value) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return `${value.toFixed(2)}x`;
}

function formatPercentage(value) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return `${value.toFixed(1)}%`;
}

// 02. Authentication
// ------------------

function getSessionToken() {
  return localStorage.getItem(
    SESSION_TOKEN_KEY
  );
}

function requireSessionToken() {
  const token = getSessionToken();

  if (!token) {
    window.location.href = "/";
    return null;
  }

  return token;
}

// 03. API Request
// ---------------

async function apiRequest(endpoint) {
  const token = requireSessionToken();

  if (!token) {
    throw new Error(
      "Authentication required"
    );
  }

  const response = await fetch(
    `${API_BASE}${endpoint}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
      "Unable to retrieve live data."
    );
  }

  return data;
}

// 04. Connection Status
// ---------------------

function setConnectionStatus(connected) {
  connectionStatusElement.textContent =
    connected
      ? "Connected"
      : "Disconnected";
}

// 05. Render Recorded Rounds
// --------------------------

function renderRounds(rounds) {
  if (
    !Array.isArray(rounds) ||
    rounds.length === 0
  ) {
    liveRoundsElement.innerHTML = `
      <div class="loading">
        No round data available.
      </div>
    `;

    return;
  }

  const latestRound = rounds[0];

  currentMultiplierElement.textContent =
    formatMultiplier(
      Number(latestRound.multiplier)
    );

  roundStateElement.textContent =
    `Latest recorded round #${latestRound.id}`;

  liveRoundsElement.innerHTML =
    rounds
      .map(
        (round) => `
          <div class="round-item">
            <strong>
              ${formatMultiplier(
                Number(round.multiplier)
              )}
            </strong>

            <span>
              Round #${round.id}
            </span>
          </div>
        `
      )
      .join("");
}

// 06. Render Statistical Information
// ----------------------------------

function renderStatistics(rounds) {
  if (
    !Array.isArray(rounds) ||
    rounds.length === 0
  ) {
    sampleSizeElement.textContent = "0";
    averageMultiplierElement.textContent = "—";
    lowestMultiplierElement.textContent = "—";
    highestMultiplierElement.textContent = "—";

    return;
  }

  const values =
    rounds
      .map(
        (round) =>
          Number(round.multiplier)
      )
      .filter(
        (value) =>
          Number.isFinite(value)
      );

  if (values.length === 0) {
    sampleSizeElement.textContent = "0";
    averageMultiplierElement.textContent = "—";
    lowestMultiplierElement.textContent = "—";
    highestMultiplierElement.textContent = "—";

    return;
  }

  const total =
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  const average =
    total / values.length;

  sampleSizeElement.textContent =
    String(values.length);

  averageMultiplierElement.textContent =
    formatMultiplier(average);

  lowestMultiplierElement.textContent =
    formatMultiplier(
      Math.min(...values)
    );

  highestMultiplierElement.textContent =
    formatMultiplier(
      Math.max(...values)
    );
}

// 07. Prediction Placeholder
// --------------------------

function renderPredictionPlaceholder() {
  predictedMultiplierElement.textContent =
    "—";

  predictionConfidenceElement.textContent =
    "—";

  predictionModelElement.textContent =
    "Awaiting model";

  predictionStatusElement.textContent =
    "Waiting";
}

// 08. Realtime Round State
// ------------------------

function handleRoundStarted(event) {
  if (!event.roundId) {
    return;
  }

  currentMultiplierElement.textContent =
    formatMultiplier(1);

  roundStateElement.textContent =
    `Round ${event.roundId} started.`;

  predictionStatusElement.textContent =
    "Waiting";

  predictedMultiplierElement.textContent =
    "—";

  predictionConfidenceElement.textContent =
    "—";

  predictionModelElement.textContent =
    "Awaiting model";
}

function handleMultiplierUpdated(event) {
  if (
    typeof event.multiplier !== "number" ||
    !Number.isFinite(event.multiplier)
  ) {
    return;
  }

  currentMultiplierElement.textContent =
    formatMultiplier(
      event.multiplier
    );

  roundStateElement.textContent =
    `Round ${event.roundId} is running.`;
}

function handleRoundCrashed(event) {
  if (
    typeof event.multiplier === "number" &&
    Number.isFinite(event.multiplier)
  ) {
    currentMultiplierElement.textContent =
      formatMultiplier(
        event.multiplier
      );
  }

  roundStateElement.textContent =
    `Round ${event.roundId} crashed.`;
}

// 09. Prediction Control Center
// ----------------------------

function setPredictionControlMessage(message) {
  if (predictionControlMessageElement) {
    predictionControlMessageElement.textContent = message;
  }
}

function renderPredictionControlState(state) {
  if (!predictionControlStatusElement ||
      !predictionControlButton) {
    return;
  }

  if (!state || !state.session) {
    predictionControlStatusElement.textContent = "READY";
    predictionControlButton.textContent = "START PREDICTION";
    predictionControlButton.disabled = false;

    controlPredictedMultiplierElement.textContent = "—";
    controlPredictionConfidenceElement.textContent = "—";
    controlActualMultiplierElement.textContent = "—";
    controlPredictionErrorElement.textContent = "—";

    setPredictionControlMessage(
      "Ready to start a prediction session."
    );

    return;
  }

  const session = state.session;
  const prediction = state.prediction;
  const result = state.result;

  controlPredictedMultiplierElement.textContent =
    prediction
      ? formatMultiplier(Number(prediction.predicted_multiplier))
      : "—";

  controlPredictionConfidenceElement.textContent =
    prediction &&
    typeof prediction.confidence === "number"
      ? formatPercentage(prediction.confidence * 100)
      : "—";

  controlActualMultiplierElement.textContent =
    result
      ? formatMultiplier(Number(result.multiplier))
      : "—";

  controlPredictionErrorElement.textContent =
    result &&
    typeof result.error === "number"
      ? formatMultiplier(Number(result.error))
      : "—";

  if (session.status === "active") {
    predictionControlStatusElement.textContent = "ACTIVE";
    predictionControlButton.textContent = "PREDICTION ACTIVE";
    predictionControlButton.disabled = true;

    setPredictionControlMessage(
      "Prediction session is active."
    );
    return;
  }

  if (session.status === "waiting_result") {
    predictionControlStatusElement.textContent =
      "WAITING FOR RESULT";

    predictionControlButton.textContent =
      "WAITING FOR RESULT";

    predictionControlButton.disabled = true;

    setPredictionControlMessage(
      "Prediction locked. Waiting for the observed round result."
    );
    return;
  }

  if (session.status === "evaluated") {
    predictionControlStatusElement.textContent =
      "EVALUATED";

    predictionControlButton.textContent =
      "START NEXT PREDICTION";

    predictionControlButton.disabled = false;

    const resultText =
      result && result.isCorrect
        ? "Prediction evaluated as correct."
        : "Prediction evaluated against the observed result.";

    setPredictionControlMessage(resultText);
    return;
  }

  if (session.status === "stopped") {
    predictionControlStatusElement.textContent = "STOPPED";
    predictionControlButton.textContent = "START PREDICTION";
    predictionControlButton.disabled = false;

    setPredictionControlMessage(
      "The previous prediction session was stopped."
    );
  }
}

async function loadPredictionControlState() {
  try {
    const data =
      await apiRequest("/prediction-session/control");

    if (data && data.success) {
      renderPredictionControlState(data.state);
    }
  } catch (error) {
    console.error(
      "Prediction control state error:",
      error
    );
  }
}

async function startPredictionControl() {
  if (!predictionControlButton) {
    return;
  }

  predictionControlButton.disabled = true;
  predictionControlStatusElement.textContent =
    "STARTING";

  setPredictionControlMessage(
    "Starting prediction session..."
  );

  try {
    const data = await fetch(
      `${API_BASE}/prediction-session/start`,
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${requireSessionToken()}`,
          "Content-Type": "application/json"
        }
      }
    ).then(async (response) => {
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
          "Unable to start prediction session."
        );
      }

      return result;
    });

    renderPredictionControlState({
      session: data.session,
      prediction: data.prediction
        ? {
            predicted_multiplier:
              data.prediction.predictedMultiplier,
            confidence:
              data.prediction.confidence,
            model_name:
              data.prediction.modelName
          }
        : null,
      result: null
    });

    setPredictionControlMessage(
      "Prediction locked. Waiting for the observed round result."
    );
  } catch (error) {
    predictionControlButton.disabled = false;
    predictionControlStatusElement.textContent =
      "READY";

    setPredictionControlMessage(
      error instanceof Error
        ? error.message
        : "Unable to start prediction."
    );
  }
}

function initializePredictionControl() {
  if (!predictionControlButton) {
    return;
  }

  predictionControlButton.addEventListener(
    "click",
    startPredictionControl
  );

  loadPredictionControlState();

  window.setInterval(
    loadPredictionControlState,
    2000
  );
}

// 10. Handle Realtime Events
// --------------------------

function handleRealtimeEvent(event) {
  if (!event || !event.type) {
    return;
  }

  if (
    event.type === "CONNECTION_ESTABLISHED"
  ) {
    setConnectionStatus(true);
    return;
  }

  if (
    event.type === "ROUND_STARTED"
  ) {
    handleRoundStarted(event);
    return;
  }

  if (
    event.type === "MULTIPLIER_UPDATED"
  ) {
    handleMultiplierUpdated(event);
    return;
  }

  if (
    event.type === "ROUND_CRASHED"
  ) {
    handleRoundCrashed(event);
  }
}

// 10. Load Live Interface
// ----------------------

async function loadLiveInterface() {
  try {
    setConnectionStatus(false);

    const data =
      await apiRequest("/rounds");

    const rounds =
      data.rounds || [];

    renderRounds(rounds);
    renderStatistics(rounds);
    renderPredictionPlaceholder();
    await loadPredictionControlState();

    setConnectionStatus(true);
  } catch (error) {
    console.error(
      "Live interface loading error:",
      error
    );

    setConnectionStatus(false);

    roundStateElement.textContent =
      error instanceof Error
        ? error.message
        : "Unable to load live data.";
  }
}

// 11. Dashboard Navigation
// ------------------------

const dashboardButton =
  document.getElementById(
    "dashboardButton"
  );

if (dashboardButton) {
  dashboardButton.addEventListener(
    "click",
    async () => {
      const token =
        localStorage.getItem(
          "eloc_session_token"
        );

      if (!token) {
        window.location.href = "/";
        return;
      }

      try {
        const response =
          await fetch(
            "/api/admin/test",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        if (response.ok) {
          window.location.href =
            "/admin.html";
          return;
        }

        if (response.status === 401) {
          localStorage.removeItem(
            "eloc_session_token"
          );
          window.location.href = "/";
          return;
        }

        window.location.href =
          "/dashboard.html";
      } catch {
        window.location.href =
          "/dashboard.html";
      }
    }
  );
}

// 12. WebSocket Connection
// -----------------------

function connectWebSocket() {
  const protocol =
    window.location.protocol === "https:"
      ? "wss:"
      : "ws:";

  const websocketUrl =
    `${protocol}//${window.location.host}/ws`;

  const socket =
    new WebSocket(websocketUrl);

  socket.addEventListener(
    "open",
    () => {
      setConnectionStatus(true);

      roundStateElement.textContent =
        "Real-time connection established.";
    }
  );

  socket.addEventListener(
    "message",
    (event) => {
      try {
        const message =
          JSON.parse(
            event.data
          );

        handleRealtimeEvent(
          message
        );
      } catch (error) {
        console.error(
          "Invalid WebSocket message:",
          error
        );
      }
    }
  );

  socket.addEventListener(
    "close",
    () => {
      setConnectionStatus(false);

      roundStateElement.textContent =
        "Real-time connection closed.";
    }
  );

  socket.addEventListener(
    "error",
    () => {
      setConnectionStatus(false);
    }
  );
}

// 13. Initialize Live Interface
// ----------------------------

loadLiveInterface();
initializePredictionControl();
connectWebSocket();

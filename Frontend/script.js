const API_URL = "https://sentiment-analysis-19y3.onrender.com";

const textarea = document.getElementById("review-text");
const analyzeBtn = document.getElementById("analyze-btn");
const charCount = document.getElementById("char-count");
const errorBox = document.getElementById("error-box");

const resultStrip = document.getElementById("result-strip");
const resultEmoji = document.getElementById("result-emoji");
const resultLabel = document.getElementById("result-label");
const resultConfidence = document.getElementById("result-confidence");
const confidenceFill = document.getElementById("confidence-fill");

textarea.addEventListener("input", () => {
  charCount.textContent = `${textarea.value.length} characters`;
});

analyzeBtn.addEventListener("click", runAnalysis);

textarea.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
    runAnalysis();
  }
});

async function runAnalysis() {
  const text = textarea.value.trim();

  hideError();

  if (!text) {
    showError("Type something first.");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      throw new Error(`Server responded with ${res.status}`);
    }

    const data = await res.json();
    showResult(data);
  } catch (err) {
    console.error(err);
    showError("Couldn't reach the backend. Is it running on port 8000?");
  } finally {
    setLoading(false);
  }
}

function showResult(data) {
  const isPositive = data.sentiment === "positive";
  const confidencePct = Math.round(data.confidence * 100);

  resultStrip.classList.remove("hidden", "negative");
  if (!isPositive) resultStrip.classList.add("negative");

  resultEmoji.textContent = isPositive ? "🙂" : "🙁";
  resultLabel.textContent = data.sentiment.toUpperCase();
  resultConfidence.textContent = `confidence ${confidencePct}%`;
  confidenceFill.style.width = `${confidencePct}%`;
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function hideError() {
  errorBox.classList.add("hidden");
}

function setLoading(isLoading) {
  analyzeBtn.disabled = isLoading;
  analyzeBtn.textContent = isLoading ? "Analyzing…" : "Analyze";
}
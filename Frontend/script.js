const API_URL = "https://sentiment-analysis-19y3.onrender.com/predict";
const textInput = document.getElementById("textInput");
const charCount = document.getElementById("charCount");
const analyzeBtn = document.getElementById("analyzeBtn");
const btnText = document.getElementById("btnText");
const loading = document.getElementById("loading");
const resultSection = document.getElementById("resultSection");
const sentimentText =
    document.getElementById("sentimentText");
const sentimentEmoji =
    document.getElementById("sentimentEmoji");
const sentimentCircle =
    document.getElementById("sentimentCircle");
const sentimentDescription =
    document.getElementById("sentimentDescription");
const confidenceText =
    document.getElementById("confidenceText");
const progressBar =
    document.getElementById("progressBar");
const mobileMenuBtn =
    document.getElementById("mobileMenuBtn");
const mobileNav =
    document.getElementById("mobileNav");
textInput.addEventListener("input", function () {
    charCount.textContent = this.value.length;
});
const sampleButtons =
    document.querySelectorAll(".sample-btn");
sampleButtons.forEach(button => {
    button.addEventListener("click", function () {
        textInput.value =
            this.getAttribute("data-text");
        charCount.textContent =
            textInput.value.length;
        textInput.focus();
    });
});
mobileMenuBtn.addEventListener("click", function () {
    mobileNav.classList.toggle("show");
});
const mobileLinks =
    mobileNav.querySelectorAll("a");
mobileLinks.forEach(link => {
    link.addEventListener("click", function () {
        mobileNav.classList.remove("show");
    });
});
analyzeBtn.addEventListener("click", analyzeSentiment);
async function analyzeSentiment() {
    const text =
        textInput.value.trim();
    if (!text) {
        alert("Please enter some text to analyze.");
        textInput.focus();
        return;
    }
    analyzeBtn.disabled = true;
    btnText.textContent = "Analyzing...";
    loading.classList.add("show");
    try {
        const response = await fetch(
            API_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    text: text
                })
            }
        );
        if (!response.ok) {
            throw new Error(
                "Server returned an error."
            );
        }
        const data =
            await response.json();
        console.log(
            "API Response:",
            data
        );
        displayResult(data);
    } catch (error) {
        console.error(error);
        alert(
            "Unable to connect to the sentiment analysis server."
        );
    } finally {
        analyzeBtn.disabled = false;
        btnText.textContent =
            "Analyze Sentiment";
        loading.classList.remove("show");
    }
}
function displayResult(data) {
    let sentiment =
        data.sentiment ||
        data.prediction ||
        data.label;
    let score =
        data.score ??
        data.confidence ??
        data.probability;
    if (
        typeof score === "number" &&
        score <= 1
    ) {
        score = score * 100;
    }
    if (!sentiment) {
        sentiment =
            score >= 50
                ? "Positive"
                : "Negative";
    }
    if (
        typeof score !== "number" ||
        isNaN(score)
    ) {
        score = 0;
    }
    score =
        Math.max(
            0,
            Math.min(
                100,
                score
            )
        );
    sentiment =
        String(sentiment)
            .toLowerCase();
    if (
        sentiment.includes("positive")
    ) {
        showPositive(score);
    } else {
        showNegative(score);
    }
    resultSection.classList.add("show");
    setTimeout(() => {
        resultSection.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }, 100);
}
function showPositive(score) {
    sentimentText.textContent =
        "Positive";
    sentimentText.style.color =
        "#28d6a0";
    sentimentEmoji.textContent =
        "😊";
    sentimentCircle.style.background =
        "rgba(27, 202, 145, 0.08)";
    sentimentCircle.style.borderColor =
        "rgba(27, 202, 145, 0.45)";
    sentimentDescription.textContent =
        "The text expresses a positive sentiment with encouraging or favorable language.";
    confidenceText.textContent =
        Math.round(score) + "%";
    progressBar.style.width =
        Math.round(score) + "%";
}
function showNegative(score) {
    sentimentText.textContent =
        "Negative";
    sentimentText.style.color =
        "#ff6674";
    sentimentEmoji.textContent =
        "😞";
    sentimentCircle.style.background =
        "rgba(255, 70, 90, 0.08)";
    sentimentCircle.style.borderColor =
        "rgba(255, 70, 90, 0.45)";
    sentimentDescription.textContent =
        "The text expresses a negative sentiment with unfavorable or critical language.";
    confidenceText.textContent =
        Math.round(score) + "%";
    progressBar.style.width =
        Math.round(score) + "%";
}
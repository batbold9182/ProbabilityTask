const positionsDiv = document.getElementById("positions");
const resultDiv = document.getElementById("result");
const chartDiv = document.getElementById("chart");
const answerDiv = document.getElementById("answer");
const passwordSimulationDiv = document.getElementById("passwordSimulation");
const coinSimulationDiv = document.getElementById("coinSimulation");
const simInfoDiv = document.getElementById("simInfo");
const simMenuToggle = document.getElementById("simMenuToggle");
const simMenuContent = document.getElementById("simMenuContent");
const coinTossesInput = document.getElementById("coinTosses");
const coinTargetInput = document.getElementById("coinTarget");
const coinTrialsInput = document.getElementById("coinTrials");
const runCoinBtn = document.getElementById("runCoinBtn");
const coinResultDiv = document.getElementById("coinResult");
const modeButtons = document.querySelectorAll(".mode-btn");
const questionButtons = document.querySelectorAll(".q-btn");
const simButtons = document.querySelectorAll(".sim-btn");

const { initCoinSimulation } = window.CoinSimulation;
const { initPasswordSimulation } = window.PasswordSimulation;

const simulationMenu = {
    password: "Password Counting is active. This simulation compares repetition allowed vs no repetition for 5-character passwords.",
    coin: "Coin Toss Probability is active. Adjust n, k, and trial count, then run to compare theory vs simulation.",
    dice: "Dice Sum Simulation (menu preview): estimate probabilities for sums like 7 or 10 with repeated random rolls.",
    birthday: "Birthday Collision (menu preview): estimate the chance that at least two people share a birthday in a group.",
};

const coinSimulation = initCoinSimulation({
    coinTossesInput,
    coinTargetInput,
    coinTrialsInput,
    runCoinBtn,
    coinResultDiv,
});

initPasswordSimulation({
    positionsDiv,
    resultDiv,
    chartDiv,
    answerDiv,
    modeButtons,
    questionButtons,
});

simButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const simKey = button.dataset.sim;

        simButtons.forEach((simButton) => {
            simButton.classList.toggle("active", simButton === button);
        });

        simInfoDiv.textContent = simulationMenu[simKey];

        if (simKey === "password") {
            passwordSimulationDiv.removeAttribute("hidden");
            coinSimulationDiv.setAttribute("hidden", "");
            answerDiv.innerHTML = "Click a question to see the explanation.";
        } else if (simKey === "coin") {
            passwordSimulationDiv.setAttribute("hidden", "");
            coinSimulationDiv.removeAttribute("hidden");
            coinSimulation.runCoinSimulation();
        } else {
            passwordSimulationDiv.setAttribute("hidden", "");
            coinSimulationDiv.setAttribute("hidden", "");
            answerDiv.innerHTML = "This simulation is not implemented yet. Use this menu as a roadmap and I can build this one next.";
        }
    });
});

simMenuToggle.addEventListener("click", () => {
    const shouldOpen = simMenuContent.hasAttribute("hidden");

    if (shouldOpen) {
        simMenuContent.removeAttribute("hidden");
    } else {
        simMenuContent.setAttribute("hidden", "");
    }

    simMenuToggle.setAttribute("aria-expanded", String(shouldOpen));
});

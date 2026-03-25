const positionsDiv = document.getElementById("positions");
const resultDiv = document.getElementById("result");
const chartDiv = document.getElementById("chart");
const answerDiv = document.getElementById("answer");
const heroEyebrow = document.getElementById("heroEyebrow");
const heroTitle = document.getElementById("heroTitle");
const heroSubtitle = document.getElementById("heroSubtitle");
const passwordSimulationDiv = document.getElementById("passwordSimulation");
const coinSimulationDiv = document.getElementById("coinSimulation");
const diceSimulationDiv = document.getElementById("diceSimulation");
const birthdaySimulationDiv = document.getElementById("birthdaySimulation");
const medalAssignmentDiv = document.getElementById("medalAssignment");
const simInfoDiv = document.getElementById("simInfo");
const simMenuToggle = document.getElementById("simMenuToggle");
const simMenuContent = document.getElementById("simMenuContent");
const coinTossesInput = document.getElementById("coinTosses");
const coinTargetInput = document.getElementById("coinTarget");
const coinTrialsInput = document.getElementById("coinTrials");
const runCoinBtn = document.getElementById("runCoinBtn");
const coinResultDiv = document.getElementById("coinResult");
const diceCountInput = document.getElementById("diceCount");
const diceTargetInput = document.getElementById("diceTarget");
const diceTrialsInput = document.getElementById("diceTrials");
const runDiceBtn = document.getElementById("runDiceBtn");
const diceResultDiv = document.getElementById("diceResult");
const birthdayGroupInput = document.getElementById("birthdayGroup");
const birthdayTrialsInput = document.getElementById("birthdayTrials");
const runBirthdayBtn = document.getElementById("runBirthdayBtn");
const birthdayResultDiv = document.getElementById("birthdayResult");
const medalMiniViewBtn = document.getElementById("medalMiniViewBtn");
const medalLargeViewBtn = document.getElementById("medalLargeViewBtn");
const medalMiniPanel = document.getElementById("medalMiniPanel");
const medalLargePanel = document.getElementById("medalLargePanel");
const runMedalMiniBtn = document.getElementById("runMedalMiniBtn");
const medalMiniTotalBtn = document.getElementById("medalMiniTotalBtn");
const resetMedalMiniBtn = document.getElementById("resetMedalMiniBtn");
const medalMiniOutcomeNote = document.getElementById("medalMiniOutcomeNote");
const medalMiniResultDiv = document.getElementById("medalMiniResult");
const medalTrialsInput = document.getElementById("medalTrials");
const runMedalBtn = document.getElementById("runMedalBtn");
const medalResultDiv = document.getElementById("medalResult");
const modeButtons = document.querySelectorAll(".mode-btn");
const questionButtons = document.querySelectorAll(".q-btn");
const simButtons = document.querySelectorAll(".sim-btn");

const { initCoinSimulation } = window.CoinSimulation;
const { initDiceSimulation } = window.DiceSimulation;
const { initPasswordSimulation } = window.PasswordSimulation;
const { initBirthdaySimulation } = window.BirthdaySimulation;
const { initMedalSimulation } = window.MedalSimulation;

const simulationMeta = {
    password: {
        info: "Password Counting is active. This simulation compares repetition allowed vs no repetition for 5-character passwords.",
        title: "5-Character Password Possibilities",
        subtitle: "Character pool: <strong>10 digits + 26 letters = 36 symbols</strong>",
    },
    coin: {
        info: "Coin Toss Probability is active. Adjust n, k, and trial count, then run to compare theory vs simulation.",
        title: "Coin Toss Probability",
        subtitle: "Compare the exact binomial probability with a Monte Carlo estimate.",
    },
    dice: {
        info: "Dice Sum Simulation is active. Choose the number of dice and a target sum to compare exact probability against simulation.",
        title: "Dice Sum Simulation",
        subtitle: "Roll fair dice, target a sum, and compare theory with simulation.",
    },
    birthday: {
        info: "Birthday Collision is active. Estimate the probability that at least two people share a birthday in a group.",
        title: "Birthday Collision",
        subtitle: "Use the complement rule and simulation to study shared birthdays.",
    },
    medal: {
        info: "Medal Assignment is active. Use the small race view for one replayable race or the large view for 100 to 200000 Monte Carlo trials.",
        title: "Medal Assignment",
        subtitle: "Watch 12 runners race, then scale up to a larger simulation and compare with the permutation result.",
    },
};

const coinSimulation = initCoinSimulation({
    coinTossesInput,
    coinTargetInput,
    coinTrialsInput,
    runCoinBtn,
    coinResultDiv,
});

const diceSimulation = initDiceSimulation({
    diceCountInput,
    diceTargetInput,
    diceTrialsInput,
    runDiceBtn,
    diceResultDiv,
});

const birthdaySimulation = initBirthdaySimulation({
    birthdayGroupInput,
    birthdayTrialsInput,
    runBirthdayBtn,
    birthdayResultDiv,
});

const medalSimulation = initMedalSimulation({
    medalMiniViewBtn,
    medalLargeViewBtn,
    medalMiniPanel,
    medalLargePanel,
    runMedalMiniBtn,
    medalMiniTotalBtn,
    resetMedalMiniBtn,
    medalMiniOutcomeNote,
    medalMiniResultDiv,
    medalTrialsInput,
    runMedalBtn,
    medalResultDiv,
});

initPasswordSimulation({
    positionsDiv,
    resultDiv,
    chartDiv,
    answerDiv,
    modeButtons,
    questionButtons,
});

function showSimulation(simKey) {
    passwordSimulationDiv.toggleAttribute("hidden", simKey !== "password");
    coinSimulationDiv.toggleAttribute("hidden", simKey !== "coin");
    diceSimulationDiv.toggleAttribute("hidden", simKey !== "dice");
    birthdaySimulationDiv.toggleAttribute("hidden", simKey !== "birthday");
    medalAssignmentDiv.toggleAttribute("hidden", simKey !== "medal");
}

function runSelectedSimulation(simKey) {
    if (simKey === "password") {
        answerDiv.innerHTML = "Click a question to see the explanation.";
        return;
    }

    if (simKey === "coin") {
        coinSimulation.runCoinSimulation();
        return;
    }

    if (simKey === "dice") {
        diceSimulation.runDiceSimulation();
        return;
    }

    if (simKey === "birthday") {
        birthdaySimulation.runBirthdaySimulation();
        return;
    }

    if (simKey === "medal") {
        medalSimulation.runMedalSimulation();
    }
}

function activateSimulation(simKey, updateHash = true) {
    const nextKey = simulationMeta[simKey] ? simKey : "password";

    simButtons.forEach((simButton) => {
        simButton.classList.toggle("active", simButton.dataset.sim === nextKey);
    });

    showSimulation(nextKey);
    simInfoDiv.textContent = simulationMeta[nextKey].info;
    heroEyebrow.textContent = "Counting Principle Explorer";
    heroTitle.textContent = simulationMeta[nextKey].title;
    heroSubtitle.innerHTML = simulationMeta[nextKey].subtitle;
    document.title = simulationMeta[nextKey].title;
    runSelectedSimulation(nextKey);

    simMenuContent.setAttribute("hidden", "");
    simMenuToggle.setAttribute("aria-expanded", "false");

    if (updateHash) {
        window.location.hash = nextKey;
    }
}

simButtons.forEach((button) => {
    button.addEventListener("click", () => {
        activateSimulation(button.dataset.sim);
    });
});

window.addEventListener("hashchange", () => {
    activateSimulation(window.location.hash.slice(1), false);
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

activateSimulation(window.location.hash.slice(1) || "password", false);

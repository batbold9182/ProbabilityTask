(function attachMedalSimulation(global) {
	const RUNNER_COUNT = 12;
	const MEDAL_COUNT = 3;
	const RUNNER_A = 1;
	const RUNNER_B = 2;

	function drawRaceOrder() {
		const runners = [];
		for (let i = 0; i < RUNNER_COUNT; i += 1) {
			runners.push(i);
		}

		for (let i = RUNNER_COUNT - 1; i > 0; i -= 1) {
			const randomIndex = Math.floor(Math.random() * (i + 1));
			const temp = runners[i];
			runners[i] = runners[randomIndex];
			runners[randomIndex] = temp;
		}

		return runners;
	}

	function setResultMarkup(target, markup) {
		const template = document.createElement("template");
		template.innerHTML = markup.trim();
		target.replaceChildren(template.content.cloneNode(true));
	}

	function getRaceOutcome(topThree) {
		const hasRunnerA = topThree.includes(RUNNER_A - 1);
		const hasRunnerB = topThree.includes(RUNNER_B - 1);

		if (hasRunnerA && hasRunnerB) {
			return "both";
		}

		if (hasRunnerA) {
			return "onlyA";
		}

		if (hasRunnerB) {
			return "onlyB";
		}

		return "neither";
	}

	function getRaceBadgeText(outcome) {
		if (outcome === "both") {
			return `Runner ${RUNNER_A} and Runner ${RUNNER_B} both won medals`;
		}

		if (outcome === "onlyA") {
			return `Only runner ${RUNNER_A} won a medal`;
		}

		if (outcome === "onlyB") {
			return `Only runner ${RUNNER_B} won a medal`;
		}

		return "Neither highlighted runner won a medal";
	}

	function getRunnerProgress(rank, runnerIndex) {
		return Math.max(14, Math.min(96, 96 - rank * 6.6 + (runnerIndex % 4) * 1.1));
	}

	function renderMiniRace(raceOrder, raceNumber) {
		const topThree = raceOrder.slice(0, MEDAL_COUNT);
		const podiumRunners = topThree.map((runnerIndex) => runnerIndex + 1);
		const outcome = getRaceOutcome(topThree);
		const rankByRunner = new Array(RUNNER_COUNT);

		raceOrder.forEach((runnerIndex, rank) => {
			rankByRunner[runnerIndex] = rank;
		});

		const laneMarkup = rankByRunner.map((rank, runnerIndex) => {
			const runnerNumber = runnerIndex + 1;
			const progress = getRunnerProgress(rank, runnerIndex);
			const isHighlighted = runnerNumber === RUNNER_A || runnerNumber === RUNNER_B;
			const medalClass = rank === 0
				? " medal-gold"
				: rank === 1
					? " medal-silver"
					: rank === 2
						? " medal-bronze"
						: "";

			return `
				<div class="race-lane ${isHighlighted ? "race-lane-highlight" : ""}">
					<div class="race-lane-label">Runner ${runnerNumber}</div>
					<div class="race-lane-track">
						<div class="race-lane-guide"></div>
						<div class="race-finish-line"></div>
						<div class="runner-token${medalClass}${isHighlighted ? " runner-token-focus" : ""}" style="left: calc(${progress}% - 22px)">
							<span class="runner-tag">R${runnerNumber}</span>
							<span class="runner-rank">#${rank + 1}</span>
						</div>
					</div>
				</div>
			`;
		}).join("");

		return `
			<div class="medal-race-card outcome-${outcome}">
				<div class="medal-race-head">
					<div>
						<div class="medal-race-kicker">Race ${raceNumber}</div>
						<div class="medal-race-outcome">${getRaceBadgeText(outcome)}</div>
					</div>
					<div class="medal-race-podium">Gold: R${podiumRunners[0]} | Silver: R${podiumRunners[1]} | Bronze: R${podiumRunners[2]}</div>
				</div>
				<div class="race-track-grid">
					${laneMarkup}
				</div>
			</div>
		`;
	}

	function initMedalSimulation({
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
	}) {
		let activeRunId = 0;
		let activeView = "mini";
		let miniRunCount = 0;
		const miniCategoryCounts = {
			both: 0,
			onlyA: 0,
			onlyB: 0,
			neither: 0,
		};

		function updateMiniRunCounter() {
			medalMiniTotalBtn.textContent = `Total Runs: ${miniRunCount}`;
		}

		function resetMiniCounts() {
			miniRunCount = 0;
			miniCategoryCounts.both = 0;
			miniCategoryCounts.onlyA = 0;
			miniCategoryCounts.onlyB = 0;
			miniCategoryCounts.neither = 0;
		}

		function showView(view) {
			activeView = view;
			medalMiniPanel.toggleAttribute("hidden", view !== "mini");
			medalLargePanel.toggleAttribute("hidden", view !== "large");
			medalMiniViewBtn.classList.toggle("active", view === "mini");
			medalLargeViewBtn.classList.toggle("active", view === "large");
		}

		function renderCategoryRow(label, valuePercent, maxPercent, isHighlight, exactPercent) {
			const widthPercent = maxPercent === 0 ? 0 : (valuePercent / maxPercent) * 100;
			const exactChip = exactPercent !== undefined
				? `<span class="exact-chip">theory: ${exactPercent.toFixed(2)}%</span>`
				: "";
			return `
				<div class="dice-distribution-row ${isHighlight ? "dice-distribution-row-active" : ""}">
					<div class="dice-distribution-head">
						<div class="label">${label} ${exactChip}</div>
						<div class="value">${valuePercent.toFixed(3)}%</div>
					</div>
					<div class="dice-distribution-track">
						<div class="dice-distribution-fill" style="width: ${widthPercent}%"></div>
					</div>
				</div>
			`;
		}

		function renderRunnerFrequencyRows(totalMedalCounts, totalTrials, goldCounts, silverCounts, bronzeCounts) {
			const rows = totalMedalCounts
				.map((count, index) => ({
					runner: index + 1,
					count,
					percent: totalTrials === 0 ? 0 : (count / totalTrials) * 100,
					gold: goldCounts[index],
					silver: silverCounts[index],
					bronze: bronzeCounts[index],
				}))
				.sort((a, b) => b.count - a.count);

			const maxPercent = rows.length === 0 ? 0 : rows[0].percent;
			const expectedPercent = (MEDAL_COUNT / RUNNER_COUNT) * 100;
			const expectedMarkerLeft = maxPercent === 0 ? 0 : Math.min(100, (expectedPercent / maxPercent) * 100);

			return rows.map((row) => {
				const widthPercent = maxPercent === 0 ? 0 : (row.percent / maxPercent) * 100;
				const isRunnerA = row.runner === RUNNER_A;
				const isRunnerB = row.runner === RUNNER_B;
				const highlightClass = (isRunnerA || isRunnerB) ? "dice-distribution-row-active" : "";

				return `
					<div class="dice-distribution-row ${highlightClass}">
						<div class="dice-distribution-head">
							<div class="label">Runner ${row.runner}</div>
							<div class="runner-medal-badges">
								<span class="runner-medal-badge badge-gold">🥇 ${row.gold}</span>
								<span class="runner-medal-badge badge-silver">🥈 ${row.silver}</span>
								<span class="runner-medal-badge badge-bronze">🥉 ${row.bronze}</span>
								<span class="runner-freq-value">${row.percent.toFixed(1)}%</span>
							</div>
						</div>
						<div class="runner-track-wrap">
							<div class="dice-distribution-track">
								<div class="dice-distribution-fill" style="width: ${widthPercent}%"></div>
							</div>
							<div class="runner-expected-marker" style="left: ${expectedMarkerLeft}%"></div>
						</div>
					</div>
				`;
			}).join("");
		}

		function renderMiniOutcomeRows(categoryCounts, totalRuns, latestOutcome) {
			const bothPercent = totalRuns === 0 ? 0 : (categoryCounts.both / totalRuns) * 100;
			const onlyAPercent = totalRuns === 0 ? 0 : (categoryCounts.onlyA / totalRuns) * 100;
			const onlyBPercent = totalRuns === 0 ? 0 : (categoryCounts.onlyB / totalRuns) * 100;
			const neitherPercent = totalRuns === 0 ? 0 : (categoryCounts.neither / totalRuns) * 100;
			const maxCategoryPercent = Math.max(bothPercent, onlyAPercent, onlyBPercent, neitherPercent);

			return `
				${renderCategoryRow(`Both runner ${RUNNER_A} and runner ${RUNNER_B} win medals (${categoryCounts.both})`, bothPercent, maxCategoryPercent, latestOutcome === "both")}
				${renderCategoryRow(`Only runner ${RUNNER_A} wins a medal (${categoryCounts.onlyA})`, onlyAPercent, maxCategoryPercent, latestOutcome === "onlyA")}
				${renderCategoryRow(`Only runner ${RUNNER_B} wins a medal (${categoryCounts.onlyB})`, onlyBPercent, maxCategoryPercent, latestOutcome === "onlyB")}
				${renderCategoryRow(`Neither runner wins a medal (${categoryCounts.neither})`, neitherPercent, maxCategoryPercent, latestOutcome === "neither")}
			`;
		}

		function renderMiniSimulation() {
			const raceOrder = drawRaceOrder();
			const topThree = raceOrder.slice(0, MEDAL_COUNT);
			const outcome = getRaceOutcome(topThree);

			miniRunCount += 1;
			miniCategoryCounts[outcome] += 1;
			updateMiniRunCounter();

			medalMiniOutcomeNote.textContent = `Latest outcome: ${getRaceBadgeText(outcome)}.`;

			setResultMarkup(medalMiniResultDiv, `
				<div class="medal-mini-shell">
					<div class="equation-block medal-mini-tally">
						<div class="eq-title">Small race tally after ${miniRunCount} run${miniRunCount === 1 ? "" : "s"}</div>
						<div class="distribution-preview">
							${renderMiniOutcomeRows(miniCategoryCounts, miniRunCount, outcome)}
						</div>
					</div>
					<div class="medal-race-grid">
						${renderMiniRace(raceOrder, 1)}
					</div>
				</div>
			`);
		}

		function resetMiniMedalSimulation() {
			resetMiniCounts();
			updateMiniRunCounter();
			medalMiniOutcomeNote.textContent = "Outcome will appear here.";
			setResultMarkup(medalMiniResultDiv, `
				<div class="medal-mini-shell">
					<div class="equation-block medal-mini-tally">
						<div class="eq-title">Small race tally after 0 runs</div>
						<div class="eq">Press Run Small Race Again to generate a new race.</div>
					</div>
				</div>
			`);
		}

		function renderMedalResult({
			totalAssignments,
			bothSpecificWays,
			bothSpecificProbability,
			onlyOneSpecificProbability,
			categoryCounts,
			trials,
			processedTrials,
			medalCounts,
			goldCounts,
			silverCounts,
			bronzeCounts,
			sampleTopThree,
			isRunning,
		}) {
			const simulatedProbability = processedTrials === 0 ? 0 : categoryCounts.both / processedTrials;
			const absoluteError = Math.abs(bothSpecificProbability - simulatedProbability);

			const bothPercent = processedTrials === 0 ? 0 : (categoryCounts.both / processedTrials) * 100;
			const onlyAPercent = processedTrials === 0 ? 0 : (categoryCounts.onlyA / processedTrials) * 100;
			const onlyBPercent = processedTrials === 0 ? 0 : (categoryCounts.onlyB / processedTrials) * 100;
			const neitherPercent = processedTrials === 0 ? 0 : (categoryCounts.neither / processedTrials) * 100;
			const maxCategoryPercent = Math.max(bothPercent, onlyAPercent, onlyBPercent, neitherPercent);

			const runnerFrequencyHtml = renderRunnerFrequencyRows(medalCounts, processedTrials, goldCounts, silverCounts, bronzeCounts);
			const progressPercent = trials === 0 ? 0 : (processedTrials / trials) * 100;
			const bothOutOf100Exact = bothSpecificProbability * 100;
			const bothOutOf100Sim = simulatedProbability * 100;
			const bothExactPercent = bothSpecificProbability * 100;
			const onlyAExactPercent = onlyOneSpecificProbability * 100;
			const onlyBExactPercent = onlyOneSpecificProbability * 100;
			const neitherExactPercent = (1 - bothSpecificProbability - 2 * onlyOneSpecificProbability) * 100;

			setResultMarkup(medalResultDiv, `
				<p>Think of this as a race game with 12 runners. We run many races and watch who gets Gold, Silver, and Bronze.</p>
				<div class="equation-block">
					<div class="eq-title">Race progress</div>
					<div class="eq">${processedTrials.toLocaleString()} / ${trials.toLocaleString()} races (${progressPercent.toFixed(1)}%) ${isRunning ? "- running" : "- done"}</div>
					<div class="dice-distribution-track">
						<div class="dice-distribution-fill" style="width: ${progressPercent}%"></div>
					</div>
				</div>
				<div class="coin-metrics">
					<div class="metric metric-highlight">
						<div class="label">Main answer</div>
						<div class="value">Runner ${RUNNER_A} and Runner ${RUNNER_B} both win a medal in about ${bothOutOf100Exact.toFixed(2)} out of 100 races.</div>
					</div>
					<div class="metric">
						<div class="label">What simulation got</div>
						<div class="value">About ${bothOutOf100Sim.toFixed(2)} out of 100 races so far.</div>
					</div>
					<div class="metric">
						<div class="label">Difference</div>
						<div class="value">${(absoluteError * 100).toFixed(2)}%</div>
					</div>
				</div>
				<div class="equation-block">
					<div class="eq-title">How many different podiums are possible?</div>
					<div class="eq">12 x 11 x 10 = ${totalAssignments.toLocaleString()}</div>
				</div>
				<div class="equation-block">
					<div class="eq-title">If runner ${RUNNER_A} and runner ${RUNNER_B} must both win medals</div>
					<div class="eq">Good podiums = 10 x 6 = ${bothSpecificWays}</div>
					<div class="eq">Chance = ${bothSpecificWays} / ${totalAssignments} = ${(bothSpecificProbability * 100).toFixed(3)}%</div>
					<div class="eq">Only one of them wins a medal: ${(onlyOneSpecificProbability * 100).toFixed(3)}%</div>
				</div>
				<div class="medal-visual-grid">
					<div class="metric medal-visual-card">
						<div class="label">What happened in all races</div>
						<div class="distribution-preview">
					${renderCategoryRow(`Both runner ${RUNNER_A} and runner ${RUNNER_B} win medals`, bothPercent, maxCategoryPercent, true, bothExactPercent)}
					${renderCategoryRow(`Only runner ${RUNNER_A} wins a medal`, onlyAPercent, maxCategoryPercent, false, onlyAExactPercent)}
					${renderCategoryRow(`Only runner ${RUNNER_B} wins a medal`, onlyBPercent, maxCategoryPercent, false, onlyBExactPercent)}
					${renderCategoryRow("Neither runner wins a medal", neitherPercent, maxCategoryPercent, false, neitherExactPercent)}
						</div>
					</div>
				</div>
				<div class="equation-block">
					<div class="eq-title">All runners ranked by medal frequency (<span style="color:var(--accent)">Runner ${RUNNER_A} and Runner ${RUNNER_B} highlighted</span>)</div>
					<div class="distribution-preview">
						${runnerFrequencyHtml}
					</div>
				</div>
			`);
		}

		function runMiniMedalSimulation() {
			showView("mini");

			runMedalMiniBtn.disabled = true;
			runMedalMiniBtn.textContent = "Rendering...";

			renderMiniSimulation();

			runMedalMiniBtn.disabled = false;
			runMedalMiniBtn.textContent = "Run Small Race Again";
		}

		function runMedalSimulation() {
			showView("large");
			const trials = Number(medalTrialsInput.value);

			if (!Number.isInteger(trials) || trials < 100 || trials > 200000) {
				medalResultDiv.textContent = "Trials must be an integer between 100 and 200000.";
				return;
			}

			const totalAssignments = RUNNER_COUNT * (RUNNER_COUNT - 1) * (RUNNER_COUNT - 2);
			const bothSpecificWays = (RUNNER_COUNT - 2) * 6;
			const bothSpecificProbability = bothSpecificWays / totalAssignments;
			const onlyOneSpecificProbability = (RUNNER_COUNT - 2) * (RUNNER_COUNT - 3) * 3 / totalAssignments;

			const medalCounts = new Array(RUNNER_COUNT).fill(0);
			const goldCounts = new Array(RUNNER_COUNT).fill(0);
			const silverCounts = new Array(RUNNER_COUNT).fill(0);
			const bronzeCounts = new Array(RUNNER_COUNT).fill(0);
			const categoryCounts = {
				both: 0,
				onlyA: 0,
				onlyB: 0,
				neither: 0,
			};

			let sampleTopThree = [1, 2, 3];
			const chunkSize = Math.max(200, Math.floor(trials / 40));
			let processedTrials = 0;
			activeRunId += 1;
			const runId = activeRunId;

			runMedalBtn.disabled = true;
			medalTrialsInput.disabled = true;
			runMedalBtn.textContent = "Running...";

			renderMedalResult({
				totalAssignments,
				bothSpecificWays,
				bothSpecificProbability,
				onlyOneSpecificProbability,
				categoryCounts,
				trials,
				processedTrials,
				medalCounts,
				goldCounts,
				silverCounts,
				bronzeCounts,
				sampleTopThree,
				isRunning: true,
			});

			function processChunk() {
				if (runId !== activeRunId) {
					return;
				}

				const end = Math.min(processedTrials + chunkSize, trials);

				for (let trial = processedTrials; trial < end; trial += 1) {
					const raceOrder = drawRaceOrder();
					const topThree = raceOrder.slice(0, MEDAL_COUNT);
					sampleTopThree = topThree;

					topThree.forEach((runnerIndex, position) => {
						medalCounts[runnerIndex] += 1;
						if (position === 0) goldCounts[runnerIndex] += 1;
						else if (position === 1) silverCounts[runnerIndex] += 1;
						else bronzeCounts[runnerIndex] += 1;
					});

					categoryCounts[getRaceOutcome(topThree)] += 1;
				}

				processedTrials = end;

				renderMedalResult({
					totalAssignments,
					bothSpecificWays,
					bothSpecificProbability,
					onlyOneSpecificProbability,
					categoryCounts,
					trials,
					processedTrials,
					medalCounts,
					goldCounts,
					silverCounts,
					bronzeCounts,
					sampleTopThree,
					isRunning: processedTrials < trials,
				});

				if (processedTrials < trials) {
					requestAnimationFrame(processChunk);
					return;
				}

				runMedalBtn.disabled = false;
				medalTrialsInput.disabled = false;
				runMedalBtn.textContent = "Run Large Simulation";
			}

			requestAnimationFrame(processChunk);
		}

		function runActiveMedalView() {
			if (activeView === "large") {
				runMedalSimulation();
				return;
			}

			runMiniMedalSimulation();
		}

		medalMiniViewBtn.addEventListener("click", () => {
			showView("mini");
			if (!medalMiniResultDiv.hasChildNodes()) {
				runMiniMedalSimulation();
			}
		});

		medalLargeViewBtn.addEventListener("click", () => {
			showView("large");
			if (!medalResultDiv.hasChildNodes()) {
				runMedalSimulation();
			}
		});

		runMedalMiniBtn.addEventListener("click", runMiniMedalSimulation);
		resetMedalMiniBtn.addEventListener("click", resetMiniMedalSimulation);

		runMedalBtn.addEventListener("click", runMedalSimulation);

		showView("mini");
		updateMiniRunCounter();

		return {
			runMedalSimulation: runActiveMedalView,
		};
	}

	global.MedalSimulation = {
		initMedalSimulation,
	};
}(window));

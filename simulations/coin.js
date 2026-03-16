(function attachCoinSimulation(global) {
	const { combination } = global.AppShared;

	function initCoinSimulation({
		coinTossesInput,
		coinTargetInput,
		coinTrialsInput,
		runCoinBtn,
		coinResultDiv,
	}) {
		function runCoinSimulation() {
			const tosses = Number(coinTossesInput.value);
			const target = Number(coinTargetInput.value);
			const trials = Number(coinTrialsInput.value);

			if (!Number.isInteger(tosses) || tosses < 1 || tosses > 20) {
				coinResultDiv.textContent = "Tosses must be an integer from 1 to 20.";
				return;
			}

			if (!Number.isInteger(target) || target < 0 || target > tosses) {
				coinResultDiv.textContent = "Target heads must be an integer between 0 and n.";
				return;
			}

			if (!Number.isInteger(trials) || trials < 100 || trials > 200000) {
				coinResultDiv.textContent = "Trials must be an integer between 100 and 200000.";
				return;
			}

			const theoretical = combination(tosses, target) / (2 ** tosses);

			let hitCount = 0;
			for (let trial = 0; trial < trials; trial += 1) {
				let heads = 0;
				for (let toss = 0; toss < tosses; toss += 1) {
					if (Math.random() < 0.5) {
						heads += 1;
					}
				}
				if (heads === target) {
					hitCount += 1;
				}
			}

			const simulated = hitCount / trials;
			const delta = Math.abs(theoretical - simulated);

			coinResultDiv.innerHTML = `
				<p>Event: exactly ${target} heads in ${tosses} tosses.</p>
				<div class="equation-block">
					<div class="eq-title">Binomial model</div>
					<div class="eq">P(X = k) = C(n, k) / 2^n = C(${tosses}, ${target}) / 2^${tosses}</div>
				</div>
				<div class="coin-metrics">
					<div class="metric">
						<div class="label">Theoretical</div>
						<div class="value">${(theoretical * 100).toFixed(3)}%</div>
					</div>
					<div class="metric">
						<div class="label">Simulated</div>
						<div class="value">${(simulated * 100).toFixed(3)}%</div>
					</div>
					<div class="metric">
						<div class="label">Absolute Error</div>
						<div class="value">${(delta * 100).toFixed(3)}%</div>
					</div>
				</div>
			`;
		}

		runCoinBtn.addEventListener("click", runCoinSimulation);

		return {
			runCoinSimulation,
		};
	}

	global.CoinSimulation = {
		initCoinSimulation,
	};
}(window));

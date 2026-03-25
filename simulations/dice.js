(function attachDiceSimulation(global) {
	function initDiceSimulation({
		diceCountInput,
		diceTargetInput,
		diceTrialsInput,
		runDiceBtn,
		diceResultDiv,
	}) {
		function syncTargetRange() {
			const diceCount = Number(diceCountInput.value);
			const minSum = Number.isInteger(diceCount) ? diceCount : 1;
			const maxSum = Number.isInteger(diceCount) ? diceCount * 6 : 6;

			diceTargetInput.min = String(minSum);
			diceTargetInput.max = String(maxSum);

			const currentTarget = Number(diceTargetInput.value);
			if (currentTarget < minSum) {
				diceTargetInput.value = String(minSum);
			} else if (currentTarget > maxSum) {
				diceTargetInput.value = String(maxSum);
			}
		}

		function countWaysToReachSum(diceCount, targetSum) {
			const maxSum = diceCount * 6;
			if (targetSum < diceCount || targetSum > maxSum) {
				return 0;
			}

			let ways = new Array(maxSum + 1).fill(0);
			ways[0] = 1;

			for (let die = 0; die < diceCount; die += 1) {
				const nextWays = new Array(maxSum + 1).fill(0);
				for (let sum = 0; sum <= maxSum; sum += 1) {
					if (ways[sum] === 0) {
						continue;
					}
					for (let face = 1; face <= 6; face += 1) {
						nextWays[sum + face] += ways[sum];
					}
				}
				ways = nextWays;
			}

			return ways[targetSum];
		}

		function simulateDiceHitRate(diceCount, targetSum, trials) {
			let hitCount = 0;

			for (let trial = 0; trial < trials; trial += 1) {
				let total = 0;
				for (let die = 0; die < diceCount; die += 1) {
					total += 1 + Math.floor(Math.random() * 6);
				}
				if (total === targetSum) {
					hitCount += 1;
				}
			}

			return hitCount / trials;
		}

		function buildOutcomePreview(diceCount, targetSum) {
			const minSum = diceCount;
			const maxSum = diceCount * 6;
			const totalOutcomes = 6 ** diceCount;
			const cards = [];
			let peakProbability = 0;

			for (let sum = minSum; sum <= maxSum; sum += 1) {
				const probability = countWaysToReachSum(diceCount, sum) / totalOutcomes;
				peakProbability = Math.max(peakProbability, probability);
			}

			for (let sum = minSum; sum <= maxSum; sum += 1) {
				const probability = countWaysToReachSum(diceCount, sum) / totalOutcomes;
				const widthPercent = peakProbability === 0 ? 0 : (probability / peakProbability) * 100;
				cards.push(`
					<div class="dice-distribution-row ${sum === targetSum ? "dice-distribution-row-active" : ""}">
						<div class="dice-distribution-head">
							<div class="label">Sum ${sum}</div>
							<div class="value">${(probability * 100).toFixed(5)}%</div>
						</div>
						<div class="dice-distribution-track">
							<div class="dice-distribution-fill" style="width: ${widthPercent}%"></div>
						</div>
					</div>
				`);
			}

			return cards.join("");
		}

		function runDiceSimulation() {
			const diceCount = Number(diceCountInput.value);
			const targetSum = Number(diceTargetInput.value);
			const trials = Number(diceTrialsInput.value);

			if (!Number.isInteger(diceCount) || diceCount < 1 || diceCount > 6) {
				diceResultDiv.textContent = "Dice count must be an integer from 1 to 6.";
				return;
			}

			const minSum = diceCount;
			const maxSum = diceCount * 6;

			if (!Number.isInteger(targetSum) || targetSum < minSum || targetSum > maxSum) {
				diceResultDiv.textContent = `Target sum must be an integer between ${minSum} and ${maxSum}.`;
				return;
			}

			if (!Number.isInteger(trials) || trials < 100 || trials > 200000) {
				diceResultDiv.textContent = "Trials must be an integer between 100 and 200000.";
				return;
			}

			const totalOutcomes = 6 ** diceCount;
			const favorableOutcomes = countWaysToReachSum(diceCount, targetSum);
			const theoretical = favorableOutcomes / totalOutcomes;
			const simulated = simulateDiceHitRate(diceCount, targetSum, trials);
			const delta = Math.abs(theoretical - simulated);

			diceResultDiv.innerHTML = `
				<p>Event: the sum of ${diceCount} fair dice is exactly ${targetSum}.</p>
				<div class="equation-block">
					<div class="eq-title">Model</div>
					<div class="eq">P(S = ${targetSum}) = favorable outcomes / 6^${diceCount} = ${favorableOutcomes} / ${totalOutcomes.toLocaleString()}</div>
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
				<div class="distribution-preview">
					${buildOutcomePreview(diceCount, targetSum)}
				</div>
			`;
		}

		diceCountInput.addEventListener("input", syncTargetRange);
		runDiceBtn.addEventListener("click", runDiceSimulation);
		syncTargetRange();

		return {
			runDiceSimulation,
		};
	}

	global.DiceSimulation = {
		initDiceSimulation,
	};
}(window));

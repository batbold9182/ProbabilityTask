(function attachBirthdaySimulation(global) {
	function theoreticalCollisionProbability(groupSize) {
		if (groupSize <= 1) {
			return 0;
		}

		let noCollision = 1;
		for (let person = 0; person < groupSize; person += 1) {
			noCollision *= (365 - person) / 365;
		}

		return 1 - noCollision;
	}

	function simulateCollisionRate(groupSize, trials) {
		let collisions = 0;

		for (let trial = 0; trial < trials; trial += 1) {
			const seen = new Set();
			let hasCollision = false;

			for (let person = 0; person < groupSize; person += 1) {
				const birthday = Math.floor(Math.random() * 365);
				if (seen.has(birthday)) {
					hasCollision = true;
					break;
				}
				seen.add(birthday);
			}

			if (hasCollision) {
				collisions += 1;
			}
		}

		return collisions / trials;
	}

	function initBirthdaySimulation({
		birthdayGroupInput,
		birthdayTrialsInput,
		runBirthdayBtn,
		birthdayResultDiv,
	}) {
		function runBirthdaySimulation() {
			const groupSize = Number(birthdayGroupInput.value);
			const trials = Number(birthdayTrialsInput.value);

			if (!Number.isInteger(groupSize) || groupSize < 2 || groupSize > 100) {
				birthdayResultDiv.textContent = "Group size must be an integer from 2 to 100.";
				return;
			}

			if (!Number.isInteger(trials) || trials < 100 || trials > 200000) {
				birthdayResultDiv.textContent = "Trials must be an integer between 100 and 200000.";
				return;
			}

			const theoretical = theoreticalCollisionProbability(groupSize);
			const simulated = simulateCollisionRate(groupSize, trials);
			const delta = Math.abs(theoretical - simulated);
			const complement = 1 - theoretical;

			birthdayResultDiv.innerHTML = `
				<p>Event: at least two people in a group of ${groupSize} share a birthday.</p>
				<div class="equation-block">
					<div class="eq-title">Complement rule</div>
					<div class="eq">P(collision) = 1 - P(all birthdays different)</div>
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
						<div class="label">No Collision</div>
						<div class="value">${(complement * 100).toFixed(3)}%</div>
					</div>
				</div>
				<div class="metric-stack">
					<div class="metric">
						<div class="label">Absolute Error</div>
						<div class="value">${(delta * 100).toFixed(3)}%</div>
					</div>
				</div>
			`;
		}

		runBirthdayBtn.addEventListener("click", runBirthdaySimulation);

		return {
			runBirthdaySimulation,
		};
	}

	global.BirthdaySimulation = {
		initBirthdaySimulation,
	};
}(window));

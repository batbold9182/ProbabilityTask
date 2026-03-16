(function attachPasswordSimulation(global) {
	const {
		PASSWORD_LENGTH,
		buildPasswordChoices,
		multiply,
	} = global.AppShared;

	function initPasswordSimulation({
		positionsDiv,
		resultDiv,
		chartDiv,
		answerDiv,
		modeButtons,
		questionButtons,
	}) {
		let currentMode = true;

		function renderPositions(choices, maxChoice) {
			positionsDiv.innerHTML = "";

			choices.forEach((count, index) => {
				const box = document.createElement("article");
				box.className = "box";
				box.style.animationDelay = `${index * 70}ms`;

				const widthPercent = Math.max(8, (count / maxChoice) * 100);

				box.innerHTML = `
					<div class="slot">Position ${index + 1}</div>
					<div class="count">${count}</div>
					<div class="bar-mini" style="width:${widthPercent}%"></div>
				`;
				positionsDiv.appendChild(box);
			});
		}

		function renderChart(choices, maxChoice) {
			chartDiv.innerHTML = "";

			choices.forEach((count, index) => {
				const wrap = document.createElement("div");
				wrap.className = "bar-wrap";

				const bar = document.createElement("div");
				bar.className = "bar";
				bar.style.height = `${Math.max(12, (count / maxChoice) * 180)}px`;
				bar.style.animationDelay = `${index * 90}ms`;

				const value = document.createElement("div");
				value.className = "bar-value";
				value.textContent = count;

				const label = document.createElement("div");
				label.className = "bar-label";
				label.textContent = `Pos ${index + 1}`;

				wrap.appendChild(bar);
				wrap.appendChild(value);
				wrap.appendChild(label);
				chartDiv.appendChild(wrap);
			});
		}

		function renderResult(choices, total, repetition) {
			const formula = choices.join(" x ");
			const model = repetition ? "with repetition" : "without repetition";

			resultDiv.innerHTML = `
				<div>Model: <strong>${model}</strong></div>
				<div class="formula">${formula}</div>
				<div class="total">Total passwords: ${total.toLocaleString()}</div>
			`;
		}

		function render(repetition) {
			currentMode = repetition;

			const choices = buildPasswordChoices(repetition);
			const total = multiply(choices);
			const maxChoice = Math.max(...choices);

			modeButtons.forEach((button) => {
				const isSelected = button.dataset.repeat === String(repetition);
				button.classList.toggle("active", isSelected);
			});

			renderPositions(choices, maxChoice);
			renderChart(choices, maxChoice);
			renderResult(choices, total, repetition);
		}

		function impactAnswerHTML() {
			const withRep = multiply(buildPasswordChoices(true));
			const withoutRep = multiply(buildPasswordChoices(false));
			const difference = withRep - withoutRep;
			const ratio = (withRep / withoutRep).toFixed(2);

			return `
				<p>Allowing repetition keeps every slot at 36 choices. Formula: 36^${PASSWORD_LENGTH} = ${withRep.toLocaleString()}.</p>
				<p>Compared with no repetition (${withoutRep.toLocaleString()}), repetition gives many more possibilities:</p>
				<div class="answer-metrics">
					<div class="metric">
						<div class="label">With repetition</div>
						<div class="value">${withRep.toLocaleString()}</div>
					</div>
					<div class="metric">
						<div class="label">Without repetition</div>
						<div class="value">${withoutRep.toLocaleString()}</div>
					</div>
					<div class="metric">
						<div class="label">Extra with repetition</div>
						<div class="value">${difference.toLocaleString()} (${ratio}x)</div>
					</div>
				</div>
			`;
		}

		const answers = {
			drop: `Without repetition, each chosen character is removed from the pool. So the choices go 36, 35, 34, 33, 32. Formula: 36 x 35 x 34 x 33 x 32 = ${multiply(buildPasswordChoices(false)).toLocaleString()}.`,
			impact: impactAnswerHTML(),
			model: `
				<p>Both use the multiplication principle. Password order matters, so the no-repetition case is a permutation-style model.</p>
				<div class="equation-block">
					<div class="eq-title">Permutation formula (order matters)</div>
					<div class="eq">P(n, k) = n! / (n - k)!</div>
				</div>
				<div class="equation-block">
					<div class="eq-title">Combination formula (order does not matter)</div>
					<div class="eq">C(n, k) = n! / (k!(n - k)!)</div>
				</div>
			`,
			reason: `
				<p>For a ${PASSWORD_LENGTH}-character password, fill positions one by one and multiply valid options per slot: Total = n1 x n2 x n3 x n4 x n5.</p>
				<p>Because password order matters, use permutations for no-repetition counting and not combinations.</p>
				<div class="equation-block">
					<div class="eq-title">Used here (no repetition)</div>
					<div class="eq">P(36, 5) = 36! / 31! = 36 x 35 x 34 x 33 x 32</div>
				</div>
			`,
		};

		modeButtons.forEach((button) => {
			button.addEventListener("click", () => {
				render(button.dataset.repeat === "true");
			});
		});

		questionButtons.forEach((button) => {
			button.addEventListener("click", () => {
				const questionKey = button.dataset.q;

				if (questionKey === "impact") {
					render(true);
				} else if (questionKey === "drop") {
					render(false);
				} else if (questionKey === "model") {
					render(!currentMode);
				}

				answerDiv.innerHTML = answers[questionKey];
			});
		});

		render(true);

		return {
			render,
		};
	}

	global.PasswordSimulation = {
		initPasswordSimulation,
	};
}(window));
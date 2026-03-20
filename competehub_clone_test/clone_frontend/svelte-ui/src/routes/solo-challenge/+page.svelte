<script lang="ts">
	let phase = $state<'config' | 'quiz' | 'result'>('config');
	let filterSubject = $state('Physics');
	let filterDifficulty = $state('Medium');
	let filterCount = $state(10);

	const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'CS'];
	const difficulties = ['Easy', 'Medium', 'Hard', 'Mixed'];

	const sampleQuestions = [
		{ id: 1, text: 'A particle moves in a circle of radius R with constant speed v. The centripetal acceleration is:', options: ['v/R', 'v²/R', 'vR', 'R/v'], answer: 1, subject: 'Physics' },
		{ id: 2, text: 'The derivative of sin(x²) with respect to x is:', options: ['cos(x²)', '2x·cos(x²)', 'sin(2x)', '2cos(x²)'], answer: 1, subject: 'Mathematics' },
		{ id: 3, text: 'Which quantum number determines the shape of an orbital?', options: ['Principal (n)', 'Azimuthal (l)', 'Magnetic (m)', 'Spin (s)'], answer: 1, subject: 'Chemistry' },
		{ id: 4, text: 'The time complexity of merge sort is:', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], answer: 1, subject: 'CS' },
		{ id: 5, text: 'Newton\'s second law relates force to:', options: ['Velocity', 'Displacement', 'Acceleration', 'Speed'], answer: 2, subject: 'Physics' },
	];

	let currentQ = $state(0);
	let selectedAnswers = $state<number[]>([]);
	let timeLeft = $state(30);
	let timerInterval: ReturnType<typeof setInterval> | null = null;
	let questionTimer = $state(30);
	let revealed = $state(false);

	function startQuiz() {
		phase = 'quiz';
		currentQ = 0;
		selectedAnswers = [];
		revealed = false;
		startTimer();
	}

	function startTimer() {
		timeLeft = 30;
		questionTimer = 30;
		if (timerInterval) clearInterval(timerInterval);
		timerInterval = setInterval(() => {
			timeLeft--;
			if (timeLeft <= 0) {
				clearInterval(timerInterval!);
				selectAnswer(-1);
			}
		}, 1000);
	}

	function selectAnswer(idx: number) {
		if (revealed) return;
		if (timerInterval) clearInterval(timerInterval);
		selectedAnswers = [...selectedAnswers, idx];
		revealed = true;
	}

	function nextQuestion() {
		if (currentQ < sampleQuestions.length - 1) {
			currentQ++;
			revealed = false;
			startTimer();
		} else {
			if (timerInterval) clearInterval(timerInterval);
			phase = 'result';
		}
	}

	let score = $derived(selectedAnswers.filter((a, i) => a === sampleQuestions[i]?.answer).length);
	let timerPercent = $derived((timeLeft / 30) * 100);
	let timerColor = $derived(timeLeft > 15 ? '#00b894' : timeLeft > 7 ? '#fdcb6e' : '#e17055');
</script>

<svelte:head><title>Solo Challenge – CompeteHub</title></svelte:head>

<div class="max-w-3xl mx-auto px-4 py-6">

	{#if phase === 'config'}
		<!-- Config screen -->
		<div class="text-center mb-8">
			<h1 class="text-3xl font-black mb-1">🧠 Solo Challenge</h1>
			<p class="text-gray-500 text-sm">Customize your quiz session</p>
		</div>

		<div class="doodle-card p-8 max-w-xl mx-auto">
			<div class="mb-6">
				<label class="text-sm font-black text-gray-700 block mb-3">📚 Subject</label>
				<div class="flex flex-wrap gap-2">
					{#each subjects as s}
						<button
							class="px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all
							{filterSubject === s ? 'border-black text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}"
							style={filterSubject === s ? 'background: var(--color-purple); box-shadow: 3px 3px 0 #1a1a1a' : ''}
							onclick={() => filterSubject = s}
						>{s}</button>
					{/each}
				</div>
			</div>

			<div class="mb-6">
				<label class="text-sm font-black text-gray-700 block mb-3">⚡ Difficulty</label>
				<div class="flex flex-wrap gap-2">
					{#each difficulties as d}
						<button
							class="px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all
							{filterDifficulty === d ? 'border-black text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}"
							style={filterDifficulty === d ? 'background: var(--color-purple); box-shadow: 3px 3px 0 #1a1a1a' : ''}
							onclick={() => filterDifficulty = d}
						>{d}</button>
					{/each}
				</div>
			</div>

			<div class="mb-8">
				<label class="text-sm font-black text-gray-700 block mb-3">
					🔢 Number of Questions: <span style="color: var(--color-purple)">{filterCount}</span>
				</label>
				<input
					type="range" min="5" max="30" step="5"
					class="range w-full" style="accent-color: var(--color-purple)"
					bind:value={filterCount}
				/>
				<div class="flex justify-between text-xs text-gray-400 mt-1">
					<span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span>
				</div>
			</div>

			<!-- Summary -->
			<div class="bg-purple-50 rounded-xl border-2 border-purple-200 p-4 mb-6 flex gap-4 flex-wrap">
				{#each [
					{ label: 'Subject', val: filterSubject },
					{ label: 'Difficulty', val: filterDifficulty },
					{ label: 'Questions', val: filterCount },
					{ label: 'Est. Time', val: `${filterCount * 30}s` },
				] as s}
					<div class="text-center">
						<div class="text-xs text-gray-400 font-semibold">{s.label}</div>
						<div class="font-black text-purple-700">{s.val}</div>
					</div>
				{/each}
			</div>

			<button
				class="btn btn-lg doodle-btn w-full"
				style="background: var(--color-purple); color: white; font-size: 1.1rem;"
				onclick={startQuiz}
			>
				🚀 Start Challenge!
			</button>
		</div>

	{:else if phase === 'quiz'}
		<!-- Quiz screen -->
		{@const q = sampleQuestions[currentQ]}

		<div class="mb-4 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<span class="text-sm font-black text-gray-500">Question</span>
				<span class="font-black text-lg" style="color: var(--color-purple)">{currentQ + 1}</span>
				<span class="text-sm text-gray-400">/ {sampleQuestions.length}</span>
			</div>
			<!-- Timer -->
			<div class="flex items-center gap-2">
				<div class="radial-progress text-sm font-black"
					style="--value:{timerPercent}; --size:3rem; --thickness:4px; color: {timerColor}; border: 2px solid #1a1a1a;">
					{timeLeft}
				</div>
			</div>
		</div>

		<!-- Progress bar -->
		<div class="w-full bg-gray-200 rounded-full h-2 border border-black mb-6 overflow-hidden">
			<div class="h-full rounded-full transition-all"
				style="width: {((currentQ) / sampleQuestions.length) * 100}%; background: var(--color-purple)"></div>
		</div>

		<div class="doodle-card p-6">
			<div class="flex flex-wrap gap-1.5 mb-4">
				<span class="doodle-badge text-[10px] bg-purple-50 text-purple-600 border-purple-200">{q.subject}</span>
				<span class="doodle-badge text-[10px] bg-orange-50 text-orange-600 border-orange-200">{filterDifficulty}</span>
			</div>

			<h2 class="text-lg font-semibold mb-6 leading-relaxed">{q.text}</h2>

			<div class="flex flex-col gap-3 mb-6">
				{#each q.options as opt, i}
					{@const isCorrect = i === q.answer}
					{@const isSelected = selectedAnswers[currentQ] === i}
					<button
						class="text-left p-4 rounded-xl border-2 font-medium transition-all
						{revealed
							? isCorrect
								? 'border-green-500 bg-green-50 text-green-800'
								: isSelected
									? 'border-red-400 bg-red-50 text-red-700'
									: 'border-gray-200 text-gray-500'
							: 'border-gray-200 hover:border-purple-400 hover:bg-purple-50 cursor-pointer'}"
						onclick={() => selectAnswer(i)}
						disabled={revealed}
					>
						<span class="font-black mr-3 text-gray-400">{'ABCD'[i]}.</span>
						{opt}
						{#if revealed && isCorrect}<span class="float-right">✅</span>{/if}
						{#if revealed && isSelected && !isCorrect}<span class="float-right">❌</span>{/if}
					</button>
				{/each}
			</div>

			{#if revealed}
				<button
					class="btn doodle-btn w-full"
					style="background: var(--color-purple); color: white;"
					onclick={nextQuestion}
				>
					{currentQ < sampleQuestions.length - 1 ? 'Next Question →' : '🏁 See Results'}
				</button>
			{/if}
		</div>

	{:else}
		<!-- Result screen -->
		<div class="text-center">
			<div class="doodle-card p-8 max-w-md mx-auto" style="box-shadow: 8px 8px 0 #1a1a1a;">
				<div class="text-6xl mb-4">
					{score >= 4 ? '🎉' : score >= 2 ? '👍' : '💪'}
				</div>
				<h1 class="text-3xl font-black mb-2">
					{score >= 4 ? 'Excellent!' : score >= 2 ? 'Good Job!' : 'Keep Practicing!'}
				</h1>
				<div class="text-6xl font-black mb-1" style="color: var(--color-purple)">
					{score}/{sampleQuestions.length}
				</div>
				<p class="text-gray-500 mb-6">
					{Math.round((score / sampleQuestions.length) * 100)}% accuracy
				</p>

				<div class="grid grid-cols-3 gap-3 mb-6">
					{#each [
						{ label: 'Correct', val: score, color: '#00b894' },
						{ label: 'Wrong', val: sampleQuestions.length - score, color: '#e17055' },
						{ label: 'XP Earned', val: score * 15, color: '#ffd700' },
					] as s}
						<div class="bg-gray-50 rounded-xl p-3 border border-gray-200">
							<div class="text-xl font-black" style="color: {s.color}">{s.val}</div>
							<div class="text-xs text-gray-400 font-semibold">{s.label}</div>
						</div>
					{/each}
				</div>

				<div class="flex flex-col gap-2">
					<button class="btn doodle-btn w-full" style="background: var(--color-purple); color: white;"
						onclick={() => phase = 'config'}>
						🔄 Try Again
					</button>
					<a href="/question-bank" class="btn doodle-btn w-full bg-white">📚 Question Bank</a>
				</div>
			</div>
		</div>
	{/if}
</div>

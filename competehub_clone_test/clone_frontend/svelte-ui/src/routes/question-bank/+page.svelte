<script lang="ts">
	let searchQuery = $state('');
	let filterSubject = $state('All');
	let filterDifficulty = $state('All');
	let selectedQuestion = $state<number | null>(null);

	const subjects = ['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'CS'];
	const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

	const questions = [
		{ id: 1, text: 'A particle moves in a circle of radius R with constant speed v. The magnitude of its average acceleration over a half circle is:', subject: 'Physics', topic: 'Circular Motion', difficulty: 'Medium', exam: 'JEE', answer: 'C', options: ['πv²/R', 'v²/R', '2v²/(πR)', 'v²/(2R)'], explanation: 'The average acceleration over a half circle = Δv/Δt. The change in velocity magnitude = 2v (opposite directions). Time for half circle = πR/v. So avg acceleration = 2v/(πR/v) = 2v²/πR.' },
		{ id: 2, text: 'Which of the following electronic configurations corresponds to the lowest energy state of Cr?', subject: 'Chemistry', topic: 'Electronic Configuration', difficulty: 'Hard', exam: 'JEE', answer: 'B', options: ['[Ar] 3d⁴ 4s²', '[Ar] 3d⁵ 4s¹', '[Ar] 3d⁶ 4s⁰', '[Ar] 3d³ 4s²'], explanation: 'Chromium (Cr, Z=24) has electronic configuration [Ar] 3d⁵ 4s¹ due to extra stability of half-filled d orbitals.' },
		{ id: 3, text: 'The number of real roots of the equation x² + 5|x| + 6 = 0 is:', subject: 'Mathematics', topic: 'Algebra', difficulty: 'Easy', exam: 'JEE', answer: 'D', options: ['4', '2', '1', '0'], explanation: 'Since x² ≥ 0 and 5|x| ≥ 0 and 6 > 0, the sum x² + 5|x| + 6 > 0 always. Therefore no real roots exist.' },
		{ id: 4, text: 'In the process of DNA replication, the enzyme that synthesizes a new DNA strand is:', subject: 'Biology', topic: 'Molecular Biology', difficulty: 'Easy', exam: 'NEET', answer: 'A', options: ['DNA Polymerase III', 'RNA Polymerase', 'Primase', 'Ligase'], explanation: 'DNA Polymerase III is the primary enzyme responsible for synthesizing new DNA strands in prokaryotes during replication.' },
		{ id: 5, text: 'A wire of resistance 12Ω is bent into a circle. The effective resistance between two points on the same diameter is:', subject: 'Physics', topic: 'Current Electricity', difficulty: 'Medium', exam: 'JEE', answer: 'B', options: ['12Ω', '3Ω', '6Ω', '1Ω'], explanation: 'When bent into a circle, two semicircles (6Ω each) are in parallel. Effective resistance = (6×6)/(6+6) = 3Ω.' },
		{ id: 6, text: 'Which data structure uses LIFO (Last In First Out) principle?', subject: 'CS', topic: 'Data Structures', difficulty: 'Easy', exam: 'GATE', answer: 'B', options: ['Queue', 'Stack', 'Tree', 'Graph'], explanation: 'A Stack uses the LIFO principle — the last element pushed is the first to be popped.' },
		{ id: 7, text: 'The solubility product (Ksp) of BaSO₄ is 1.5 × 10⁻⁹. What is the molar solubility?', subject: 'Chemistry', topic: 'Ionic Equilibrium', difficulty: 'Medium', exam: 'JEE', answer: 'A', options: ['3.87 × 10⁻⁵ M', '1.5 × 10⁻⁹ M', '1.2 × 10⁻⁴ M', '7.5 × 10⁻¹⁰ M'], explanation: 'For BaSO₄ → Ba²⁺ + SO₄²⁻, Ksp = s² = 1.5×10⁻⁹. Therefore s = √(1.5×10⁻⁹) ≈ 3.87×10⁻⁵ M.' },
		{ id: 8, text: 'If f(x) = sin(x)/x for x ≠ 0, then lim(x→0) f(x) equals:', subject: 'Mathematics', topic: 'Limits', difficulty: 'Easy', exam: 'JEE', answer: 'C', options: ['0', '∞', '1', '-1'], explanation: 'This is the standard limit: lim(x→0) sin(x)/x = 1, which is a fundamental limit in calculus.' },
		{ id: 9, text: 'The time complexity of binary search on a sorted array of n elements is:', subject: 'CS', topic: 'Algorithms', difficulty: 'Easy', exam: 'GATE', answer: 'B', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(n log n)'], explanation: 'Binary search halves the search space at each step, resulting in O(log n) time complexity.' },
		{ id: 10, text: 'A photon has energy E = 3.3 × 10⁻¹⁹ J. Its wavelength is (h = 6.6×10⁻³⁴ J·s):', subject: 'Physics', topic: 'Modern Physics', difficulty: 'Medium', exam: 'JEE', answer: 'A', options: ['600 nm', '400 nm', '300 nm', '700 nm'], explanation: 'λ = hc/E = (6.6×10⁻³⁴ × 3×10⁸) / (3.3×10⁻¹⁹) = 6×10⁻⁷ m = 600 nm.' },
	];

	const diffColors: Record<string, string> = {
		Easy: '#e8f5e9', Medium: '#fff3e0', Hard: '#fce4ec',
	};
	const diffTextColors: Record<string, string> = {
		Easy: '#2e7d32', Medium: '#e65100', Hard: '#c62828',
	};

	let filtered = $derived(questions.filter(q => {
		const matchSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
			q.topic.toLowerCase().includes(searchQuery.toLowerCase());
		const matchSubject = filterSubject === 'All' || q.subject === filterSubject;
		const matchDiff = filterDifficulty === 'All' || q.difficulty === filterDifficulty;
		return matchSearch && matchSubject && matchDiff;
	}));

	let activeQ = $derived(selectedQuestion !== null ? questions.find(q => q.id === selectedQuestion) : null);
	let selectedAnswer = $state('');
	let revealed = $state(false);
</script>

<svelte:head><title>Question Bank – CompeteHub</title></svelte:head>

<div class="max-w-6xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">

	<!-- Filters sidebar -->
	<aside class="w-full lg:w-56 shrink-0">
		<div class="doodle-card p-4 sticky top-20">
			<h3 class="font-black mb-4">🔍 Filters</h3>

			<div class="mb-4">
				<label class="text-xs font-bold text-gray-500 block mb-2">SUBJECT</label>
				<div class="flex flex-col gap-1">
					{#each subjects as s}
						<button
							class="text-left px-3 py-1.5 rounded-lg text-sm font-semibold transition-all
							{filterSubject === s ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}"
							style={filterSubject === s ? 'background: var(--color-purple)' : ''}
							onclick={() => filterSubject = s}
						>{s}</button>
					{/each}
				</div>
			</div>

			<div>
				<label class="text-xs font-bold text-gray-500 block mb-2">DIFFICULTY</label>
				<div class="flex flex-col gap-1">
					{#each difficulties as d}
						<button
							class="text-left px-3 py-1.5 rounded-lg text-sm font-semibold transition-all
							{filterDifficulty === d ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}"
							style={filterDifficulty === d ? 'background: var(--color-purple)' : ''}
							onclick={() => filterDifficulty = d}
						>{d}</button>
					{/each}
				</div>
			</div>
		</div>
	</aside>

	<!-- Main content -->
	<div class="flex-1 min-w-0">
		<div class="flex items-center justify-between mb-4">
			<div>
				<h1 class="text-2xl font-black">📚 Question Bank</h1>
				<p class="text-sm text-gray-400">{filtered.length} questions found</p>
			</div>
		</div>

		<!-- Search -->
		<div class="relative mb-5">
			<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
			<input
				type="text"
				placeholder="Search questions, topics..."
				class="input w-full doodle-input pl-9"
				bind:value={searchQuery}
			/>
		</div>

		<!-- Question list -->
		<div class="flex flex-col gap-3">
			{#each filtered as q}
				<div class="doodle-card p-5">
					<div class="flex items-start gap-3">
						<div class="flex-1 min-w-0">
							<!-- Tags row -->
							<div class="flex flex-wrap gap-1.5 mb-2">
								<span class="doodle-badge text-[10px]"
									style="background: {diffColors[q.difficulty]}; color: {diffTextColors[q.difficulty]}; border-color: {diffTextColors[q.difficulty]}">
									{q.difficulty}
								</span>
								<span class="doodle-badge text-[10px] bg-gray-100 text-gray-600 border-gray-300">
									{q.subject}
								</span>
								<span class="doodle-badge text-[10px] bg-purple-50 text-purple-600 border-purple-200">
									{q.topic}
								</span>
								<span class="doodle-badge text-[10px]"
									style="background: #e3f2fd; color: #1565c0; border-color: #90caf9">
									{q.exam}
								</span>
							</div>
							<p class="text-sm text-gray-800 font-medium leading-relaxed">{q.text}</p>
						</div>
						<button
							class="btn btn-sm doodle-btn shrink-0"
							style="background: var(--color-purple); color: white;"
							onclick={() => { selectedQuestion = q.id; selectedAnswer = ''; revealed = false; }}
						>
							View →
						</button>
					</div>
				</div>
			{/each}

			{#if filtered.length === 0}
				<div class="text-center py-16 text-gray-400">
					<div class="text-5xl mb-3">🔍</div>
					<p class="font-semibold">No questions match your filters</p>
					<button class="btn btn-sm doodle-btn mt-3 bg-white" onclick={() => { searchQuery = ''; filterSubject = 'All'; filterDifficulty = 'All'; }}>
						Clear Filters
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Solution Modal -->
{#if activeQ}
	<div class="modal modal-open">
		<div class="modal-box doodle-card max-w-2xl border-2 border-black"
			style="box-shadow: 6px 6px 0 #1a1a1a; border-radius: 16px;">
			<button class="btn btn-sm btn-ghost absolute right-4 top-4 text-lg"
				onclick={() => { selectedQuestion = null; revealed = false; selectedAnswer = ''; }}>✕</button>

			<div class="flex flex-wrap gap-1.5 mb-3">
				<span class="doodle-badge text-[10px]"
					style="background: {diffColors[activeQ.difficulty]}; color: {diffTextColors[activeQ.difficulty]}; border-color: {diffTextColors[activeQ.difficulty]}">
					{activeQ.difficulty}
				</span>
				<span class="doodle-badge text-[10px] bg-gray-100 text-gray-600 border-gray-300">{activeQ.subject}</span>
				<span class="doodle-badge text-[10px] bg-purple-50 text-purple-600 border-purple-200">{activeQ.topic}</span>
			</div>

			<p class="text-base font-semibold mb-5 leading-relaxed">{activeQ.text}</p>

			<div class="flex flex-col gap-2 mb-5">
				{#each activeQ.options as opt, i}
					{@const letter = ['A','B','C','D'][i]}
					{@const isCorrect = letter === activeQ.answer}
					{@const isSelected = selectedAnswer === letter}
					<button
						class="text-left p-3 rounded-xl border-2 font-medium text-sm transition-all
						{revealed
							? isCorrect
								? 'border-green-500 bg-green-50 text-green-800'
								: isSelected
									? 'border-red-400 bg-red-50 text-red-700'
									: 'border-gray-200 text-gray-500'
							: isSelected
								? 'border-purple-500 bg-purple-50'
								: 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'}"
						onclick={() => !revealed && (selectedAnswer = letter)}
					>
						<span class="font-black mr-2">{letter}.</span>{opt}
						{#if revealed && isCorrect}<span class="float-right">✅</span>{/if}
						{#if revealed && isSelected && !isCorrect}<span class="float-right">❌</span>{/if}
					</button>
				{/each}
			</div>

			{#if revealed}
				<div class="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 mb-4">
					<p class="text-xs font-black text-blue-600 mb-1">💡 EXPLANATION</p>
					<p class="text-sm text-gray-700 leading-relaxed">{activeQ.explanation}</p>
				</div>
			{/if}

			<div class="flex gap-2">
				{#if !revealed}
					<button
						class="btn doodle-btn flex-1"
						style="background: var(--color-purple); color: white;"
						onclick={() => revealed = true}
					>Reveal Solution</button>
				{:else}
					<button class="btn doodle-btn flex-1 bg-white"
						onclick={() => { selectedQuestion = null; revealed = false; selectedAnswer = ''; }}>
						Close
					</button>
				{/if}
			</div>
		</div>
		<div class="modal-backdrop" onclick={() => { selectedQuestion = null; revealed = false; }}></div>
	</div>
{/if}

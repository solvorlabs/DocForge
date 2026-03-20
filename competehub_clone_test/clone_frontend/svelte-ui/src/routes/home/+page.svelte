<script lang="ts">
	const gameCategories = [
		{
			title: 'Core Modes',
			desc: 'Essential CompeteHub experiences',
			games: [
				{ id: 'ranked', title: 'RANKED MULTIPLAYER', subtitle: 'ELO-based competitive team battles', icon: '👑', color: '#4285f4', badge: 'HOT', route: '/ranked' },
				{ id: 'custom', title: '5V5 CUSTOM ROOMS', subtitle: 'Private matches with friends', icon: '👥', color: '#9c27b0', badge: 'POPULAR', route: '/custom-rooms' },
			]
		},
		{
			title: 'Competitive Practice',
			desc: 'Fast-paced skill-building for exam prep',
			games: [
				{ id: 'equation', title: 'EQUATION BUILDER', subtitle: 'Build equations step by step', icon: '🔢', color: '#673ab7', badge: 'NEW', route: '/game/equation-builder' },
				{ id: 'boss', title: 'BOSS MODE', subtitle: 'Face increasingly hard boss problems', icon: '🛡️', color: '#1565c0', badge: 'HOT', route: '/game/boss-mode' },
				{ id: 'crossword', title: 'CROSSWORD QUEST', subtitle: 'Solve crosswords with JEE clues', icon: '🧩', color: '#673ab7', badge: 'NEW', route: '/games/crossword' },
				{ id: 'dragon', title: 'DRAGON OUT SURVIVAL', subtitle: 'Survive dragon attacks with answers', icon: '🐉', color: '#e91e63', badge: 'NEW', route: '/games/dragon-out' },
				{ id: 'runner', title: 'ENDLESS RUNNER', subtitle: 'Lane-switching runner with MCQs', icon: '🏃', color: '#ff6b35', badge: 'FUN', route: '/games/runner' },
				{ id: 'speed', title: 'NUMERICAL SPEED RACE', subtitle: 'Timed numerical problems', icon: '⚡', color: '#00b894', badge: 'FAST', route: '/game/numerical-speed-race' },
			]
		},
		{
			title: 'Solo Practice',
			desc: 'Practice at your own pace',
			games: [
				{ id: 'solo', title: 'SOLO CHALLENGE', subtitle: 'Customized quiz sessions', icon: '🧠', color: '#0f9d58', badge: 'SOLO', route: '/solo-challenge' },
				{ id: 'daily', title: 'DAILY CHALLENGE', subtitle: 'New questions every day', icon: '📅', color: '#f39c12', badge: 'DAILY', route: '/daily-challenge' },
				{ id: 'qb', title: 'QUESTION BANK', subtitle: 'Browse 10K+ JEE/NEET/GATE Qs', icon: '📚', color: '#00838f', badge: 'STUDY', route: '/question-bank' },
			]
		},
		{
			title: 'Coming Soon',
			desc: 'Experimental game modes in development',
			locked: true,
			games: [
				{ id: 'quantum', title: 'QUANTUM CHESS', subtitle: 'Chess meets quantum mechanics', icon: '♟️', color: '#78909c', badge: 'SOON', route: '/game/quantum-chess' },
				{ id: 'escape', title: 'ESCAPE LAB', subtitle: 'Puzzle escape rooms with science', icon: '🔬', color: '#78909c', badge: 'SOON', route: '/game/escape-lab' },
				{ id: 'gene', title: 'GENE SPLICER', subtitle: 'DNA strategy game', icon: '🧬', color: '#78909c', badge: 'SOON', route: '/game/gene-splicer' },
				{ id: 'ai', title: 'AI TRAINING', subtitle: 'Train an AI to beat opponents', icon: '🤖', color: '#78909c', badge: 'SOON', route: '/game/ai-training' },
			]
		}
	];

	const mockLeaderboard = [
		{ rank: 1, name: 'Arjun S.', elo: 2450, wins: 312 },
		{ rank: 2, name: 'Priya K.', elo: 2380, wins: 289 },
		{ rank: 3, name: 'Rohan M.', elo: 2310, wins: 251 },
		{ rank: 4, name: 'Sneha P.', elo: 2240, wins: 198 },
		{ rank: 5, name: 'Dev T.', elo: 2180, wins: 175 },
	];

	const mockStats = { wins: 47, matches: 83, winRate: 57, elo: 1620, rank: '#342' };
</script>

<svelte:head>
	<title>Home – CompeteHub</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">

	<!-- Main column -->
	<div class="flex-1 min-w-0">
		<!-- Welcome banner -->
		<div class="doodle-card p-6 mb-6 flex items-center justify-between gap-4"
			style="background: linear-gradient(135deg, #6c5ce720, #4285f420);">
			<div>
				<h1 class="text-2xl font-black mb-1">Welcome back! 👋</h1>
				<p class="text-gray-500 text-sm">Ready for today's challenge? Your rank is waiting.</p>
			</div>
			<a href="/ranked" class="btn doodle-btn shrink-0"
				style="background: var(--color-purple); color: white;">
				⚔️ Play Now
			</a>
		</div>

		<!-- Game categories -->
		{#each gameCategories as category}
			<div class="mb-8">
				<div class="flex items-baseline gap-2 mb-1">
					<h2 class="text-xl font-black">{category.title}</h2>
					{#if category.locked}
						<span class="text-xs text-gray-400 font-semibold">🔒 IN DEVELOPMENT</span>
					{/if}
				</div>
				<p class="text-sm text-gray-400 mb-4">{category.desc}</p>

				<div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
					{#each category.games as game}
						<a
							href={category.locked ? '#' : game.route}
							class="doodle-card p-4 flex gap-3 {category.locked ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}"
						>
							<!-- Color accent bar -->
							<div class="w-1 rounded-full shrink-0" style="background: {game.color};"></div>

							<div class="w-11 h-11 rounded-xl border-2 border-black flex items-center
								justify-center text-xl shrink-0"
								style="background: {game.color}25;">
								{game.icon}
							</div>

							<div class="min-w-0 flex-1">
								<div class="flex items-start justify-between gap-1 mb-0.5">
									<h3 class="font-black text-xs leading-tight">{game.title}</h3>
									<span class="doodle-badge text-[9px] shrink-0"
										style="background: {game.color}20; color: {game.color}; border-color: {game.color}">
										{game.badge}
									</span>
								</div>
								<p class="text-xs text-gray-500 leading-tight">{game.subtitle}</p>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<!-- Right sidebar -->
	<aside class="w-full lg:w-72 shrink-0 flex flex-col gap-4">
		<!-- User stats card -->
		<div class="doodle-card p-5">
			<h3 class="font-black mb-4 flex items-center gap-2">👤 Your Stats</h3>
			<div class="grid grid-cols-2 gap-3 mb-4">
				{#each [
					{ label: 'Wins', value: mockStats.wins, icon: '🏆' },
					{ label: 'Matches', value: mockStats.matches, icon: '⚔️' },
					{ label: 'Win Rate', value: mockStats.winRate + '%', icon: '📈' },
					{ label: 'ELO', value: mockStats.elo, icon: '⭐' },
				] as s}
					<div class="bg-gray-50 rounded-xl p-3 border border-gray-200 text-center">
						<div class="text-lg">{s.icon}</div>
						<div class="text-xl font-black">{s.value}</div>
						<div class="text-[11px] text-gray-400 font-semibold">{s.label}</div>
					</div>
				{/each}
			</div>
			<a href="/profile" class="btn btn-sm doodle-btn w-full bg-white">View Full Profile</a>
		</div>

		<!-- Mini leaderboard -->
		<div class="doodle-card p-5">
			<div class="flex items-center justify-between mb-4">
				<h3 class="font-black flex items-center gap-2">🏆 Top Players</h3>
				<a href="/leaderboard" class="text-xs text-purple-600 font-bold hover:underline">View All</a>
			</div>
			<div class="flex flex-col gap-2">
				{#each mockLeaderboard as player}
					<div class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
						<span class="text-sm font-black w-5 text-center
							{player.rank === 1 ? 'text-yellow-500' : player.rank === 2 ? 'text-gray-400' : player.rank === 3 ? 'text-orange-400' : 'text-gray-300'}">
							{player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : '#' + player.rank}
						</span>
						<div class="w-8 h-8 rounded-full border-2 border-black flex items-center
							justify-center text-xs font-black bg-purple-100 text-purple-700">
							{player.name[0]}
						</div>
						<div class="flex-1 min-w-0">
							<div class="text-sm font-bold truncate">{player.name}</div>
							<div class="text-xs text-gray-400">{player.wins} wins</div>
						</div>
						<span class="text-xs font-black text-purple-600">{player.elo}</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Daily challenge teaser -->
		<div class="doodle-card p-5" style="background: linear-gradient(135deg, #fdcb6e20, #e1700520);">
			<h3 class="font-black mb-2 flex items-center gap-2">📅 Daily Challenge</h3>
			<p class="text-sm text-gray-500 mb-3">Today's challenge: <span class="font-bold text-gray-700">Optics & Wave Optics</span></p>
			<div class="flex items-center gap-2 mb-3">
				<div class="flex-1 bg-gray-200 rounded-full h-2 border border-black">
					<div class="bg-yellow-400 h-full rounded-full" style="width: 30%;"></div>
				</div>
				<span class="text-xs font-bold text-gray-500">3/10 done</span>
			</div>
			<a href="/daily-challenge" class="btn btn-sm doodle-btn w-full"
				style="background: #fdcb6e; color: #1a1a1a;">
				Start Challenge ⚡
			</a>
		</div>
	</aside>
</div>

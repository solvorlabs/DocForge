<script lang="ts">
	const mockRanked = {
		elo: 1620, tier: 'Gold', rank: '#342',
		wins: 47, losses: 36, winRate: 57,
		peakElo: 1740, tierProgress: 62,
	};

	const tiers = [
		{ name: 'Bronze', min: 0, max: 999, icon: '🥉', color: '#cd7f32' },
		{ name: 'Silver', min: 1000, max: 1399, icon: '🥈', color: '#9e9e9e' },
		{ name: 'Gold', min: 1400, max: 1799, icon: '🥇', color: '#ffc107' },
		{ name: 'Platinum', min: 1800, max: 2199, icon: '💠', color: '#00d2d3' },
		{ name: 'Diamond', min: 2200, max: 9999, icon: '💎', color: '#7c4dff' },
	];

	const recentRanked = [
		{ opp: 'Priya K.', result: 'Win', elo: '+24', mode: '5v5', date: '2h ago' },
		{ opp: 'Dev T.', result: 'Loss', elo: '-18', mode: '5v5', date: '5h ago' },
		{ opp: 'Rohan M.', result: 'Win', elo: '+21', mode: '5v5', date: '1d ago' },
		{ opp: 'Sneha P.', result: 'Win', elo: '+19', mode: '5v5', date: '1d ago' },
		{ opp: 'Anika R.', result: 'Loss', elo: '-22', mode: '5v5', date: '2d ago' },
	];

	let currentTier = $derived(tiers.find(t => mockRanked.elo >= t.min && mockRanked.elo <= t.max) ?? tiers[0]);
	let nextTier = $derived(tiers[tiers.indexOf(currentTier) + 1]);
	let eloToNext = $derived(nextTier ? nextTier.min - mockRanked.elo : 0);
</script>

<svelte:head><title>Ranked – CompeteHub</title></svelte:head>

<div class="max-w-5xl mx-auto px-4 py-6">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-3xl font-black">⚔️ Ranked Mode</h1>
			<p class="text-gray-500 text-sm">Compete for ELO and climb the ladder</p>
		</div>
		<a href="/ranked/search" class="btn btn-lg doodle-btn animate-pulse"
			style="background: var(--color-purple); color: white; animation: none;">
			🔍 Find Match
		</a>
	</div>

	<div class="grid lg:grid-cols-3 gap-6">
		<!-- ELO Card -->
		<div class="lg:col-span-1">
			<div class="doodle-card p-6 text-center mb-4"
				style="background: linear-gradient(135deg, {currentTier.color}20, {currentTier.color}10);">
				<div class="text-6xl mb-2">{currentTier.icon}</div>
				<h2 class="text-xl font-black mb-1" style="color: {currentTier.color}">{currentTier.name}</h2>
				<div class="text-4xl font-black mb-1">{mockRanked.elo}</div>
				<div class="text-sm text-gray-400 font-semibold">ELO Rating</div>

				{#if nextTier}
					<div class="mt-4">
						<div class="flex justify-between text-xs font-bold mb-1">
							<span>{currentTier.name}</span>
							<span style="color: {nextTier.color}">{nextTier.name}</span>
						</div>
						<div class="w-full bg-gray-200 rounded-full h-3 border-2 border-black overflow-hidden">
							<div class="h-full rounded-full" style="width: {mockRanked.tierProgress}%; background: {currentTier.color}"></div>
						</div>
						<p class="text-xs text-gray-400 mt-1">{eloToNext} ELO to {nextTier.name}</p>
					</div>
				{:else}
					<p class="text-xs text-gray-400 mt-2">Peak rank achieved!</p>
				{/if}
			</div>

			<!-- Quick stats -->
			<div class="doodle-card p-4">
				<h3 class="font-black mb-3 text-sm">Season Stats</h3>
				<div class="flex flex-col gap-2">
					{#each [
						{ label: 'Wins', value: mockRanked.wins, color: '#00b894' },
						{ label: 'Losses', value: mockRanked.losses, color: '#e17055' },
						{ label: 'Win Rate', value: mockRanked.winRate + '%', color: '#4285f4' },
						{ label: 'Peak ELO', value: mockRanked.peakElo, color: '#ffd700' },
						{ label: 'Global Rank', value: mockRanked.rank, color: '#6c5ce7' },
					] as s}
						<div class="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
							<span class="text-xs text-gray-500 font-semibold">{s.label}</span>
							<span class="text-sm font-black" style="color: {s.color}">{s.value}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Right column -->
		<div class="lg:col-span-2 flex flex-col gap-6">
			<!-- Tier ladder -->
			<div class="doodle-card p-5">
				<h3 class="font-black mb-4">🎖️ Tier Ladder</h3>
				<div class="flex flex-col gap-2">
					{#each [...tiers].reverse() as tier}
						{@const isCurrent = tier.name === currentTier.name}
						<div class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all
							{isCurrent ? 'border-black' : 'border-gray-200'}"
							style={isCurrent ? `background: ${tier.color}15; box-shadow: 3px 3px 0 #1a1a1a` : ''}>
							<span class="text-2xl">{tier.icon}</span>
							<div class="flex-1">
								<p class="font-black text-sm" style="color: {tier.color}">{tier.name}</p>
								<p class="text-xs text-gray-400">{tier.min} – {tier.max === 9999 ? '∞' : tier.max} ELO</p>
							</div>
							{#if isCurrent}
								<span class="doodle-badge text-[10px]"
									style="background: {tier.color}20; color: {tier.color}; border-color: {tier.color}">
									YOU ARE HERE
								</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<!-- Recent ranked matches -->
			<div class="doodle-card p-5">
				<div class="flex items-center justify-between mb-4">
					<h3 class="font-black">Recent Ranked Matches</h3>
					<a href="/ranked/history" class="text-xs text-purple-600 font-bold hover:underline">View All</a>
				</div>
				<div class="flex flex-col gap-2">
					{#each recentRanked as m}
						<div class="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
							<span class="w-2 h-2 rounded-full shrink-0"
								style="background: {m.result === 'Win' ? '#00b894' : '#e17055'}"></span>
							<div class="flex-1">
								<span class="text-sm font-bold">vs {m.opp}</span>
								<span class="text-xs text-gray-400 ml-2">{m.date}</span>
							</div>
							<span class="text-xs font-bold" style="color: {m.result === 'Win' ? '#00b894' : '#e17055'}">
								{m.result}
							</span>
							<span class="text-sm font-black" style="color: {m.result === 'Win' ? '#00b894' : '#e17055'}">
								{m.elo}
							</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- CTA -->
			<a href="/ranked/search"
				class="doodle-card p-6 text-center cursor-pointer hover:no-underline block"
				style="background: linear-gradient(135deg, #6c5ce720, #4285f420);">
				<div class="text-4xl mb-2">⚔️</div>
				<h3 class="text-xl font-black mb-1">Ready to compete?</h3>
				<p class="text-sm text-gray-500 mb-4">Join a ranked match and climb the ladder</p>
				<span class="btn doodle-btn" style="background: var(--color-purple); color: white;">
					🔍 Find Match Now
				</span>
			</a>
		</div>
	</div>
</div>

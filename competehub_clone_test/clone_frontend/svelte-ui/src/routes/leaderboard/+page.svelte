<script lang="ts">
	let activeTab = $state<'ranked' | 'solo' | 'weekly'>('ranked');
	let filterExam = $state('All');

	const exams = ['All', 'JEE', 'NEET', 'GATE'];

	const players = Array.from({ length: 20 }, (_, i) => ({
		rank: i + 1,
		name: ['Arjun S.', 'Priya K.', 'Rohan M.', 'Sneha P.', 'Dev T.', 'Anika R.', 'Karan B.', 'Meera J.',
			'Rahul G.', 'Divya S.', 'Sai K.', 'Neha M.', 'Vikas P.', 'Anjali T.', 'Amit R.',
			'Pooja N.', 'Suresh L.', 'Kavya B.', 'Ravi K.', 'Shruti M.'][i],
		elo: 2450 - i * 47,
		wins: 312 - i * 14,
		matches: 350 - i * 12,
		winRate: Math.max(45, 89 - i * 2),
		exam: ['JEE', 'GATE', 'NEET', 'JEE', 'GATE'][i % 5],
		avatar: ['A','P','R','S','D','A','K','M','R','D','S','N','V','A','A','P','S','K','R','S'][i],
	}));

	const tierColors: Record<number, string> = { 1: '#ffd700', 2: '#c0c0c0', 3: '#cd7f32' };
	const tierIcons: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
</script>

<svelte:head><title>Leaderboard – CompeteHub</title></svelte:head>

<div class="max-w-5xl mx-auto px-4 py-6">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-3xl font-black">🏆 Leaderboard</h1>
			<p class="text-gray-500 text-sm">Top competitors across all exams</p>
		</div>
		<!-- Exam filter -->
		<div class="flex gap-1 border-2 border-black rounded-xl overflow-hidden bg-white">
			{#each exams as exam}
				<button
					class="px-3 py-1.5 text-xs font-bold transition-all
					{filterExam === exam ? 'text-white' : 'text-gray-500 hover:bg-gray-50'}"
					style={filterExam === exam ? 'background: var(--color-purple)' : ''}
					onclick={() => filterExam = exam}
				>{exam}</button>
			{/each}
		</div>
	</div>

	<!-- Tabs -->
	<div class="flex gap-1 border-2 border-black rounded-xl overflow-hidden bg-white mb-6 w-fit">
		{#each (['ranked', 'solo', 'weekly'] as const) as t}
			<button
				class="px-6 py-2.5 font-black text-sm transition-all capitalize
				{activeTab === t ? 'text-white' : 'text-gray-500'}"
				style={activeTab === t ? 'background: var(--color-purple)' : ''}
				onclick={() => activeTab = t}
			>
				{t === 'ranked' ? '⚔️ Ranked' : t === 'solo' ? '🧠 Solo' : '📅 Weekly'}
			</button>
		{/each}
	</div>

	<!-- Podium (top 3) -->
	<div class="flex items-end justify-center gap-3 mb-8">
		<!-- 2nd -->
		<div class="doodle-card p-4 text-center w-36" style="height: 160px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; border-color: #c0c0c0; box-shadow: 4px 4px 0 #c0c0c0;">
			<div class="text-2xl mb-1">🥈</div>
			<div class="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center text-lg font-black bg-gray-100 mb-2">
				{players[1].avatar}
			</div>
			<div class="font-black text-sm">{players[1].name}</div>
			<div class="text-xs text-gray-500">{players[1].elo} ELO</div>
		</div>
		<!-- 1st -->
		<div class="doodle-card p-4 text-center w-40" style="height: 190px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; border-color: #ffd700; box-shadow: 4px 4px 0 #b8860b; background: #fffbeb;">
			<div class="text-3xl mb-1">🥇</div>
			<div class="w-14 h-14 rounded-full border-2 border-black flex items-center justify-center text-xl font-black bg-yellow-100 mb-2">
				{players[0].avatar}
			</div>
			<div class="font-black">{players[0].name}</div>
			<div class="text-sm font-bold text-yellow-600">{players[0].elo} ELO</div>
		</div>
		<!-- 3rd -->
		<div class="doodle-card p-4 text-center w-36" style="height: 140px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; border-color: #cd7f32; box-shadow: 4px 4px 0 #8b4513;">
			<div class="text-2xl mb-1">🥉</div>
			<div class="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center text-lg font-black bg-orange-100 mb-2">
				{players[2].avatar}
			</div>
			<div class="font-black text-sm">{players[2].name}</div>
			<div class="text-xs text-gray-500">{players[2].elo} ELO</div>
		</div>
	</div>

	<!-- Full table -->
	<div class="doodle-card overflow-hidden">
		<div class="overflow-x-auto">
			<table class="table table-zebra w-full">
				<thead>
					<tr class="border-b-2 border-black bg-gray-50">
						<th class="font-black text-xs">Rank</th>
						<th class="font-black text-xs">Player</th>
						<th class="font-black text-xs">ELO</th>
						<th class="font-black text-xs">Wins</th>
						<th class="font-black text-xs">Matches</th>
						<th class="font-black text-xs">Win Rate</th>
						<th class="font-black text-xs">Exam</th>
					</tr>
				</thead>
				<tbody>
					{#each players as p}
						<tr class="hover:bg-purple-50 transition-colors border-b border-gray-100">
							<td class="font-black">
								{#if tierIcons[p.rank]}
									{tierIcons[p.rank]}
								{:else}
									<span class="text-gray-400">#{p.rank}</span>
								{/if}
							</td>
							<td>
								<div class="flex items-center gap-2">
									<div class="w-8 h-8 rounded-full border-2 border-black flex items-center
										justify-center text-xs font-black bg-purple-100 text-purple-700">
										{p.avatar}
									</div>
									<span class="font-bold text-sm">{p.name}</span>
								</div>
							</td>
							<td class="font-black text-purple-600">{p.elo}</td>
							<td class="font-bold">{p.wins}</td>
							<td class="text-gray-500">{p.matches}</td>
							<td>
								<div class="flex items-center gap-2">
									<div class="w-16 bg-gray-200 rounded-full h-1.5 border border-gray-300">
										<div class="bg-purple-500 h-full rounded-full" style="width: {p.winRate}%"></div>
									</div>
									<span class="text-xs font-bold">{p.winRate}%</span>
								</div>
							</td>
							<td>
								<span class="doodle-badge text-[10px]"
									style="background: {p.exam === 'JEE' ? '#e3f2fd' : p.exam === 'NEET' ? '#fce4ec' : '#e8f5e9'};
									color: {p.exam === 'JEE' ? '#1565c0' : p.exam === 'NEET' ? '#c62828' : '#2e7d32'};
									border-color: {p.exam === 'JEE' ? '#90caf9' : p.exam === 'NEET' ? '#f48fb1' : '#a5d6a7'}">
									{p.exam}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

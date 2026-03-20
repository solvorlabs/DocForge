<script lang="ts">
	const mockUser = {
		name: 'Arjun Sharma',
		username: 'arjun_s',
		email: 'arjun@example.com',
		elo: 1620,
		wins: 47, matches: 83, winRate: 57,
		xp: 3450, level: 12, rank: '#342',
		joinedDate: 'January 2025',
		tier: 'Gold',
	};

	const achievements = [
		{ icon: '🏆', label: 'First Win', desc: 'Won your first battle' },
		{ icon: '🔥', label: '5 Win Streak', desc: '5 consecutive wins' },
		{ icon: '⚡', label: 'Speed Demon', desc: 'Answered in under 5s' },
		{ icon: '🧠', label: 'Know-It-All', desc: '100 questions answered' },
		{ icon: '👥', label: 'Team Player', desc: 'Played 10 team games' },
		{ icon: '📈', label: 'Rising Star', desc: 'Gained 200 ELO in a week' },
	];

	const recentMatches = [
		{ id: 1, mode: '5v5 Ranked', result: 'Win', score: '15-8', elo: '+24', subject: 'Physics', date: '2h ago' },
		{ id: 2, mode: 'Solo Challenge', result: 'Win', score: '9/10', elo: '+12', subject: 'Math', date: '5h ago' },
		{ id: 3, mode: '5v5 Ranked', result: 'Loss', score: '11-14', elo: '-18', subject: 'Chemistry', date: '1d ago' },
		{ id: 4, mode: 'Boss Mode', result: 'Win', score: 'Level 7', elo: '+8', subject: 'Physics', date: '1d ago' },
		{ id: 5, mode: '5v5 Ranked', result: 'Win', score: '13-9', elo: '+21', subject: 'Math', date: '2d ago' },
		{ id: 6, mode: 'Solo Challenge', result: 'Loss', score: '6/10', elo: '-5', subject: 'Biology', date: '3d ago' },
		{ id: 7, mode: '5v5 Ranked', result: 'Win', score: '15-7', elo: '+26', subject: 'Chemistry', date: '3d ago' },
	];

	const tierColors: Record<string, string> = {
		Bronze: '#cd7f32', Silver: '#c0c0c0', Gold: '#ffd700',
		Platinum: '#00d2d3', Diamond: '#a29bfe',
	};

	const xpToNextLevel = 5000;
	const xpPercent = Math.round((mockUser.xp / xpToNextLevel) * 100);
</script>

<svelte:head><title>{mockUser.name} – CompeteHub</title></svelte:head>

<div class="max-w-4xl mx-auto px-4 py-6">

	<!-- Profile header card -->
	<div class="doodle-card p-6 mb-6 flex flex-col sm:flex-row gap-5 items-start">
		<!-- Avatar -->
		<div class="w-24 h-24 rounded-2xl border-4 border-black flex items-center justify-center
			text-4xl font-black bg-purple-100 text-purple-700 shrink-0"
			style="box-shadow: 4px 4px 0 #1a1a1a;">
			{mockUser.name[0]}
		</div>

		<div class="flex-1">
			<div class="flex flex-wrap items-start justify-between gap-3 mb-2">
				<div>
					<h1 class="text-2xl font-black leading-tight">{mockUser.name}</h1>
					<p class="text-gray-400 text-sm font-semibold">@{mockUser.username}</p>
				</div>
				<div class="flex gap-2">
					<button class="btn btn-sm doodle-btn bg-white">✏️ Edit Profile</button>
					<button class="btn btn-sm doodle-btn" style="background: var(--color-purple); color: white;">⚔️ Challenge</button>
				</div>
			</div>

			<!-- Tier badge + rank -->
			<div class="flex flex-wrap gap-2 mb-4">
				<span class="doodle-badge" style="background: {tierColors[mockUser.tier]}30; color: {tierColors[mockUser.tier]}; border-color: {tierColors[mockUser.tier]}">
					🏅 {mockUser.tier}
				</span>
				<span class="doodle-badge bg-purple-50 text-purple-700 border-purple-200">
					Global Rank: {mockUser.rank}
				</span>
				<span class="doodle-badge bg-gray-100 text-gray-600 border-gray-300">
					📅 Joined {mockUser.joinedDate}
				</span>
			</div>

			<!-- XP bar -->
			<div>
				<div class="flex justify-between text-xs font-bold mb-1">
					<span>Level {mockUser.level}</span>
					<span class="text-gray-400">{mockUser.xp} / {xpToNextLevel} XP</span>
				</div>
				<div class="w-full bg-gray-200 rounded-full h-3 border-2 border-black overflow-hidden">
					<div class="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all"
						style="width: {xpPercent}%"></div>
				</div>
			</div>
		</div>
	</div>

	<!-- Stats row -->
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
		{#each [
			{ label: 'Total Wins', value: mockUser.wins, icon: '🏆', color: '#ffd700' },
			{ label: 'Matches Played', value: mockUser.matches, icon: '⚔️', color: '#4285f4' },
			{ label: 'Win Rate', value: mockUser.winRate + '%', icon: '📈', color: '#00b894' },
			{ label: 'ELO Rating', value: mockUser.elo, icon: '⭐', color: '#fd79a8' },
		] as s}
			<div class="doodle-card p-4 text-center">
				<div class="text-2xl mb-1">{s.icon}</div>
				<div class="text-2xl font-black" style="color: {s.color}">{s.value}</div>
				<div class="text-xs text-gray-400 font-semibold">{s.label}</div>
			</div>
		{/each}
	</div>

	<div class="grid lg:grid-cols-3 gap-6">
		<!-- Recent matches -->
		<div class="lg:col-span-2">
			<h2 class="text-xl font-black mb-4">📊 Recent Matches</h2>
			<div class="doodle-card overflow-hidden">
				<div class="overflow-x-auto">
					<table class="table w-full">
						<thead>
							<tr class="border-b-2 border-black bg-gray-50 text-xs font-black">
								<th>Mode</th>
								<th>Subject</th>
								<th>Score</th>
								<th>ELO</th>
								<th>Date</th>
							</tr>
						</thead>
						<tbody>
							{#each recentMatches as m}
								<tr class="border-b border-gray-100 hover:bg-gray-50">
									<td>
										<div class="flex items-center gap-2">
											<span class="w-2 h-2 rounded-full"
												style="background: {m.result === 'Win' ? '#00b894' : '#e17055'}"></span>
											<span class="text-xs font-bold">{m.mode}</span>
										</div>
									</td>
									<td class="text-xs text-gray-500">{m.subject}</td>
									<td class="text-xs font-bold">{m.score}</td>
									<td>
										<span class="text-xs font-black" style="color: {m.result === 'Win' ? '#00b894' : '#e17055'}">
											{m.elo}
										</span>
									</td>
									<td class="text-xs text-gray-400">{m.date}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- Achievements -->
		<div>
			<h2 class="text-xl font-black mb-4">🎖️ Achievements</h2>
			<div class="flex flex-col gap-3">
				{#each achievements as a}
					<div class="doodle-card p-3 flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl border-2 border-black flex items-center
							justify-center text-xl bg-yellow-50 shrink-0">
							{a.icon}
						</div>
						<div>
							<p class="text-sm font-black">{a.label}</p>
							<p class="text-xs text-gray-400">{a.desc}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

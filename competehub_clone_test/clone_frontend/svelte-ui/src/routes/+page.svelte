<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<svelte:head>
	<title>CompeteHub – Play 5v5 Multiplayer Knowledge Battles for JEE, NEET & GATE</title>
	<meta name="description" content="Turn exam prep into a game. Play 5v5 quiz battles, ranked duels and solo challenges built on JEE, NEET & GATE question banks." />
</svelte:head>

<!-- Minimal top bar for landing -->
<header class="flex items-center justify-between px-6 py-4 bg-white border-b-2 border-black"
	style="box-shadow: 0 2px 0 #1a1a1a;">
	<span class="font-black text-2xl tracking-tight">
		<span style="color: var(--color-purple)">Compete</span>Hub
	</span>
	<div class="flex gap-2">
		<a href="/home" class="btn btn-ghost btn-sm font-semibold">Browse</a>
		<a href="/auth" class="btn btn-sm doodle-btn"
			style="background: var(--color-purple); color: white;">Login</a>
	</div>
</header>

<!-- Hero -->
<section class="min-h-[85vh] bg-[#fffef9] flex items-center px-6 py-12">
	<div class="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">

		<!-- Left: text content -->
		<div>
			<div class="inline-flex items-center gap-2 doodle-badge mb-6"
				style="background: #f3f0ff; color: var(--color-purple); border-color: var(--color-purple);">
				<span>⚡</span>
				<span>COMPETEHUB · BETA</span>
			</div>

			<h1 class="text-5xl lg:text-7xl font-black leading-[1.05] mb-6 text-[#1a1a1a]">
				COMPETE.<br />
				<span style="color: var(--color-purple)">LEARN.</span><br />
				DOMINATE.
			</h1>

			<p class="text-lg text-gray-600 mb-8 max-w-md leading-relaxed">
				Join students mastering JEE & GATE through competitive gaming.
				Challenge friends, climb leaderboards and turn studying into an adventure.
			</p>

			<div class="flex flex-col sm:flex-row gap-3 mb-6">
				<a href="/auth"
					class="btn btn-lg doodle-btn flex-1 sm:flex-none"
					style="background: var(--color-purple); color: white; font-size: 1.05rem;">
					🚀 Get Started — Free
				</a>
				<a href="/home"
					class="btn btn-lg doodle-btn flex-1 sm:flex-none bg-white"
					style="color: #1a1a1a; font-size: 1.05rem;">
					▶ Continue as Guest
				</a>
			</div>

			<p class="text-sm text-gray-400 italic">
				No credit card required · Free to start · Join student community
			</p>

			<!-- Stats row -->
			<div class="flex flex-wrap gap-3 mt-8">
				{#each [
					{ value: '10K+', label: 'Questions' },
					{ value: '5K+', label: 'Students' },
					{ value: 'Real-time', label: 'Battles' },
					{ value: '100%', label: 'Free' },
				] as stat}
					<div class="stat-pill" style="border-color: #d1d5db;">
						<span class="font-black" style="color: var(--color-purple)">{stat.value}</span>
						<span class="text-gray-500">{stat.label}</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Right: fake live match card -->
		<div class="flex justify-center lg:justify-end">
			<div class="doodle-card p-6 max-w-sm w-full" style="box-shadow: 8px 8px 0px #1a1a1a;">
				<div class="flex items-center justify-between mb-4">
					<span class="doodle-badge" style="background: #fef3c7; color: #92400e; border-color: #d97706;">
						🔴 LIVE
					</span>
					<span class="text-xs text-gray-400 font-semibold">5v5 · Round 3/5</span>
				</div>

				<!-- Teams -->
				<div class="flex items-center gap-3 mb-5">
					<!-- Team A -->
					<div class="flex-1">
						<div class="text-xs text-gray-400 font-bold mb-1.5">TEAM ALPHA</div>
						<div class="flex gap-1">
							{#each ['A', 'B', 'C', 'D', 'E'] as p}
								<div class="w-8 h-8 rounded-full border-2 border-black flex items-center
									justify-center text-xs font-black bg-purple-100 text-purple-700">
									{p}
								</div>
							{/each}
						</div>
					</div>

					<!-- Score -->
					<div class="text-center px-2">
						<div class="text-3xl font-black">3<span class="text-gray-300 mx-1">:</span>2</div>
						<div class="text-[10px] text-gray-400 font-bold uppercase">Score</div>
					</div>

					<!-- Team B -->
					<div class="flex-1 text-right">
						<div class="text-xs text-gray-400 font-bold mb-1.5">TEAM BETA</div>
						<div class="flex gap-1 justify-end">
							{#each ['F', 'G', 'H', 'I', 'J'] as p}
								<div class="w-8 h-8 rounded-full border-2 border-black flex items-center
									justify-center text-xs font-black bg-blue-100 text-blue-700">
									{p}
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Current question -->
				<div class="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 mb-4">
					<div class="text-xs font-bold text-gray-400 mb-1">CURRENT QUESTION · Physics</div>
					<p class="text-sm font-semibold text-gray-800">
						A particle moves in a circle of radius R. The angular velocity is ω. Find the centripetal acceleration.
					</p>
				</div>

				<!-- Progress -->
				<div class="flex items-center gap-2">
					<span class="text-xs text-gray-400 font-semibold">⏱ 12s</span>
					<div class="flex-1 bg-gray-200 rounded-full h-2 border border-black">
						<div class="bg-purple-500 h-full rounded-full" style="width: 45%;"></div>
					</div>
					<span class="text-xs text-gray-400 font-semibold">25s</span>
				</div>

				<div class="mt-4 text-center">
					<button onclick={() => goto('/auth')}
						class="btn btn-sm doodle-btn w-full"
						style="background: var(--color-purple); color: white;">
						Join a Battle →
					</button>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Features -->
<section class="bg-white border-t-2 border-black py-16 px-6">
	<div class="max-w-6xl mx-auto">
		<h2 class="text-4xl font-black text-center mb-2">Why CompeteHub?</h2>
		<p class="text-center text-gray-500 mb-12">Everything you need to ace JEE, NEET & GATE</p>

		<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
			{#each [
				{ icon: '🧠', title: 'Smart Learning', desc: 'Practice 10,000+ JEE & GATE questions with detailed explanations and adaptive difficulty.', color: '#a29bfe' },
				{ icon: '🏆', title: 'Compete & Win', desc: 'Challenge friends in real-time battles, climb leaderboards, and earn achievements.', color: '#fd79a8' },
				{ icon: '👥', title: 'Community', desc: 'Join a vibrant community of learners, share strategies, and grow together.', color: '#74b9ff' },
				{ icon: '📈', title: 'Track Progress', desc: 'Monitor your improvement with detailed analytics and personalized insights.', color: '#55efc4' },
			] as feature}
				<div class="doodle-card p-6">
					<div class="w-14 h-14 rounded-2xl border-2 border-black flex items-center justify-center text-2xl mb-4"
						style="background: {feature.color}">
						{feature.icon}
					</div>
					<h3 class="text-lg font-black mb-2">{feature.title}</h3>
					<p class="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Game Modes Preview -->
<section class="py-16 px-6 bg-[#fffef9]">
	<div class="max-w-6xl mx-auto">
		<h2 class="text-4xl font-black text-center mb-2">Game Modes</h2>
		<p class="text-center text-gray-500 mb-12">Pick your challenge</p>
		<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
			{#each [
				{ icon: '👑', title: 'Ranked Multiplayer', desc: 'ELO-based competitive 5v5 team battles', badge: 'HOT', color: '#4285f4' },
				{ icon: '👥', title: '5v5 Custom Rooms', desc: 'Private matches with friends and custom settings', badge: 'POPULAR', color: '#9c27b0' },
				{ icon: '🧠', title: 'Solo Challenge', desc: 'Practice at your own pace with smart filtering', badge: 'SOLO', color: '#0f9d58' },
				{ icon: '🧩', title: 'Crossword Quest', desc: 'Solve crosswords with JEE/GATE questions as clues', badge: 'NEW', color: '#673ab7' },
				{ icon: '🐉', title: 'Dragon Out Survival', desc: 'Survive waves by answering questions correctly', badge: 'NEW', color: '#e91e63' },
				{ icon: '⚡', title: 'Speed Race', desc: 'Timed numerical problems for max adrenaline', badge: 'FAST', color: '#ff6b35' },
			] as mode}
				<div class="doodle-card p-5 flex gap-4">
					<div class="w-12 h-12 rounded-xl border-2 border-black flex items-center justify-center text-2xl shrink-0"
						style="background: {mode.color}20">
						{mode.icon}
					</div>
					<div class="min-w-0">
						<div class="flex items-center gap-2 mb-1">
							<h3 class="font-black text-sm">{mode.title}</h3>
							<span class="doodle-badge text-[10px]"
								style="background: {mode.color}20; color: {mode.color}; border-color: {mode.color}">
								{mode.badge}
							</span>
						</div>
						<p class="text-xs text-gray-500">{mode.desc}</p>
					</div>
				</div>
			{/each}
		</div>
		<div class="text-center mt-10">
			<a href="/home" class="btn btn-lg doodle-btn"
				style="background: var(--color-purple); color: white;">
				Explore All Modes →
			</a>
		</div>
	</div>
</section>

<!-- CTA -->
<section class="py-16 px-6 bg-white border-t-2 border-black">
	<div class="max-w-2xl mx-auto text-center">
		<div class="doodle-card p-10 inline-block w-full" style="box-shadow: 8px 8px 0px #1a1a1a;">
			<h2 class="text-4xl font-black mb-3">Ready to Level Up?</h2>
			<p class="text-gray-500 mb-6">Join thousands of students who are already competing and winning.</p>
			<a href="/auth" class="btn btn-lg doodle-btn mr-3"
				style="background: var(--color-purple); color: white;">
				🚀 Start for Free
			</a>
			<a href="/home" class="btn btn-lg doodle-btn bg-white text-black">
				Browse as Guest
			</a>
		</div>
	</div>
</section>

<!-- Footer -->
<footer class="bg-[#1a1a1a] text-white px-6 py-10">
	<div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
		<span class="font-black text-xl">
			<span style="color: var(--color-purple)">Compete</span>Hub
		</span>
		<div class="flex gap-6 text-sm text-gray-400">
			<a href="/privacy" class="hover:text-white transition-colors">Privacy</a>
			<a href="/terms" class="hover:text-white transition-colors">Terms</a>
			<a href="/contact" class="hover:text-white transition-colors">Contact</a>
			<a href="/community" class="hover:text-white transition-colors">Community</a>
		</div>
		<p class="text-xs text-gray-500">© 2025 CompeteHub. Built for students.</p>
	</div>
</footer>

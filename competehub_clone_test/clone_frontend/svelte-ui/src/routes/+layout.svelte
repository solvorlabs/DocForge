<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';

	let { children } = $props();

	let drawerOpen = $state(false);

	const navLinks = [
		{ href: '/home', label: 'Home', icon: '🏠' },
		{ href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
		{ href: '/question-bank', label: 'Question Bank', icon: '📚' },
		{ href: '/ranked', label: 'Ranked', icon: '⚔️' },
		{ href: '/solo-challenge', label: 'Solo Challenge', icon: '🧠' },
		{ href: '/community', label: 'Community', icon: '💬' },
		{ href: '/friends', label: 'Friends', icon: '👥' },
	];

	const mobileLinks = [
		{ href: '/home', label: 'Home', icon: '🏠' },
		{ href: '/leaderboard', label: 'Ranks', icon: '🏆' },
		{ href: '/question-bank', label: 'QB', icon: '📚' },
		{ href: '/ranked', label: 'Ranked', icon: '⚔️' },
		{ href: '/profile', label: 'Profile', icon: '👤' },
	];

	// Pages that use their own full layout (no shell)
	const noShellRoutes = ['/', '/landing', '/auth'];
	let useShell = $derived(!noShellRoutes.includes(page.url.pathname) && !page.url.pathname.startsWith('/auth'));
</script>

<svelte:head>
	<title>CompeteHub – Compete. Learn. Dominate.</title>
	<meta name="description" content="Multiplayer knowledge battles for JEE, NEET & GATE preparation." />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
</svelte:head>

{#if useShell}
	<!-- App Shell with Drawer Sidebar -->
	<div class="drawer lg:drawer-open min-h-screen bg-[#fffef9]">
		<input id="app-drawer" type="checkbox" class="drawer-toggle" bind:checked={drawerOpen} />

		<!-- Main content area -->
		<div class="drawer-content flex flex-col">
			<!-- Top Navbar -->
			<nav class="navbar bg-white border-b-2 border-black sticky top-0 z-40 px-4 gap-2"
				style="box-shadow: 0 2px 0 #1a1a1a;">
				<!-- Mobile hamburger -->
				<div class="flex-none lg:hidden">
					<label for="app-drawer" class="btn btn-ghost btn-sm">
						<span class="text-xl">☰</span>
					</label>
				</div>

				<!-- Logo -->
				<div class="flex-1 lg:hidden">
					<a href="/home" class="font-black text-xl tracking-tight">
						<span style="color: var(--color-purple)">Compete</span>Hub
					</a>
				</div>

				<!-- Right actions -->
				<div class="flex-none flex items-center gap-2">
					<a href="/profile" class="btn btn-ghost btn-sm gap-1">
						<span>👤</span>
						<span class="hidden sm:inline font-semibold">Profile</span>
					</a>
					<a href="/auth" class="btn btn-sm doodle-btn"
						style="background: var(--color-purple); color: white;">
						Login
					</a>
				</div>
			</nav>

			<!-- Page content -->
			<main class="flex-1 pb-20 lg:pb-0">
				{@render children()}
			</main>
		</div>

		<!-- Sidebar -->
		<div class="drawer-side z-50">
			<label for="app-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
			<aside class="bg-white min-h-full w-64 flex flex-col border-r-2 border-black"
				style="box-shadow: 2px 0 0 #1a1a1a;">
				<!-- Logo -->
				<div class="p-5 border-b-2 border-black">
					<a href="/home" class="font-black text-2xl tracking-tight" onclick={() => drawerOpen = false}>
						<span style="color: var(--color-purple)">Compete</span>Hub
					</a>
					<p class="text-xs text-gray-400 mt-0.5 font-medium">COMPETE · LEARN · DOMINATE</p>
				</div>

				<!-- Nav links -->
				<nav class="flex-1 p-4 flex flex-col gap-1">
					{#each navLinks as link}
						<a
							href={link.href}
							class="nav-link {page.url.pathname.startsWith(link.href) ? 'active' : ''}"
							onclick={() => drawerOpen = false}
						>
							<span class="text-lg">{link.icon}</span>
							<span>{link.label}</span>
						</a>
					{/each}
				</nav>

				<!-- Bottom links -->
				<div class="p-4 border-t-2 border-black">
					<a href="/settings" class="nav-link" onclick={() => drawerOpen = false}>
						<span class="text-lg">⚙️</span>
						<span>Settings</span>
					</a>
					<a href="/auth" class="btn doodle-btn w-full mt-3"
						style="background: var(--color-purple); color: white;">
						Login / Register
					</a>
				</div>
			</aside>
		</div>
	</div>

	<!-- Mobile bottom nav -->
	<nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black z-40 flex"
		style="box-shadow: 0 -2px 0 #1a1a1a;">
		{#each mobileLinks as link}
			<a
				href={link.href}
				class="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-bold
				{page.url.pathname.startsWith(link.href) ? 'text-purple-600' : 'text-gray-500'}"
			>
				<span class="text-lg">{link.icon}</span>
				<span>{link.label}</span>
			</a>
		{/each}
	</nav>
{:else}
	{@render children()}
{/if}

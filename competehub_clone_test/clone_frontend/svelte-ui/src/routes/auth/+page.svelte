<script lang="ts">
	import { goto } from '$app/navigation';

	let tab = $state<'login' | 'register'>('login');
	let loginEmail = $state('');
	let loginPassword = $state('');
	let regUsername = $state('');
	let regEmail = $state('');
	let regPassword = $state('');
	let regConfirm = $state('');
	let loading = $state(false);
	let error = $state('');

	async function handleLogin() {
		if (!loginEmail || !loginPassword) { error = 'Please fill all fields'; return; }
		loading = true; error = '';
		await new Promise(r => setTimeout(r, 800));
		loading = false;
		goto('/home');
	}

	async function handleRegister() {
		if (!regUsername || !regEmail || !regPassword) { error = 'Please fill all fields'; return; }
		if (regPassword !== regConfirm) { error = 'Passwords do not match'; return; }
		loading = true; error = '';
		await new Promise(r => setTimeout(r, 800));
		loading = false;
		goto('/home');
	}
</script>

<svelte:head><title>Login – CompeteHub</title></svelte:head>

<div class="min-h-screen bg-[#fffef9] flex flex-col">
	<!-- Header -->
	<header class="flex items-center justify-between px-6 py-4 bg-white border-b-2 border-black"
		style="box-shadow: 0 2px 0 #1a1a1a;">
		<a href="/" class="font-black text-2xl tracking-tight">
			<span style="color: var(--color-purple)">Compete</span>Hub
		</a>
		<a href="/home" class="btn btn-ghost btn-sm font-semibold">Browse as Guest →</a>
	</header>

	<div class="flex-1 flex items-center justify-center p-6">
		<div class="w-full max-w-md">
			<div class="doodle-card p-8" style="box-shadow: 6px 6px 0px #1a1a1a;">

				<!-- Title -->
				<div class="text-center mb-6">
					<h1 class="text-3xl font-black mb-1">
						{tab === 'login' ? 'Welcome Back! 👋' : 'Join CompeteHub 🚀'}
					</h1>
					<p class="text-sm text-gray-500">
						{tab === 'login' ? 'Login to continue your journey' : 'Start competing for free'}
					</p>
				</div>

				<!-- Tabs -->
				<div class="flex mb-6 border-2 border-black rounded-xl overflow-hidden">
					<button
						class="flex-1 py-2.5 font-black text-sm transition-all
						{tab === 'login' ? 'text-white' : 'bg-white text-gray-500'}"
						style={tab === 'login' ? 'background: var(--color-purple)' : ''}
						onclick={() => { tab = 'login'; error = ''; }}
					>Login</button>
					<button
						class="flex-1 py-2.5 font-black text-sm border-l-2 border-black transition-all
						{tab === 'register' ? 'text-white' : 'bg-white text-gray-500'}"
						style={tab === 'register' ? 'background: var(--color-purple)' : ''}
						onclick={() => { tab = 'register'; error = ''; }}
					>Register</button>
				</div>

				{#if error}
					<div class="alert mb-4 border-2 border-red-400 bg-red-50 text-red-700 text-sm font-semibold rounded-xl">
						⚠️ {error}
					</div>
				{/if}

				{#if tab === 'login'}
					<!-- Login form -->
					<div class="flex flex-col gap-4">
						<div>
							<label class="text-sm font-bold text-gray-700 mb-1.5 block">Email Address</label>
							<input
								type="email"
								placeholder="you@example.com"
								class="input w-full doodle-input"
								bind:value={loginEmail}
							/>
						</div>
						<div>
							<div class="flex justify-between mb-1.5">
								<label class="text-sm font-bold text-gray-700">Password</label>
								<a href="/auth/forgot" class="text-xs text-purple-600 font-semibold hover:underline">Forgot Password?</a>
							</div>
							<input
								type="password"
								placeholder="••••••••"
								class="input w-full doodle-input"
								bind:value={loginPassword}
							/>
						</div>
						<button
							class="btn doodle-btn w-full mt-2"
							style="background: var(--color-purple); color: white; font-size: 1rem;"
							onclick={handleLogin}
							disabled={loading}
						>
							{loading ? '⏳ Logging in...' : '🔐 Login'}
						</button>
					</div>
				{:else}
					<!-- Register form -->
					<div class="flex flex-col gap-4">
						<div>
							<label class="text-sm font-bold text-gray-700 mb-1.5 block">Username</label>
							<input type="text" placeholder="coolstudent99" class="input w-full doodle-input" bind:value={regUsername} />
						</div>
						<div>
							<label class="text-sm font-bold text-gray-700 mb-1.5 block">Email Address</label>
							<input type="email" placeholder="you@example.com" class="input w-full doodle-input" bind:value={regEmail} />
						</div>
						<div>
							<label class="text-sm font-bold text-gray-700 mb-1.5 block">Password</label>
							<input type="password" placeholder="••••••••" class="input w-full doodle-input" bind:value={regPassword} />
						</div>
						<div>
							<label class="text-sm font-bold text-gray-700 mb-1.5 block">Confirm Password</label>
							<input type="password" placeholder="••••••••" class="input w-full doodle-input" bind:value={regConfirm} />
						</div>
						<button
							class="btn doodle-btn w-full mt-2"
							style="background: var(--color-purple); color: white; font-size: 1rem;"
							onclick={handleRegister}
							disabled={loading}
						>
							{loading ? '⏳ Creating account...' : '🚀 Create Account'}
						</button>
					</div>
				{/if}

				<!-- Divider -->
				<div class="flex items-center gap-3 my-5">
					<div class="flex-1 h-px bg-gray-200"></div>
					<span class="text-xs text-gray-400 font-semibold">OR</span>
					<div class="flex-1 h-px bg-gray-200"></div>
				</div>

				<!-- Google -->
				<button class="btn doodle-btn w-full bg-white mb-4">
					<span>🔵</span> Continue with Google
				</button>

				<!-- Guest -->
				<a href="/home" class="block text-center text-sm text-gray-500 font-semibold hover:text-purple-600 transition-colors">
					▶ Continue as Guest (no account needed)
				</a>
			</div>

			<p class="text-center text-xs text-gray-400 mt-4">
				By continuing you agree to our
				<a href="/terms" class="underline">Terms</a> and
				<a href="/privacy" class="underline">Privacy Policy</a>
			</p>
		</div>
	</div>
</div>

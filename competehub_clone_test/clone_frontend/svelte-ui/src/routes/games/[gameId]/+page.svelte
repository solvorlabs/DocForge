<script lang="ts">
  import { page } from '$app/state';
  const gameId: string = $derived(page.params.gameId ?? '');
  const names: Record<string, string> = {
    'crossword': 'Crossword Quest 🧩',
    'dragon-out': 'Dragon Out Survival 🐉',
    'runner': 'Endless Runner 🏃',
  };
  let name = $derived(names[gameId] ?? gameId);
</script>
<svelte:head><title>{name} – CompeteHub</title></svelte:head>
<div class="min-h-[60vh] flex flex-col items-center justify-center p-8">
  <div class="doodle-card bg-white rounded-2xl p-10 text-center max-w-md w-full">
    <div class="text-6xl mb-4">🎮</div>
    <h1 class="text-3xl font-black mb-2">{name}</h1>
    <p class="text-gray-500 mb-6">Backend integration in progress. Check back soon!</p>
    <a href="/home" class="btn doodle-btn" style="background: var(--color-purple); color: white;">← Back to Home</a>
  </div>
</div>

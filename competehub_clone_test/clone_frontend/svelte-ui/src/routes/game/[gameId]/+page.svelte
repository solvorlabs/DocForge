<script lang="ts">
  import { page } from '$app/state';
  const gameId: string = $derived(page.params.gameId ?? '');
  const names: Record<string, string> = {
    'equation-builder': 'Equation Builder 🔢',
    'boss-mode': 'Boss Mode 🛡️',
    'quantum-chess': 'Quantum Chess ♟️',
    'escape-lab': 'Escape Lab 🔬',
    'gene-splicer': 'Gene Splicer 🧬',
    'ai-training': 'AI Training 🤖',
    'numerical-speed-race': 'Numerical Speed Race ⚡',
  };
  const comingSoon = ['quantum-chess','escape-lab','gene-splicer','ai-training'];
  let name: string = $derived(names[gameId] ?? gameId);
  let isSoon: boolean = $derived(comingSoon.includes(gameId));
</script>
<svelte:head><title>{name} – CompeteHub</title></svelte:head>
<div class="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8">
  <div class="doodle-card bg-white rounded-2xl p-10 text-center max-w-md w-full">
    <div class="text-6xl mb-4">{isSoon ? '🚧' : '🎮'}</div>
    <h1 class="text-3xl font-black mb-2">{name}</h1>
    <p class="text-gray-500 mb-6">{isSoon ? 'This game mode is coming soon!' : 'Backend integration in progress.'}</p>
    <a href="/home" class="btn doodle-btn" style="background: var(--color-purple); color: white;">← Back to Home</a>
  </div>
</div>

<svelte:head><title>Finding Match – CompeteHub</title></svelte:head>
<script lang="ts">
  let searching = $state(true);
  let dots = $state('');
  $effect(() => {
    const i = setInterval(() => { dots = dots.length < 3 ? dots + '.' : ''; }, 500);
    return () => clearInterval(i);
  });
</script>
<div class="min-h-[60vh] flex flex-col items-center justify-center gap-6 p-8">
  <div class="doodle-card p-10 text-center max-w-sm w-full">
    <div class="text-5xl mb-4 animate-bounce">⚔️</div>
    <h1 class="text-2xl font-black mb-2">Finding Match{dots}</h1>
    <p class="text-gray-400 text-sm mb-6">Searching for opponents at your ELO level</p>
    <div class="w-full bg-gray-200 rounded-full h-2 border border-black overflow-hidden mb-4">
      <div class="bg-purple-500 h-full rounded-full animate-pulse" style="width: 60%"></div>
    </div>
    <p class="text-xs text-gray-400 mb-6">Average wait: ~15s · ELO: 1620</p>
    <a href="/ranked" class="btn btn-sm doodle-btn bg-white w-full">Cancel</a>
  </div>
</div>

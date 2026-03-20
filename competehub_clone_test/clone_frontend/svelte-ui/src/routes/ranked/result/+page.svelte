<svelte:head><title>Match Result – CompeteHub</title></svelte:head>
<div class="min-h-[60vh] flex flex-col items-center justify-center p-8">
  <div class="doodle-card p-10 text-center max-w-sm w-full" style="background: linear-gradient(135deg, #00b89420, #4285f420);">
    <div class="text-6xl mb-3">🏆</div>
    <h1 class="text-3xl font-black mb-1">Victory!</h1>
    <p class="text-gray-500 mb-2">You won the ranked match</p>
    <div class="text-2xl font-black text-green-600 mb-6">+24 ELO</div>
    <div class="grid grid-cols-2 gap-3 mb-6">
      <div class="bg-white rounded-xl p-3 border-2 border-black"><div class="font-black text-lg">1620</div><div class="text-xs text-gray-400">New ELO</div></div>
      <div class="bg-white rounded-xl p-3 border-2 border-black"><div class="font-black text-lg text-green-600">+24</div><div class="text-xs text-gray-400">ELO Gained</div></div>
    </div>
    <a href="/ranked" class="btn doodle-btn w-full" style="background: var(--color-purple); color: white;">Back to Ranked</a>
  </div>
</div>

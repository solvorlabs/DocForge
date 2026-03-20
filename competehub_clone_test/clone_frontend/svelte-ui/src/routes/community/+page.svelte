<svelte:head><title>Community – CompeteHub</title></svelte:head>
<div class="max-w-3xl mx-auto px-4 py-8">
  <h1 class="text-3xl font-black mb-2">💬 Community</h1>
  <p class="text-gray-500 mb-6">Latest from the CompeteHub community</p>
  <div class="flex flex-col gap-4">
    {#each [
      { title: 'HackWithMAIT 2024 Winners Announced!', date: 'March 2025', tag: 'Event', emoji: '🏆' },
      { title: 'Welcome to the CompeteHub Community', date: 'February 2025', tag: 'Announcement', emoji: '🎉' },
      { title: 'Ranking Strategies Guide for JEE Students', date: 'January 2025', tag: 'Guide', emoji: '📖' },
    ] as post}
      <div class="doodle-card p-5 flex gap-4">
        <div class="text-3xl">{post.emoji}</div>
        <div>
          <div class="doodle-badge text-[10px] bg-purple-50 text-purple-600 border-purple-200 mb-2">{post.tag}</div>
          <h2 class="font-black">{post.title}</h2>
          <p class="text-xs text-gray-400 mt-1">{post.date}</p>
        </div>
      </div>
    {/each}
  </div>
</div>

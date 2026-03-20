<svelte:head><title>Settings – CompeteHub</title></svelte:head>
<div class="max-w-xl mx-auto px-4 py-8">
  <h1 class="text-3xl font-black mb-6">⚙️ Settings</h1>
  <div class="doodle-card p-6 flex flex-col gap-4">
    {#each [
      { label: 'Change Password', icon: '🔐' },
      { label: 'Notification Preferences', icon: '🔔' },
      { label: 'Theme', icon: '🎨' },
      { label: 'Privacy Settings', icon: '🔒' },
      { label: 'Linked Accounts', icon: '🔗' },
    ] as s}
      <button class="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-left font-semibold">
        <span class="text-xl">{s.icon}</span>
        <span>{s.label}</span>
        <span class="ml-auto text-gray-400">→</span>
      </button>
    {/each}
    <button class="btn doodle-btn mt-2" style="background: #e17055; color: white; border-color: #c0392b;">
      🚪 Log Out
    </button>
  </div>
</div>

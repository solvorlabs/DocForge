<script lang="ts">
  let name = $state(''); let email = $state(''); let message = $state('');
  let sent = $state(false);
  function submit() { if (name && email && message) sent = true; }
</script>
<svelte:head><title>Contact – CompeteHub</title></svelte:head>
<div class="max-w-xl mx-auto px-4 py-8">
  <h1 class="text-3xl font-black mb-2">📬 Contact Us</h1>
  <p class="text-gray-500 mb-6">Have a question, bug report, or feedback? We'd love to hear from you.</p>
  {#if sent}
    <div class="doodle-card p-8 text-center">
      <div class="text-5xl mb-3">✅</div>
      <h2 class="text-xl font-black mb-2">Message Sent!</h2>
      <p class="text-gray-500">We'll get back to you within 24 hours.</p>
    </div>
  {:else}
    <div class="doodle-card p-6 flex flex-col gap-4">
      <div><label class="text-sm font-bold block mb-1.5">Your Name</label><input type="text" class="input w-full doodle-input" bind:value={name} placeholder="Arjun Sharma" /></div>
      <div><label class="text-sm font-bold block mb-1.5">Email</label><input type="email" class="input w-full doodle-input" bind:value={email} placeholder="you@example.com" /></div>
      <div><label class="text-sm font-bold block mb-1.5">Message</label><textarea class="textarea w-full doodle-input h-32" bind:value={message} placeholder="Tell us what's on your mind..."></textarea></div>
      <button class="btn doodle-btn" style="background: var(--color-purple); color: white;" onclick={submit}>Send Message 📤</button>
    </div>
  {/if}
</div>

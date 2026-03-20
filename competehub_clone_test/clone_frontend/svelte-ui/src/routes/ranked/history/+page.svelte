<svelte:head><title>Match History – CompeteHub</title></svelte:head>
<div class="max-w-3xl mx-auto px-4 py-8">
  <h1 class="text-3xl font-black mb-6">📋 Ranked History</h1>
  <div class="doodle-card overflow-hidden">
    <table class="table w-full">
      <thead><tr class="border-b-2 border-black bg-gray-50 text-xs font-black"><th>Opponent</th><th>Result</th><th>ELO Change</th><th>Date</th></tr></thead>
      <tbody>
        {#each [
          {opp:'Priya K.',result:'Win',elo:'+24',date:'2h ago'},
          {opp:'Dev T.',result:'Loss',elo:'-18',date:'5h ago'},
          {opp:'Rohan M.',result:'Win',elo:'+21',date:'1d ago'},
          {opp:'Sneha P.',result:'Win',elo:'+19',date:'1d ago'},
          {opp:'Anika R.',result:'Loss',elo:'-22',date:'2d ago'},
          {opp:'Karan B.',result:'Win',elo:'+17',date:'3d ago'},
          {opp:'Meera J.',result:'Win',elo:'+23',date:'4d ago'},
        ] as m}
          <tr class="border-b border-gray-100">
            <td class="font-bold text-sm">{m.opp}</td>
            <td><span class="font-bold text-sm" style="color: {m.result==='Win'?'#00b894':'#e17055'}">{m.result}</span></td>
            <td><span class="font-black" style="color: {m.result==='Win'?'#00b894':'#e17055'}">{m.elo}</span></td>
            <td class="text-xs text-gray-400">{m.date}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

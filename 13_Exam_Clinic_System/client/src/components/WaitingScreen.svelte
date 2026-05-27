<script>
  import { onMount } from 'svelte';
  import { fetchGet } from '../util/fetchUtil.js';
  import toastr from 'toastr';
  import socket from '../store/socketStore.js'
  import { BASE_URL } from '../store/urlStore.js';
  import { isLoading, showLoading, hideLoading, showError } from '../store/loadingStore.js'; 


  let roomsEmpty = [];
  let roomsFilled = [];


  onMount(async () => {
    socket.on('room-assignment', async () => {
      await loadRooms();
    });

    await loadRooms();
  });

  async function loadRooms() {
    try {
      

      const res = await fetchGet('/rooms');

      if (res.ok) {
        const allRooms = res.data.data;

        roomsEmpty = allRooms.filter(
          room => room.status === 'free'
        );

        roomsFilled = allRooms.filter(
          room => room.status === 'occupied'
        );
      } else {
          toastr.error('Failed loading rooms');
          showError(res.data.errorMessage)
      }

    } finally {
      hideLoading();
    }
  }
</script>

<div class="page-container">
    <div class="waiting-screen-container">

    <div class="form-section">
        <h3>Free Rooms</h3>

        {#if roomsEmpty.length > 0}
        {#each roomsEmpty as room}
            <p>{room.name}</p>
        {/each}
        {:else}
        <p>No free rooms</p>
        {/if}
    </div>

    <div class="form-section">
        <h3>Occupied Rooms</h3>

        {#if roomsFilled.length > 0}
        {#each roomsFilled as room}
            <p>{room.name}</p>
        {/each}
        {:else}
        <p>No occupied rooms</p>
        {/if}
    </div>

    </div>
</div>


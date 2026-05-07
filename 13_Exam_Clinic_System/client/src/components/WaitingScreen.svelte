<script>
  import { onMount } from 'svelte';
  import { fetchGet } from '../util/fetchUtil.js';
  import toastr from 'toastr';
  import io from 'socket.io-client';
  import { BASE_URL } from '../store/urlStore.js';

  let isLoading = false;

  let roomsEmpty = [];
  let roomsFilled = [];

  let socket;

  onMount(async () => {
    socket = io(BASE_URL);

    socket.on('room-assignment', async () => {
      await loadRooms();
    });

    await loadRooms();
  });

  async function loadRooms() {
    try {
      isLoading = true;

      const res = await fetchGet('/rooms');

      if (res.ok) {
        const allRooms = res.data.data;

        roomsEmpty = allRooms.filter(
          room => room.status === 'free'
        );

        roomsFilled = allRooms.filter(
          room => room.status === 'occupied'
        );
      }

    } catch (err) {
      toastr.error('Failed loading rooms');

    } finally {
      isLoading = false;
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


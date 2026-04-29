<script>
  import { onMount } from 'svelte';
  import { fetchGet, fetchPost } from '../util/fetchUtil.js';
  import toastr from 'toastr';
  import { user } from '../store/userStore.js';

  let currentStep = 1;
  let isLoading = false;

  let rooms = [];
  let patients = [];

  let selectedRoom = null;
  let selectedPatient = null;

  onMount(async () => {
    try {
      isLoading = true;

      const res = await fetchGet('/users/me');

      if (res.ok) {
        $user = res.data.data;

        if ($user?.role !== 'coordinator') {
          toastr.error('Unauthorized');
          return;
        }

        await loadRooms();
      }
    } catch (err) {
      toastr.error('Session check failed');
    } finally {
      isLoading = false;
    }
  });

  async function loadRooms() {
    try {
      isLoading = true;

      const res = await fetchGet('/rooms');

      if (res.ok) {
        rooms = res.data.data;
      }
    } catch (err) {
      toastr.error('Failed loading rooms');
    } finally {
      isLoading = false;
    }
  }

  async function chooseRoom(room) {
    selectedRoom = room;
    currentStep = 2;
    await loadPatients();
  }

  async function loadPatients() {
    try {
      isLoading = true;

      const res = await fetchGet('/patients');

      if (res.ok) {
        patients = res.data.data.filter(
          patient => patient.status === 'waiting'
        );
      }
    } catch (err) {
      toastr.error('Failed loading patients');
    } finally {
      isLoading = false;
    }
  }

  async function assignPatient(patient) {
    try {
      isLoading = true;

      const res = await fetchPost('/assign-room', {
        patientId: patient.id,
        roomId: selectedRoom.id
      });

      if (res.ok) {
        toastr.success('Patient assigned successfully');
        selectedPatient = patient;
        await loadRooms();
        currentStep = 1;
      }
    } catch (err) {
      toastr.error('Assignment failed');
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="auth-container">
  {#if $user?.role === 'coordinator'}

    {#if currentStep === 1 }
      <div class="form-section">
        <h3>Select Room</h3>

        {#if isLoading}
          <p>Loading...</p>
        {:else}
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Choose</th>
              </tr>
            </thead>

            <tbody>
              {#each rooms as room}
                <tr>
                  <td>{room.name}</td>
                  <td>{room.status}</td>
                  <td>
                    <button
                      class="submit-button"
                      disabled={room.status === 'occupied'}
                      on:click={() => chooseRoom(room)}
                    >
                      Choose
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
      </div>
    {/if}

    {#if currentStep === 2}
      <div class="form-section">
        <h3>{selectedRoom?.name}</h3>

        <button
          class="text-button"
          on:click={() => currentStep = 1}
        >
          Back
        </button>

        {#if isLoading}
          <p>Loading...</p>
        {:else}
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Assign</th>
              </tr>
            </thead>

            <tbody>
              {#each patients as patient}
                <tr>
                  <td>{patient.id}</td>
                  <td>{patient.status}</td>
                  <td>
                    <button
                      class="submit-button"
                      on:click={() => assignPatient(patient)}
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
      </div>
    {/if}

  {/if}
</div>
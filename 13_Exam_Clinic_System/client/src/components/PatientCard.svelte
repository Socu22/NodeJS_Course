<script>
  import { onMount } from 'svelte';
  import { fetchGet } from '../util/fetchUtil.js';
  import toastr from 'toastr';
  import { user, activeFormUser } from '../store/userStore.js';
  import io from 'socket.io-client';
  import { BASE_URL } from '../store/urlStore.js';

  let patient = null;
  let assignedRoom = null;
  let isLoading = false;
  let socket;

  onMount(async () => {
    $activeFormUser = 'patientAndRoomAssignment';

    socket = io(BASE_URL);

    socket.on('room-assignment', (data) => {
      console.log(data);

      if (patient?.id === data.data.patientId) {
        assignedRoom = data.data;
        toastr.success(`Assigned to ${assignedRoom.roomName}`);
      }
    });

    await loadPatient();
  });

  async function loadPatient() {
    try {
      isLoading = true;

      const res = await fetchGet('/patients/me');

      if (res.ok) {
        patient = res.data.data;
      } else {
        toastr.error(res.data.errorMessage || 'Failed loading patient');
      }

    } catch (err) {
      toastr.error('Failed loading patient');
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="auth-container">

  {#if $activeFormUser === 'patientAndRoomAssignment' && $user?.role === 'patient'}
    <div class="form-section">
      <h3>Patient Information</h3>

      {#if isLoading}
        <p>Loading...</p>

      {:else if patient}
        <div class="input-group">
          <label>CPR</label>
          <input readonly value={patient.cpr} />
        </div>

        <div class="input-group">
          <label>Room Name</label>
          <input readonly value={assignedRoom?.roomName ?? patient?.roomName ?? 'Not assigned'} />
        </div>

      {:else}
        <p>No patient found</p>
      {/if}
    </div>
  {/if}

</div>
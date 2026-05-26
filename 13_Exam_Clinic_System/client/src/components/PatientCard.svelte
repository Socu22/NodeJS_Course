<script>
  import { onMount } from 'svelte';
  import { fetchGet, fetchPost, fetchPatch } from '../util/fetchUtil.js';
  import toastr from 'toastr';
  import { user, activeFormUser } from '../store/userStore.js';
  import io from 'socket.io-client';
  import { BASE_URL } from '../store/urlStore.js';

  let patient = null;
  let assignedRoom = null;
  let bloodSamples = [];

  let isLoading = false;
  let socket;
  let activityInterval;

  onMount(() => {
    init();

    // heartbeat: keep patient active while page is open
    activityInterval = setInterval(async () => {
      try {
        await fetchPatch('/patients/activity');
      } catch (err) {
        console.error('Failed updating activity');
      }
    }, 30000);

    return () => {
      socket?.disconnect();

      if (activityInterval) {
        clearInterval(activityInterval);
      }
    };
  });

  async function init() {
    $activeFormUser = 'patientAndRoomAssignment';

    socket = io(BASE_URL);

    socket.on('room-assignment', (data) => {
      console.log('room-assignment:', data);

      if (patient?.id === data.data.patientId) {
        assignedRoom = data.data;
        toastr.success(`Assigned to ${assignedRoom.roomName}`);
      }
    });

    socket.on('patient-confirm', async () => {
      await loadPatient();
    });

    socket.on('patient-blood-sample-change', async () => {
      await loadBloodSamples();
    });

    await loadPatient();
    await loadBloodSamples();
  }

  async function loadPatient() {
    try {
      isLoading = true;

      const res = await fetchGet('/patients/me');

      if (res.ok) {
        patient = res.data.data;

        if (patient.roomName) {
          assignedRoom = {
            roomName: patient.roomName
          };
        }
      } else {
        toastr.error(res.data.errorMessage || 'Failed loading patient');
      }

    } catch (err) {
      toastr.error('Failed loading patient');
    } finally {
      isLoading = false;
    }
  }

  async function loadBloodSamples() {
    try {
      const res = await fetchGet('/blood-samples/me');

      if (res.ok) {
        bloodSamples = res.data.data;
      } else {
        toastr.error(res.data.errorMessage || 'Failed loading samples');
      }

    } catch (err) {
      toastr.error('Failed loading samples');
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
          <input readonly value={assignedRoom?.roomName ?? 'Not assigned'} />
        </div>

        <div class="form-section">
          <h3>Blood Samples</h3>

          {#if bloodSamples.length === 0}
            <p>No samples found</p>
          {:else}
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {#each bloodSamples as sample}
                  <tr>
                    <td>{sample.test_type}</td>
                    <td>{sample.status}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {/if}
        </div>

      {:else}
        <p>No patient found</p>
      {/if}
    </div>

  {/if}
</div>
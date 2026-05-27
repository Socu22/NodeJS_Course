<script>
  import { onMount } from 'svelte';
  import { fetchGet, fetchPost, fetchPatch } from '../util/fetchUtil.js';
  import toastr from 'toastr';
  import { user, activeFormUser } from '../store/userStore.js';
  import socket from '../store/socketStore.js'
  import { BASE_URL } from '../store/urlStore.js';
  import { isLoading, showLoading, hideLoading, showError } from '../store/loadingStore.js'; 


  let patient = null;
  let assignedRoom = null;
  let bloodSamples = [];

  let activityInterval;

 onMount(() => {
  init();

  activityInterval = setInterval(() => {
    updateActivity();
  }, 30000);

  return () => {
    socket?.disconnect();

    if (activityInterval) {
      clearInterval(activityInterval);
    }
  };
});

async function updateActivity() {
  try {
    const res= await fetchPatch('/patients/activity');
    if(res.ok){

    } else {
        toastr.error('Failed updating activity');
        showError(res.data.errorMessage)

    }
  } finally {
    hideLoading()
  }
}

  async function init() {
    $activeFormUser = 'patientAndRoomAssignment';

    socket.on('room-assignment', (data) => {

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
      

      const res = await fetchGet('/patients/me');

      if (res.ok) {
        patient = res.data.data;

        if (patient.roomName) {
          assignedRoom = {
            roomName: patient.roomName
          };
        }
      } else {
        toastr.error('Failed loading patient');
        showError(res.data.errorMessage)

      }

    }finally {
      hideLoading();
    }
  }

  async function loadBloodSamples() {
    try {
      const res = await fetchGet('/blood-samples/me');

      if (res.ok) {
        bloodSamples = res.data.data;
      } else {      
        toastr.error('Failed loading samples');
        showError(res.data.errorMessage)
      }

    } finally {
      hideLoading()
    }
  }
</script>

<div class="auth-container">
  {#if $activeFormUser === 'patientAndRoomAssignment' && $user?.role === 'patient'}

    <div class="form-section">
      <h3>Patient Information</h3>

      {#if $isLoading}
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
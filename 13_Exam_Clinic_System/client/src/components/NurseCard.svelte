<script>
  import { onMount } from 'svelte';
  import { fetchGet, fetchPatch, fetchPost } from '../util/fetchUtil.js';
  import toastr from 'toastr';
  import { user, activeFormAuth } from '../store/userStore.js';
  import socket from '../store/socketStore.js'
  import { BASE_URL_STORE } from '../store/urlStore.js';
  import { isLoading, showLoading, hideLoading, showError } from '../store/loadingStore.js'; 


  let patient = null;
  let bloodSamples = [];

  onMount(async () => {
    try {
      

      const res = await fetchGet('/users/me');

      if (res.ok) {
        $user = res.data.data;

        if ($user?.role !== 'nurse') {
          toastr.error('Unauthorized');
          return;
        }

        activeFormAuth.set('nurseDashboard');

        socket.on('room-assignment', async () => {
          await loadAssignedPatient();
        });

        await loadAssignedPatient();
      }else {      
        toastr.error('Session check failed');
        showError(res.data.errorMessage)


      }
    } finally {
      hideLoading();
    }
  });

  async function loadAssignedPatient() {
    try {
      

      const res = await fetchPost('/patients/assignment');

      if (res.ok) {
        patient = res.data.data;

        if (patient) {
          await loadBloodSamples();
        } else {
          bloodSamples = [];
        }
      } else {
          toastr.error('Failed loading patient');
          showError(res.data.errorMessage)
      }
    } finally {
      hideLoading();
    }
  }

  async function loadBloodSamples() {
    try {
      const res = await fetchGet(`/patients/${patient.id}/blood-samples`);
     
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

  async function advanceSample(sample) {
    try {
      
      
      const res = await fetchPatch(`/blood-samples/${sample.id}`);

      

      if (res.ok) {
        toastr.success('Sample updated');
        socket.emit('nurse-patient-blood-sample-change')
        await loadBloodSamples();
      } else {       
        toastr.error('Update failed');
        showError(res.data.errorMessage)


      }
    } finally {
      hideLoading();
    }
  }

  async function confirmPatient() {
    try {
      

      const res = await fetchPost(`/patients/${patient.id}/confirm`);

      if (res.ok) {
        toastr.success('Patient completed');

        patient = null;
        bloodSamples = [];

        await loadAssignedPatient();

        socket.emit("nurse-patient-confirm", {
          succesMessage: "patient has been confirmed"
        });
      } else {
          toastr.error('Failed finishing patient');
          showError(res.data.errorMessage)

      }
    }  finally {
      hideLoading();
    }
  }

  function getAction(status) {
    if (status === 'collected') return 'Move to cooling';
    if (status === 'cooling') return 'Send sample';
    return 'Done';
  }

  function canConfirmPatient() {
  return bloodSamples.every(
    sample => sample.status !== 'collected'
  );
}
</script>

<div class="auth-container">
  {#if $user?.role === 'nurse'}

    {#if $activeFormAuth === 'nurseDashboard'}

      <!-- PATIENT -->
      <div class="form-section">
        <h3>Assigned Patient</h3>

        {#if $isLoading}
          <p>Loading...</p>

        {:else if patient}
          <div class="input-group">
            <label>CPR</label>
            <input readonly value={patient.cpr} />
          </div>

          <div class="input-group">
            <label>Room</label>
            <input readonly value={patient.roomName ?? 'No room'} />
          </div>

          <div class="input-group">
            <label>Status</label>
            <input readonly value={patient.status} />
          </div>

        {:else}
          <p>No assigned patient</p>
        {/if}
      </div>

      <!-- BLOOD SAMPLES -->
      <div class="form-section">
        <h3>Blood Samples</h3>

        {#if $isLoading}
          <p>Loading...</p>

        {:else if bloodSamples.length > 0 || bloodSamples.length === 0 && patient !==null}
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {#each bloodSamples as sample}
                <tr>
                  <td>{sample.test_type}</td>
                  <td>{sample.status}</td>
                  <td>
                    {#if sample.status !== 'sent'}
                      <button
                        class="submit-button"
                        on:click={() => advanceSample(sample)}
                      >
                        {getAction(sample.status)}
                      </button>
                    {:else}
                      Done
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>

          <button
            class="submit-button"
            disabled={!canConfirmPatient()}
            on:click={confirmPatient}
          >
            Finish Patient
          </button>

        {:else}
          <p>No samples found</p>
        {/if}
      </div>

    {/if}
  {/if}
</div>
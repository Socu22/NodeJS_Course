<script>
  import { onMount } from 'svelte';
  import { fetchGet, fetchPost } from '../util/fetchUtil.js';
  import toastr from 'toastr';
  import { user, activeFormAuth } from '../store/userStore.js';
  import io from 'socket.io-client';
  import {BASE_URL_STORE} from '../store/urlStore.js'


  let isLoading = false;

  let rooms = [];
  let patients = [];

  let selectedRoom = null;
  let selectedPatient = null;

  let socket;

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

        activeFormAuth.set('selectRoom');
        socket = io($BASE_URL_STORE);

        socket.on('patient-confirm', async () => {
          await loadRooms();
        });

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
        rooms = res.data.data.filter(
          room => room.status === "free");
      }
    } catch (err) {
      toastr.error('Failed loading rooms');
    } finally {
      isLoading = false;
    }
  }

  async function chooseRoom(room) {
    selectedRoom = room;
    activeFormAuth.set('assignPatient');
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

        socket = io($BASE_URL_STORE)
        

        socket.emit("coordinator-assigns-room", {
          data: {
            patientId: patient.id,
            roomId: selectedRoom.id,
            roomName: selectedRoom.name
          }
        });

        activeFormAuth.set('selectRoom');
      }
    } catch (err) {
      toastr.error('Assignment failed');
    } finally {
      isLoading = false;
    }
  }

  function showRooms() {
    activeFormAuth.set('selectRoom');
  }
</script>

<div class="auth-container">
  {#if $user?.role === 'coordinator'}

    <!-- SELECT ROOM -->
    {#if $activeFormAuth === 'selectRoom'}

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
                    <button class="submit-button" 
                    disabled={room.status === 'occupied'}
                    on:click={() => chooseRoom(room)}>
                      {room.status === 'occupied' ? 'Chosen' : 'Choose'}
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
      </div>

    <!-- ASSIGN PATIENT -->
    {:else if $activeFormAuth === 'assignPatient'}

      <div class="form-section">

        <div class="user-section">
          <h4>
            Selected Room: <strong>{selectedRoom?.name}</strong>
          </h4>

          <button class="text-button" on:click={showRooms}>
            <h4>back</h4>
          </button>
        </div>

        <h3>Assign Patient</h3>

        {#if isLoading}
          <p>Loading...</p>
        {:else}
          <table>
            <thead>
              <tr>
                <th>CPR</th>
                <th>Status</th>
                <th>Assign</th>
              </tr>
            </thead>

            <tbody>
              {#each patients as patient}
                <tr>
                  <td>{patient.cpr_encrypted}</td>

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
<script>
  import { onMount } from 'svelte';
  import { fetchGet, fetchPost } from '../util/fetchUtil.js';
  import toastr from 'toastr';
  import { user, activeFormUser } from '../store/userStore.js';

  let email = '';
  let username = '';
  let password = '';
  let role = '';

  let isLoading = false;

  // SESSION CHECK
  onMount(async () => {
    $activeFormUser = 'example'
  });

</script>

<div class="auth-container">


{#if $activeFormUser === 'example' && user && $user?.role === 'exampleRole'}
    <!-- ADMIN SIGNUP -->
    <div class="form-section">
      <h3>Test</h3>


    </div>


  {/if}
  
</div>

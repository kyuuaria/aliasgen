<script lang="ts">
  import Background from '@/components/background.svelte';
  import { MetaTags } from 'svelte-meta-tags';
  import './layout.css';

  let { children } = $props();
</script>

<svelte:head>
  <title>Email Alias Generator</title>
</svelte:head>

<MetaTags
  title="Alias Gen"
  description="A minimal email alias generator for custom domains."
  openGraph={{
    type: 'website',
    title: 'Alias Gen',
    description: 'A minimal email alias generator for custom domains.',
    siteName: 'Alias Gen'
  }}
  twitter={{
    cardType: 'summary',
    title: 'Alias Gen',
    description: 'A minimal email alias generator for custom domains.'
  }}
/>

<Background />

{@render children()}

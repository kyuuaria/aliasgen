<script lang="ts">
  import { page } from '$app/state';
  import { Button } from '@/components/ui/button';
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import { CheckIcon, CopyIcon } from '@lucide/svelte';
  import { Debounced, Previous } from 'runed';
  import { untrack } from 'svelte';
  import { fade } from 'svelte/transition';

  import AliasSettings from '@/components/alias-settings.svelte';
  import { type Config, configSchema, DEFAULTS, serviceSchema } from '@/config';
  import { loadConfig, saveConfig } from '@/persist';
  import { generateAlphaSuffix, generateWordSuffix } from '@/suffix';
  import { slideDown } from '@/transitions';

  // --- Config state ---

  const initialConfig = loadConfig(page.url.hash);
  let config = $state<Config>(initialConfig);

  $effect(() => {
    location.hash = saveConfig(config);
  });

  // --- Domain (debounced) ---

  const domainSchema = configSchema.shape.domain;
  let domainValue = $state(initialConfig.domain);
  let domainError = $state('');
  const debouncedDomain = new Debounced(() => domainValue, 300);

  $effect(() => {
    const val = debouncedDomain.current.toLocaleLowerCase();
    untrack(() => {
      const result = domainSchema.safeParse(val);
      if (result.success) {
        domainError = '';
        config = { ...config, domain: val };
      } else {
        domainError = result.error.issues[0].message;
      }
    });
  });

  // --- Service ---

  let serviceValue = $state('');
  let serviceError = $state('');
  let showCheck = $state(false);

  function validateService(val: string): boolean {
    const result = serviceSchema.safeParse(val);
    serviceError = result.success ? '' : result.error.issues[0].message;
    return result.success;
  }

  // --- Word suffix ---

  const wordTrigger = $derived(`${config.mode}-${config.wordCount}-${serviceValue}`);
  const prevWordTrigger = new Previous(() => wordTrigger);
  let wordSuffix = $state(generateWordSuffix(DEFAULTS.wordCount));

  $effect(() => {
    const trigger = wordTrigger;
    if (trigger === prevWordTrigger.current) return;
    const wc = untrack(() => config.wordCount ?? DEFAULTS.wordCount);
    wordSuffix = generateWordSuffix(wc);
  });

  // --- Generated alias ---

  const servicePrefix = $derived(`${serviceValue.trim().toLowerCase().replaceAll(' ', '_')}.`);

  const suffix = $derived.by(() => {
    void serviceValue;
    return config.mode === 'alpha' ? generateAlphaSuffix(config.length ?? DEFAULTS.length) : wordSuffix;
  });

  const generated = $derived(serviceValue.trim() && !domainError ? `${servicePrefix}${suffix}@${config.domain}` : '');

  // --- Actions ---

  async function handleCopy() {
    if (!validateService(serviceValue) || !generated) return;
    await navigator.clipboard.writeText(generated);
    showCheck = true;
    setTimeout(() => {
      showCheck = false;
      serviceValue = '';
      serviceError = '';
    }, 1500);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleCopy();
  }
</script>

<div class="flex min-h-dvh items-center justify-center" in:fade>
  <Card class="w-full max-w-sm border-white/10 bg-black/30 shadow-2xl backdrop-blur-md">
    <CardHeader>
      <CardTitle class="text-white">Alias Gen</CardTitle>
      <CardDescription class="text-white/50">
        Generate a unique alias for a service, then copy and register it with your provider.
      </CardDescription>
    </CardHeader>

    <CardContent>
      <div class="flex flex-col gap-4">
        <!-- Service -->
        <div class="grid gap-2">
          <Label for="service" class="text-white/70">Service name</Label>
          <Input
            id="service"
            bind:value={serviceValue}
            type="text"
            placeholder="e.g. github"
            onkeydown={handleKeydown}
            oninput={() => serviceValue && validateService(serviceValue)}
            autofocus
            class="bg-white/5 placeholder:opacity-40 {serviceError ? 'border-destructive' : ''}"
          />
          {#if serviceError}
            <p class="text-xs text-destructive" transition:slideDown>{serviceError}</p>
          {/if}
        </div>

        <!-- Result -->
        {#if generated && !serviceError}
          <div class="grid gap-2" transition:slideDown>
            <Label for="result" class="text-white/70">Your alias</Label>
            <Input
              id="result"
              value={generated}
              readonly
              class="border-white/10 bg-white/5 font-mono text-sm text-white/90"
            />
          </div>
        {/if}

        <div class="my-1 border-t border-white/10"></div>

        <!-- Settings -->
        <AliasSettings bind:config bind:domainValue {domainError} />
      </div>
    </CardContent>

    <CardFooter>
      <Button
        class="w-full bg-white/10 hover:bg-white/20"
        variant="secondary"
        onclick={handleCopy}
        disabled={!generated || !!serviceError || showCheck}
      >
        {#if showCheck}
          <CheckIcon />
          Copied
        {:else}
          <CopyIcon />
          Copy address
        {/if}
      </Button>
    </CardFooter>
  </Card>
</div>

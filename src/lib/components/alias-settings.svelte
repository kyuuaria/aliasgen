<script lang="ts">
  import { browser } from '$app/environment';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
  import { Skeleton } from '@/components/ui/skeleton';
  import { Slider } from '@/components/ui/slider';
  import { type Config, DEFAULTS, MODE_OPTIONS } from '@/config';
  import { slideDown } from '@/transitions';

  interface Props {
    config: Config;
    domainValue: string;
    domainError: string;
  }

  let { config = $bindable(), domainValue = $bindable(), domainError }: Props = $props();
</script>

<!-- Domain -->
<div class="grid gap-2">
  <Label for="domain" class="text-white/70">Domain</Label>
  {#if browser}
    <Input
      id="domain"
      bind:value={domainValue}
      type="text"
      placeholder="e.g. yourdomain.com"
      class="bg-white/5 placeholder:opacity-40 {domainError ? 'border-destructive' : ''}"
    />
    {#if domainError}
      <p class="text-xs text-destructive" transition:slideDown>{domainError}</p>
    {/if}
  {:else}
    <Skeleton class="h-9 w-full rounded-md bg-white/5" />
  {/if}
</div>

<!-- Mode -->
<div class="grid gap-2">
  <Label class="text-white/70">Mode</Label>
  {#if browser}
    <Select type="single" value={config.mode} onValueChange={(v) => (config.mode = v as Config['mode'])}>
      <SelectTrigger class="border-white/10 bg-white/5 text-white">
        {MODE_OPTIONS.find((o) => o.value === config.mode)?.label}
      </SelectTrigger>
      <SelectContent>
        {#each MODE_OPTIONS as opt (opt.value)}
          <SelectItem value={opt.value}>{opt.label}</SelectItem>
        {/each}
      </SelectContent>
    </Select>
  {:else}
    <Skeleton class="h-9 w-full rounded-md bg-white/5" />
  {/if}
</div>

<!-- Alpha length -->
{#if config.mode === 'alpha'}
  <div class="grid gap-3" transition:slideDown>
    <div class="flex items-center justify-between">
      <Label class="text-white/70">Length</Label>
      {#if browser}
        <span class="font-mono text-sm text-white/50">{config.length ?? DEFAULTS.length}</span>
      {:else}
        <Skeleton class="size-4 rounded bg-white/5" />
      {/if}
    </div>
    {#if browser}
      <Slider
        type="single"
        bind:value={config.length}
        min={3}
        max={12}
        step={1}
        class="**:data-slider-thumb:border-white/30 **:data-slider-track:bg-white/5"
      />
    {:else}
      <Skeleton class="mt-1 h-1.5 w-full rounded-full bg-white/5" />
    {/if}
    <div class="flex justify-between text-xs text-white/30">
      <span>3</span>
      <span>12</span>
    </div>
  </div>
{/if}

<!-- Word count -->
{#if config.mode === 'word'}
  <div class="grid gap-3" transition:slideDown>
    <div class="flex items-center justify-between">
      <Label class="text-white/70">Word count</Label>
      {#if browser}
        <span class="font-mono text-sm text-white/50">
          {config.wordCount ?? DEFAULTS.wordCount}
        </span>
      {:else}
        <Skeleton class="size-4 rounded bg-white/5" />
      {/if}
    </div>
    {#if browser}
      <Slider
        type="single"
        bind:value={config.wordCount}
        min={1}
        max={3}
        step={1}
        class="**:data-slider-thumb:border-white/30 **:data-slider-track:bg-white/5"
      />
    {:else}
      <Skeleton class="mt-1 h-1.5 w-full rounded-full bg-white/5" />
    {/if}
    <div class="flex justify-between text-xs text-white/30">
      <span>1</span>
      <span>3</span>
    </div>
  </div>
{/if}

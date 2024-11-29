<script lang="ts">
  // import { mergeClasses, toKebabCase } from '@lucide/shared';
	import { getContext } from 'svelte';

  import defaultAttributes from './defaultAttributes'
  import type { IconNode, IconProps } from './types';

  import lucideGlobalStyleContext from './context';
  import type { SvelteHTMLElements } from 'svelte/elements';

  const {
    class: classes,
    children,
    name = undefined,
    color = 'currentColor',
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth = false,
    iconNode = [],
    ...props
  }: SvelteHTMLElements['svg'] & IconProps = $props();

  // export let name: string
  // export let color = getContext(LucideContextIconColor) ?? 'currentColor'
  // export let size: number | string = getContext(LucideContextIconSize) ?? 24
  // export let strokeWidth: number | string = getContext(LucideContextIconStrokeWidth) ?? 2
  // export let absoluteStrokeWidth: boolean = getContext(LucideContextIconAbsoluteStrokeWidth) ?? false
  // export let iconNode: IconNode = []

  const mergeClasses = <ClassType = string | undefined | null>(
    ...classes: ClassType[]
  ) => classes.filter((className, index, array) => {
      return Boolean(className) && array.indexOf(className) === index;
    })
    .join(' ');

</script>

<svg
  {...defaultAttributes}
  {...props}
  width={size}
  height={size}
  stroke={color}
  stroke-width={
    absoluteStrokeWidth
      ? Number(strokeWidth) * 24 / Number(size)
      : strokeWidth
  }
  class={
    mergeClasses(
      'lucide-icon',
      'lucide',
      name ? `lucide-${name}`: '',
      classes
    )
  }
>
  {#each iconNode as [tag, attrs]}
    <svelte:element this={tag} {...attrs}/>
  {/each}
  {@render children?.()}
</svg>

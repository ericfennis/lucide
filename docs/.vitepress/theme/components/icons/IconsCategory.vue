<script lang="ts">
import { IconEntity } from '../../types';

type CategoryNameRow = {
  type: 'category';
  title: string;
  name: string;
  category: string;
};

type CategoryIconsRow = {
  type: 'icons';
  icons: IconEntity[];
  category: string;
};

export type CategoryRow = CategoryNameRow | CategoryIconsRow;
</script>

<script setup lang="ts">
import IconGrid from './IconGrid.vue'

defineProps<{
  activeIconName: string | null
  categoryRow: CategoryRow
}>()

const emit = defineEmits(['setActiveIcon'])

async function deleteIcon(icon: string, categoryRow: CategoryRow) {
  if(icon === null || categoryRow?.category == null) return
  await fetch('/api/categories/edit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      category: categoryRow.category,
      icon: icon,
      action: 'delete',
    }),
  })
}
</script>

<template>
  <h2
    v-if="categoryRow.type === 'category'"
    class="title"
  >
    <a class="header-anchor" :href="`#${categoryRow.name}`" :aria-label="`Permalink to &quot;${categoryRow.title}&quot;`">&ZeroWidthSpace;</a>
    {{ categoryRow.title }}
  </h2>
  <IconGrid
    v-else-if="categoryRow.type === 'icons'"
    :activeIcon="activeIconName"
    :icons="categoryRow.icons"
    @metaClick="(icon: IconEntity) => deleteIcon(icon, categoryRow)"
    @setActiveIcon="$event => $emit('setActiveIcon', $event)"
    overlayMode
  />
</template>

<style scoped>
.title {
  margin-bottom: 8px;
  font-size: 19px;
  font-weight: 500;
  padding: 24px 0 8px;
}
</style>

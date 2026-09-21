<script setup lang="ts">
import { ref, computed, watch, defineAsyncComponent, onMounted } from 'vue';
import type { IconEntity, Category } from '../../types';
import useIconSearch, { entityId } from '../../composables/useIconSearch';
import InputSearch from '../base/InputSearch.vue';
import useSearchInput from '../../composables/useSearchInput';
import useSearchShortcut from '../../utils/useSearchShortcut';
import StickyBar from './StickyBar.vue';
import IconsCategory, { CategoryRow } from './IconsCategory.vue';
import { useElementSize, useEventListener, useVirtualList } from '@vueuse/core';
import chunkArray from '../../utils/chunkArray';
import useScrollToCategory from '../../composables/useScrollToCategory';
import { useCategoryView } from '../../composables/useCategoryView';
import CarbonAdOverlay from './CarbonAdOverlay.vue';
import useSearchPlaceholder from '../../utils/useSearchPlaceholder.ts';
import { prefetchAlgoliaClient } from '../../utils/algolia';

const ICON_SIZE = 56;
const ICON_GRID_GAP = 8;

const props = defineProps<{
  icons: IconEntity[];
  categories: Category[];
  iconCategories: Record<string, string[]>;
}>();

const activeIconName = ref(null);
const { searchInput, searchQuery, searchQueryDebounced } = useSearchInput();
const { selectedCategory } = useCategoryView();
const isSearching = computed(() => !!searchQueryDebounced.value);

watch(searchQueryDebounced, (searchString) => {
  if (searchString !== '') {
    selectedCategory.value = '';
  }
});

const { shortcutText: kbdSearchShortcut } = useSearchShortcut(() => {
  searchInput.value?.focus();
});

function setActiveIconName(name: string) {
  activeIconName.value = name;
}

const overviewEl = ref<HTMLElement | null>(null);
const { width: containerWidth } = useElementSize(overviewEl);

const columnSize = computed(() => {
  return Math.floor(containerWidth.value / (ICON_SIZE + ICON_GRID_GAP));
});

const icons = computed(() => props.icons);

const { results: searchResults, isPending: isSearchPending } = useIconSearch(
  searchQueryDebounced,
  icons,
);

const resultIds = computed(() => new Set(searchResults.value.map(entityId)));

const categories = computed(() => {
  if (!props.categories?.length || !props.icons?.length) return [];

  return props.categories.map(({ name, title }) => {
    const categoryIcons = props.icons.filter((icon) => {
      const iconCategories = icon?.externalLibrary
        ? icon.categories
        : props.iconCategories[icon.name];

      return iconCategories?.includes(name);
    });

    const searchedCategoryIcons = isSearching.value
      ? categoryIcons.filter((icon) => resultIds.value.has(entityId(icon)))
      : categoryIcons;

    return {
      title,
      name,
      icons: searchedCategoryIcons,
    };
  });
});

const categoriesList = computed(() => {
  return categories.value
    .filter(({ icons }) => icons.length)
    .reduce<CategoryRow[]>((acc, category) => {
      acc.push({ type: 'category', title: category.title, name: category.name });

      const categoryIcons = chunkArray(category.icons, columnSize.value);
      categoryIcons.forEach((icons) => {
        acc.push({ type: 'icons', icons });
      });

      return acc;
    }, []);
});
const searchPlaceholder = useSearchPlaceholder(searchQuery, searchResults);
const isSearchSettling = computed(
  () => searchQuery.value !== searchQueryDebounced.value || isSearchPending.value,
);

const { list, containerProps, wrapperProps, scrollTo } = useVirtualList(categoriesList, {
  itemHeight: ICON_SIZE + ICON_GRID_GAP,
  overscan: 10,
});

useScrollToCategory({
  categories,
  categoriesList,
  scrollTo,
  searchQueryDebounced,
});

onMounted(() => {
  containerProps.ref.value = document.documentElement;
  useEventListener(window, 'scroll', containerProps.onScroll);
});

const NoResults = defineAsyncComponent(() => import('./NoResults.vue'));
const IconDetailOverlay = defineAsyncComponent(() => import('./IconDetailOverlay.vue'));

function handleCloseDrawer() {
  setActiveIconName('');

  const url = new URL(window.location.href);
  url.pathname = '/icons/categories';

  if (searchQueryDebounced.value) {
    url.searchParams.set('search', searchQueryDebounced.value);
  }

  if (selectedCategory.value) {
    url.hash = selectedCategory.value;
  }

  window.history.pushState({}, '', url);
}
</script>

<template>
  <div
    ref="overviewEl"
    class="overview-container"
    :class="{ 'icon-drawer-open': activeIconName }"
  >
    <StickyBar class="category-search">
      <InputSearch
        :placeholder="`Search ${icons.length} icons…`"
        v-model="searchQuery"
        :shortcut="kbdSearchShortcut"
        class="input-wrapper"
        ref="searchInput"
        @focus="prefetchAlgoliaClient"
      />
    </StickyBar>
    <NoResults
      v-if="searchPlaceholder.isNoResults && !isSearchSettling"
      :searchQuery="searchPlaceholder.query"
      :isBrandSearch="searchPlaceholder.isBrand"
      @clear="searchQuery = ''"
    />
    <div v-bind="wrapperProps">
      <IconsCategory
        v-for="{ index, data } in list"
        :categoryRow="data"
        :activeIconName="activeIconName"
        @setActiveIcon="setActiveIconName"
        :key="index"
      />
    </div>
  </div>
  <IconDetailOverlay
    v-if="activeIconName != null"
    :iconName="activeIconName"
    @close="handleCloseDrawer"
  />

  <CarbonAdOverlay :drawerOpen="!!activeIconName" />
</template>

<style scoped>
.input-wrapper {
  width: 100%;
}

.search-bar.category-search {
  margin-bottom: 10px;
}

.title {
  margin-bottom: 8px;
  font-size: 19px;
  font-weight: 500;
  padding: 24px 0 8px;
}

.icons {
  margin-bottom: 8px;
}
</style>

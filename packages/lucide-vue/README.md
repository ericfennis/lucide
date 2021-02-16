# Lucide Vue

Use the lucide icon library in you Vue app.

## Installation

```sh
yarn add lucide-vue

# or

npm install lucide-vue
```

## How to use

It's build with ESmodules so it's completely threeshakable.
Each icon can be imported as a vue component.

### Example

You can pass additional props to adjust the icon.

``` vue
<template>
  <Camera
    color="red"
    :size="32"
  />
</template>

<script>
// Returns Vue component
import { Camera } from 'lucide-vue';

export default {
  name: "My Component",
  components: { Camera }
}

</script>
```

### Props

|  name        |   type   |  default
| ------------ | -------- | --------
| `size`       | *Number* | 24
| `color`      | *String* | currentColor
| `strokeWidth`| *Number* | 2
| `defaultClass`| *String* | lucide-icon

### Custom props

You can also pass custom props that will be added in the svg as attributes.

``` vue
<template>
  <Camera fill="red" />
</template>
```

### One generic icon component

It is possible to create one generic icon component to load icons.

> :warning: Example below importing all EsModules, caution  using this example, not recommended when you using bundlers, your application build size will grow strongly.

#### Icon Component Example
...
``` vue
// <script>
// // Returns all Lucide icon Vue components
// import * as icons from 'lucide-vue';

// export default {
//   name: "Icon",
//   components: { Camera }
// }

// </script>
```
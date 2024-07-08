# 1. Use 'Electron Forge'

URL: https://www.electronforge.io/

```
npm init electron-app@latest giffer -- --template=vite-typescript
cd giffer
```

# 2. Bring in Vue

See help under:
https://www.electronforge.io/guides/framework-integration/vue-3

This means:

```
npm install vue
npm install --save-dev @vitejs/plugin-vue
```

# 3. Change Code for Vue + TS

**!IMPORTANT:** Example from 2. is only for Vue+JS not TS!

So we have to do different changes:

**src/index.html**  
(diff: renderer.ts instead of renderer.js)

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Hello World!</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/renderer.ts"></script>
  </body>
</html>
```

**src/app.vue**  
(the same)

```html
<template>
  <h1>💖 Hello World!</h1>
  <p>Welcome to your Electron application.</p>
</template>

<script setup>
  console.log(
    '👋 This message is being logged by "App.vue", included via Vite'
  );
</script>
```

**src/renderer.ts**  
(diff: keep index.css import)

```ts
import "./index.css";
import { createApp } from "vue";
import App from "./app.vue";

createApp(App).mount("#app");
```

**vite.rederer.config.ts**  
(diff: this file name instead of vite.renderer.config.mjs, and simply add `vue()` to the plugins list. Don't forget to `import vue`)

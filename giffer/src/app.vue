<template>
  <div class="app-main">
    <div class="drop-zone" v-on:drop="onDrop">Drop here</div>
    <div class="display-area">Display</div>
  </div>
</template>

<script setup lang="ts">
console.log('👋 This message is being logged by "App.vue", included via Vite');

function onDrop(ev: DragEvent) {
  ev.stopPropagation();
  ev.preventDefault();
  const file = ev.dataTransfer.files[0];

  validate(file);
}

function validate(file: File) {
  const ending = file.name.split(".")[-1];
  if (ending !== "gif") {
    throw Error("Wrong file type. Must be '*.gif'.");
  }
}
</script>

<style>
.app-main {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.drop-zone {
  height: 30%;
  width: 90%;
  border: 5px solid lightgray;
  border-radius: 10px;
}
</style>

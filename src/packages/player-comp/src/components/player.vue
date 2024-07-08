<template>
  <div class="app-main">
    <div class="drop-zone" v-on:dragover="onDragOver" v-on:drop="onDrop">
      Drop here
    </div>
    <div ref="ref_display" class="display-area">Display</div>
    <div class="controls">
      <div class="button-controls">
        <button v-on:click="onButtonJumpStart">&lt;&lt;</button>
        <button v-on:click="onButtonStepBack">&lt;</button>
        <button v-on:click="onButtonPlay">Play</button>
        <button v-on:click="onButtonPause">Pause</button>
        <button v-on:click="onButtonStop">Stop</button>
        <button v-on:click="onButtonStepForward">&gt;</button>
        <button v-on:click="onButtonJumpEnd">&gt;&gt;</button>
      </div>
      <div class="speed-control">
        <span
          v-for="speed in [0.1, 0.2, 0.5, 0.7, 1, 1.2, 1.5, 2]"
          v-on:click="onSpeedClicked(speed)"
          v-bind:class="{ selected: speed === selectedSpeed }"
          >{{ speed }}</span
        >
      </div>
      <input
        type="range"
        min="0"
        v-bind:max="maxFrame"
        v-model="selectedFrame"
        v-on:input="debouncedOnSliderMoved"
        style="width: 250px"
      />
      <div class="advanced-controls">
        <label
          >Loop
          <input type="checkbox" v-model="playControls.shouldLoop" />
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { SuperGif, SuperGifStream } from "@giffer/lib";
import throttle from "lodash/throttle";

const ref_display = ref<HTMLDivElement>(null);
const maxFrame = ref<number>(0);
const selectedFrame = ref<number>(0);
let gifHandle: SuperGif = null;
let selectedSpeed = ref(1);

const playControls = reactive({
  delay: 100,
  shouldPlay: false,
  shouldLoop: false,
  timeLastFramePlayed: 0,
  maxFrameNo: 0,
});

function onSpeedClicked(speed: number) {
  selectedSpeed.value = speed;
  playControls.delay = gifHandle["delay"] * 10 * (1 / speed);
}

function onButtonPlay() {
  playControls.shouldPlay = true;
}

function onButtonPause() {
  playControls.shouldPlay = false;
}

function onButtonStop() {
  playControls.shouldPlay = false;
  // await last animation
  onButtonJumpStart();
}

async function onDrop(ev: DragEvent) {
  ev.stopPropagation();
  ev.preventDefault();
  const file = ev.dataTransfer.files[0];

  validate(file);

  const fReader = new FileReader();
  await new Promise((res) => {
    fReader.onloadend = res;
    fReader.readAsArrayBuffer(file);
  });
  const arrayBufferImage = fReader.result as string;

  const imgElem = document.createElement("img") as HTMLImageElement;

  imgElem.height = 200;
  imgElem.width = 300;

  ref_display.value.appendChild(imgElem);
  await new Promise((res) => setTimeout(res, 100));
  gifHandle = new SuperGif(imgElem, {
    autoPlay: false,
    loopMode: false,
    onEnd: () => {},
  });
  gifHandle.loadURL = function loadURL(_: string, callback: () => void): void {
    if (!this.loadSetup(callback)) {
      return;
    }
    if (!this.initialized) {
      this.init();
    }

    const data = new Uint8Array(arrayBufferImage as any);
    const stream = new SuperGifStream(data);
    setTimeout(() => {
      this.parseStream(stream);
    }, 0);
  }.bind(gifHandle);

  await new Promise((res) => {
    gifHandle.load(res);
  });

  playControls.delay = gifHandle["delay"] * 10;
  maxFrame.value = gifHandle.getLength();
}

function onButtonJumpEnd() {
  const end = gifHandle.getLength() - 1;
  gifHandle.moveTo(end);
  selectedFrame.value = end;
}

function onButtonJumpStart() {
  gifHandle.moveTo(0);
  selectedFrame.value = 0;
}

function onButtonStepBack() {
  const next = Math.max(0, gifHandle.getCurrentFrame() - 1);
  gifHandle.moveTo(next);
  selectedFrame.value = next;
}

function onButtonStepForward() {
  const max = gifHandle.getLength() - 1;
  const next = Math.min(max, gifHandle.getCurrentFrame() + 1);
  gifHandle.moveTo(next);
  selectedFrame.value = next;
}

const debouncedOnSliderMoved = throttle(onSliderMoved, 10);
function onSliderMoved(_ev: Event) {
  gifHandle.moveTo(selectedFrame.value);
}

function onDragOver(ev: DragEvent) {
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

function validate(file: File) {
  const parts = file.name.split(".");
  const ending = parts.slice(-1)[0];
  if (ending.toLowerCase() !== "gif") {
    throw Error("Wrong file type. Must be '*.gif'.");
  }
}

watch(
  () => playControls.shouldPlay,
  () => {
    if (playControls.shouldPlay) {
      playControls.timeLastFramePlayed = performance.now();
      playControls.maxFrameNo = gifHandle.getLength() - 1;
      requestAnimationFrame(playRecursion);
    }
  }
);

function playRecursion() {
  if (!playControls.shouldPlay) {
    return;
  }

  const delay = playControls.delay;
  const nextFrameStepTime = playControls.timeLastFramePlayed + delay;
  const currentTime = performance.now();
  if (currentTime >= nextFrameStepTime) {
    onButtonStepForward();

    // check if finished:
    if (gifHandle.getCurrentFrame() < playControls.maxFrameNo) {
      playControls.timeLastFramePlayed = currentTime;
      requestAnimationFrame(playRecursion);
    } else if (playControls.shouldLoop) {
      onButtonJumpStart();
      playControls.timeLastFramePlayed = currentTime;
      requestAnimationFrame(playRecursion);
    } else {
      playControls.shouldPlay = false;
      onButtonJumpStart();
    }
  } else {
    requestAnimationFrame(playRecursion);
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

.speed-control > span {
  background-color: rgb(234, 234, 234);
  padding-left: 2px;
  padding-right: 2px;
  margin-left: 3px;
  margin-right: 3px;
  color: gray;
  cursor: pointer;
}

.speed-control > span.selected {
  color: black;
  cursor: default;
  background-color: aliceblue;
}
</style>

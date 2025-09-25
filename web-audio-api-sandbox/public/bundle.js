"use strict";
(() => {
  // src/oscillator/oscillator.audio.ts
  var OscillatorAudio = class {
    constructor({
      audioContext,
      frequency,
      gain,
      type
    }) {
      this.audioContext = audioContext;
      this.frequency = frequency;
      this.gain = gain;
      this.type = type;
      this.oscillatorNode = new OscillatorNode(this.audioContext, {
        frequency: this.frequency,
        type: this.type
      });
      this.oscillatorGainNode = new GainNode(this.audioContext, {
        gain: this.gain
      });
      this.modulationGainNode = new GainNode(this.audioContext, {
        gain: this.gain * 1e3
      });
      this.oscillatorNode.connect(this.oscillatorGainNode);
      this.oscillatorNode.connect(this.modulationGainNode);
    }
    start() {
      this.oscillatorNode.start();
    }
    stop() {
      this.oscillatorNode.stop();
    }
    setFrequency(frequency) {
      this.frequency = frequency;
      this.oscillatorNode.frequency.setValueAtTime(
        frequency,
        this.audioContext.currentTime
      );
    }
    setAudioGain(gain) {
      this.gain = gain;
      this.oscillatorGainNode.gain.setValueAtTime(
        gain,
        this.audioContext.currentTime
      );
    }
    setModulationGain(gain) {
      this.gain = gain;
      this.modulationGainNode.gain.setValueAtTime(
        this.gain * 1e3,
        this.audioContext.currentTime
      );
    }
    setType(type) {
      this.type = type;
      this.oscillatorNode.type = type;
    }
    getNodes() {
      return {
        oscillatorNode: this.oscillatorNode,
        audioOutputNode: this.oscillatorGainNode,
        modulationOutputNode: this.modulationGainNode
      };
    }
  };

  // src/oscillator/oscillator.ui.ts
  function oscillatorUI(params) {
    return `<fieldset class="rounded-lg border border-primary/30 dark:border-primary/50 p-6">
            <legend class="px-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Oscillator</legend>
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300" for="${params.name}-frequency"
                  >Frequency (kHz)</label
                >
                <div class="mt-2 flex items-center gap-4">
                  <input
                    class="h-2 w-full cursor-pointer appearance-none rounded-full bg-primary/20 dark:bg-primary/50 slider-thumb"
                    id="${params.name}-frequency"
                    max="4000"
                    min="1"
                    type="range"
                    value="500"
                  />
                  <span id="${params.name}-frequency-label" class="w-10 text-right text-sm font-medium text-neutral-900 dark:text-white">500</span>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300" for="${params.name}-gain"
                  >Gain</label
                >
                <div class="mt-2 flex items-center gap-4">
                  <input
                    class="h-2 w-full cursor-pointer appearance-none rounded-full bg-primary/20 dark:bg-primary/50 slider-thumb"
                    id="${params.name}-gain"
                    max="1"
                    min="0"
                    type="range"
                    value="0.2"
                    step="0.01"
                  />
                  <span id="${params.name}-gain-label" class="w-10 text-right text-sm font-medium text-neutral-900 dark:text-white">500</span>
                </div>
              </div>
              <div>
                <span class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Type</span>
                <div id="${params.name}-type" class="mt-2 grid grid-cols-3 gap-2">
                  <label
                    class="flex cursor-pointer items-center justify-center rounded border border-primary/30 bg-background-light px-4 py-2 text-center text-sm font-medium text-neutral-700 has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-white dark:border-primary/50 dark:bg-primary/30 dark:text-neutral-200 dark:has-[:checked]:border-primary dark:has-[:checked]:bg-primary dark:has-[:checked]:text-white"
                  >
                    <input checked="" class="sr-only" name="${params.name}-type" type="radio" value="sine" />
                    <span>Sine</span>
                  </label>
                  <label
                    class="flex cursor-pointer items-center justify-center rounded border border-primary/30 bg-background-light px-4 py-2 text-center text-sm font-medium text-neutral-700 has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-white dark:border-primary/50 dark:bg-primary/30 dark:text-neutral-200 dark:has-[:checked]:border-primary dark:has-[:checked]:bg-primary dark:has-[:checked]:text-white"
                  >
                    <input class="sr-only" name="${params.name}-type" type="radio" value="sawtooth" />
                    <span>Saw</span>
                  </label>
                  <label
                    class="flex cursor-pointer items-center justify-center rounded border border-primary/30 bg-background-light px-4 py-2 text-center text-sm font-medium text-neutral-700 has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-white dark:border-primary/50 dark:bg-primary/30 dark:text-neutral-200 dark:has-[:checked]:border-primary dark:has-[:checked]:bg-primary dark:has-[:checked]:text-white"
                  >
                    <input class="sr-only" name="${params.name}-type" type="radio" value="square" />
                    <span>Square</span>
                  </label>
                </div>
              </div>
            </div>
          </fieldset>`;
  }
  function createOscillatorUI(params) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = oscillatorUI(params);
    return wrapper;
  }

  // src/oscillator/oscillator.main.ts
  function createOscillator(name, audioContext, contentContext) {
    contentContext.appendChild(createOscillatorUI({ name }));
    const frequencyInput = document.getElementById(
      `${name}-frequency`
    );
    if (!frequencyInput) {
      throw new Error("Frequency input not found");
    }
    const frequencyInputLabel = document.getElementById(
      `${name}-frequency-label`
    );
    if (!frequencyInputLabel) {
      throw new Error("Frequency input label not found");
    }
    frequencyInputLabel.textContent = frequencyInput.value;
    const gainInput = document.getElementById(`${name}-gain`);
    if (!gainInput) {
      throw new Error("Gain input not found");
    }
    const gainInputLabel = document.getElementById(
      `${name}-gain-label`
    );
    if (!gainInputLabel) {
      throw new Error("Gain input label not found");
    }
    gainInputLabel.textContent = gainInput.value;
    const typeInput = document.getElementById(`${name}-type`);
    if (!typeInput) {
      throw new Error("Type input not found");
    }
    const oscillatorAudio = new OscillatorAudio({
      audioContext,
      frequency: frequencyInput.valueAsNumber,
      gain: gainInput.valueAsNumber,
      type: "sine"
    });
    oscillatorAudio.start();
    frequencyInput.addEventListener("input", () => {
      oscillatorAudio.setFrequency(Number(frequencyInput.value));
      frequencyInputLabel.textContent = frequencyInput.value;
    });
    gainInput.addEventListener("input", () => {
      oscillatorAudio.setAudioGain(Number(gainInput.value));
      oscillatorAudio.setModulationGain(Number(gainInput.value));
      gainInputLabel.textContent = gainInput.value;
    });
    typeInput.addEventListener("change", (event) => {
      oscillatorAudio.setType(
        event.target.value
      );
    });
    return oscillatorAudio;
  }

  // src/index.ts
  async function main() {
    const audioContext = new AudioContext();
    const contentContext = document.getElementById("content");
    if (!contentContext) {
      throw new Error("Content element not found");
    }
    const osc1 = createOscillator("osc1", audioContext, contentContext);
    const osc2 = createOscillator("osc2", audioContext, contentContext);
    osc1.getNodes().modulationOutputNode.connect(osc2.getNodes().oscillatorNode.frequency);
    osc2.getNodes().audioOutputNode.connect(audioContext.destination);
    const buttonWrapper = document.createElement("div");
    buttonWrapper.innerHTML = `<button id="start-audio" class="rounded bg-primary px-4 py-2 font-medium text-white hover:bg-primary/80">Start Audio Context</button>`;
    contentContext.appendChild(buttonWrapper);
    buttonWrapper.addEventListener("click", async () => {
      console.log("Button clicked");
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      } else if (audioContext.state === "running") {
        await audioContext.suspend();
      }
    });
  }
  window.addEventListener("load", () => {
    console.log("Window loaded");
    main().catch((error) => {
      console.error("Error in main:", error);
    });
  });
})();

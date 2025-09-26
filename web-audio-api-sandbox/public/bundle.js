"use strict";
(() => {
  // src/utils/epsilon.ts
  var epsilon = 1e-5;

  // src/d-envelope/d-envelope.audio.ts
  var DEnvelopeAudio = class {
    constructor({ decay }, audioContext) {
      this.decay = 0.8;
      this.audioContext = audioContext;
      this.decay = decay;
      this.gainNode = new GainNode(this.audioContext, { gain: epsilon });
    }
    trigger() {
      const now = this.audioContext.currentTime;
      this.gainNode.gain.cancelScheduledValues(this.decay);
      this.gainNode.gain.setValueAtTime(1, now);
      this.gainNode.gain.exponentialRampToValueAtTime(epsilon, now + this.decay);
    }
    setDecay(value) {
      this.decay = value;
    }
    get node() {
      return this.gainNode;
    }
  };

  // src/d-envelope/d-envelope.ui.ts
  function dEnvelopeUI(params) {
    return `<fieldset class="rounded-lg border border-primary/30 dark:border-primary/50 p-6">
            <legend class="px-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">D-Envelope</legend>
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300" for="${params.name}-d-envelope-decay"
                  >Decay</label
                >
                <div class="mt-2 flex items-center gap-4">
                  <input
                    class="h-2 w-full cursor-pointer appearance-none rounded-full bg-primary/20 dark:bg-primary/50 slider-thumb"
                    id="${params.name}-d-envelope-decay"
                    max="5"
                    min="0"
                    type="range"
                    value="1"
                    step="0.1"
                  />
                  <span id="${params.name}-d-envelope-decay-label" class="w-10 text-right text-sm font-medium text-neutral-900 dark:text-white">500</span>
                </div>
                <div>
              </div>
            </div>
            <button id="${params.name}-d-envelope-trigger" class="w-full rounded-lg bg-primary py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90">
              Trigger
            </button>
          </fieldset>`;
  }
  function createDEnvelopeUI(params) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = dEnvelopeUI(params);
    return wrapper;
  }

  // src/d-envelope/d-envelope.module.ts
  var DEnvelopeModule = class {
    constructor({ name }, audioContext) {
      this.name = name;
      this.audioContext = audioContext;
      this.ui = createDEnvelopeUI({ name: this.name });
      this.audio = new DEnvelopeAudio({ decay: 0.8 }, this.audioContext);
      this.setupEventListeners();
    }
    setupEventListeners() {
      const decayInput = this.ui.querySelector(
        `#${this.name}-d-envelope-decay`
      );
      if (!decayInput) {
        throw new Error("decayInput input not found");
      }
      const decayInputLabel = this.ui.querySelector(
        `#${this.name}-d-envelope-decay-label`
      );
      if (!decayInputLabel) {
        throw new Error("decayInput label not found");
      }
      decayInputLabel.textContent = decayInput.value;
      const triggerButton = this.ui.querySelector(
        `#${this.name}-d-envelope-trigger`
      );
      if (!triggerButton) {
        throw new Error("Trigger button not found");
      }
      this.audio.setDecay(Number(decayInput.value));
      decayInput.addEventListener("input", () => {
        this.audio.setDecay(Number(decayInput.value));
        decayInputLabel.textContent = decayInput.value;
      });
      triggerButton.addEventListener("click", () => {
        console.log("Envelope triggered");
        this.audio.trigger();
      });
    }
  };

  // src/mixer/mixer.audio.ts
  var MixerAudio = class {
    constructor({
      channel1Level = 1,
      channel2Level = 1,
      channel3Level = 1
    }, audioContext) {
      this.channel1Level = 1;
      this.channel2Level = 1;
      this.channel3Level = 1;
      this.audioContext = audioContext;
      this.channel1Node = new GainNode(this.audioContext, {
        gain: channel1Level
      });
      this.channel2Node = new GainNode(this.audioContext, {
        gain: channel2Level
      });
      this.channel3Node = new GainNode(this.audioContext, {
        gain: channel3Level
      });
      this.sumNode = new GainNode(this.audioContext, {
        gain: 0.333333
      });
      this.channel1Node.connect(this.sumNode);
      this.channel2Node.connect(this.sumNode);
      this.channel3Node.connect(this.sumNode);
    }
    setChannel1Level(level) {
      this.channel1Node.gain.setValueAtTime(level, this.audioContext.currentTime);
      this.channel1Level = level;
    }
    setChannel2Level(level) {
      this.channel2Node.gain.setValueAtTime(level, this.audioContext.currentTime);
      this.channel2Level = level;
    }
    setChannel3Level(level) {
      this.channel3Node.gain.setValueAtTime(level, this.audioContext.currentTime);
      this.channel3Level = level;
    }
    get nodes() {
      return {
        channel1: this.channel1Node,
        channel2: this.channel2Node,
        channel3: this.channel3Node,
        sum: this.sumNode
      };
    }
  };

  // src/mixer/mixer.ui.ts
  function mixerUI(params) {
    return `<fieldset class="rounded-lg border border-primary/30 dark:border-primary/50 p-6">
            <legend class="px-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Mixer</legend>
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300" for="${params.name}-channel-1-level"
                  >Channel 1 Level</label
                >
                <div class="mt-2 flex items-center gap-4">
                  <input
                    class="h-2 w-full cursor-pointer appearance-none rounded-full bg-primary/20 dark:bg-primary/50 slider-thumb"
                    id="${params.name}-channel-1-level"
                    max="1"
                    min="0"
                    type="range"
                    value="1"
                    step="0.01"
                  />
                  <span id="${params.name}-channel-1-level-label" class="w-10 text-right text-sm font-medium text-neutral-900 dark:text-white">500</span>
                </div>
                <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300" for="${params.name}-channel-2-level"
                  >Channel 2 Level</label
                >
                <div class="mt-2 flex items-center gap-4">
                  <input
                    class="h-2 w-full cursor-pointer appearance-none rounded-full bg-primary/20 dark:bg-primary/50 slider-thumb"
                    id="${params.name}-channel-2-level"
                    max="1"
                    min="0"
                    type="range"
                    value="1"
                    step="0.01"
                  />
                  <span id="${params.name}-channel-2-level-label" class="w-10 text-right text-sm font-medium text-neutral-900 dark:text-white">500</span>
                </div>
                <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300" for="${params.name}-channel-3-level"
                  >Channel 3 Level</label
                >
                <div class="mt-2 flex items-center gap-4">
                  <input
                    class="h-2 w-full cursor-pointer appearance-none rounded-full bg-primary/20 dark:bg-primary/50 slider-thumb"
                    id="${params.name}-channel-3-level"
                    max="1"
                    min="0"
                    type="range"
                    value="1"
                    step="0.01"
                  />
                  <span id="${params.name}-channel-3-level-label" class="w-10 text-right text-sm font-medium text-neutral-900 dark:text-white">500</span>
                </div>
              </div>
            </div>
          </fieldset>`;
  }
  function createMixerUI(params) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = mixerUI(params);
    return wrapper;
  }

  // src/mixer/mixer.module.ts
  var MixerModule = class {
    constructor({ name }, audioContext) {
      this.name = name;
      this.ui = createMixerUI({ name: this.name });
      this.audio = new MixerAudio(
        {
          channel1Level: 1,
          channel2Level: 1,
          channel3Level: 1
        },
        audioContext
      );
      this.setupEventListeners();
    }
    setupEventListeners() {
      const channel1LevelInput = this.ui.querySelector(
        `#${this.name}-channel-1-level`
      );
      if (!channel1LevelInput) {
        throw new Error("channel1LevelInput input not found");
      }
      const channel1LevelInputLabel = this.ui.querySelector(
        `#${this.name}-channel-1-level-label`
      );
      if (!channel1LevelInputLabel) {
        throw new Error("Frequency input label not found");
      }
      channel1LevelInputLabel.textContent = channel1LevelInput.value;
      const channel2LevelInput = this.ui.querySelector(
        `#${this.name}-channel-2-level`
      );
      if (!channel2LevelInput) {
        throw new Error("channel2LevelInput input not found");
      }
      const channel2LevelInputLabel = this.ui.querySelector(
        `#${this.name}-channel-2-level-label`
      );
      if (!channel2LevelInputLabel) {
        throw new Error("Frequency input label not found");
      }
      channel2LevelInputLabel.textContent = channel2LevelInput.value;
      const channel3LevelInput = this.ui.querySelector(
        `#${this.name}-channel-3-level`
      );
      if (!channel3LevelInput) {
        throw new Error("channel3LevelInput input not found");
      }
      const channel3LevelInputLabel = this.ui.querySelector(
        `#${this.name}-channel-3-level-label`
      );
      if (!channel3LevelInputLabel) {
        throw new Error("Frequency input label not found");
      }
      channel3LevelInputLabel.textContent = channel3LevelInput.value;
      this.audio.setChannel1Level(Number(channel1LevelInput.value));
      this.audio.setChannel2Level(Number(channel2LevelInput.value));
      this.audio.setChannel3Level(Number(channel3LevelInput.value));
      channel1LevelInput.addEventListener("input", () => {
        this.audio.setChannel1Level(Number(channel1LevelInput.value));
        channel1LevelInputLabel.textContent = channel1LevelInput.value;
      });
      channel2LevelInput.addEventListener("input", () => {
        this.audio.setChannel2Level(Number(channel2LevelInput.value));
        channel2LevelInputLabel.textContent = channel2LevelInput.value;
      });
      channel3LevelInput.addEventListener("input", () => {
        this.audio.setChannel3Level(Number(channel3LevelInput.value));
        channel3LevelInputLabel.textContent = channel3LevelInput.value;
      });
    }
  };

  // src/oscillator/oscillator.audio.ts
  var OscillatorAudio = class {
    constructor({
      audioContext,
      frequency,
      type
    }) {
      this.audioContext = audioContext;
      this.oscillatorNode = new OscillatorNode(this.audioContext, {
        frequency,
        type
      });
    }
    start() {
      this.oscillatorNode.start();
    }
    stop() {
      this.oscillatorNode.stop();
    }
    setFrequency(frequency) {
      this.oscillatorNode.frequency.setValueAtTime(
        frequency,
        this.audioContext.currentTime
      );
    }
    setType(type) {
      this.oscillatorNode.type = type;
    }
    get node() {
      return this.oscillatorNode;
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

  // src/oscillator/oscillator.module.ts
  var OscillatorModule = class {
    constructor({ name, autostart = false }, audioContext) {
      this.name = name;
      this.audioContext = audioContext;
      this.ui = createOscillatorUI({ name: this.name });
      this.audio = new OscillatorAudio({
        audioContext: this.audioContext,
        frequency: 500,
        type: "sine"
      });
      if (autostart) {
        this.audio.start();
      }
      this.setupEventListeners();
    }
    setupEventListeners() {
      const frequencyInput = this.ui.querySelector(
        `#${this.name}-frequency`
      );
      if (!frequencyInput) {
        throw new Error("Frequency input not found");
      }
      const frequencyInputLabel = this.ui.querySelector(
        `#${this.name}-frequency-label`
      );
      if (!frequencyInputLabel) {
        console.log(`${this.name}-frequency-label`);
        throw new Error("Frequency input label not found");
      }
      frequencyInputLabel.textContent = frequencyInput.value;
      const typeInput = this.ui.querySelector(
        `#${this.name}-type`
      );
      if (!typeInput) {
        throw new Error("Type input not found");
      }
      frequencyInput.addEventListener("input", () => {
        this.audio.setFrequency(Number(frequencyInput.value));
        frequencyInputLabel.textContent = frequencyInput.value;
      });
      typeInput.addEventListener("change", (event) => {
        this.audio.setType(
          event.target.value
        );
      });
    }
  };

  // src/index.ts
  async function main() {
    const audioContext = new AudioContext();
    const contentContext = document.getElementById("content");
    if (!contentContext) {
      throw new Error("Content element not found");
    }
    const toggleAudioButton = document.createElement("div");
    toggleAudioButton.innerHTML = `<button class="w-full rounded-lg bg-primary py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90">Toggle Audio</button>`;
    contentContext.appendChild(toggleAudioButton);
    const triggerEnvelopesGlobal = document.createElement("div");
    triggerEnvelopesGlobal.innerHTML = `<button class="w-full rounded-lg bg-primary py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90">Trigger Envelopes (Global)</button>`;
    contentContext.appendChild(triggerEnvelopesGlobal);
    const osc1 = new OscillatorModule(
      { name: "osc1", autostart: true },
      audioContext
    );
    contentContext.appendChild(osc1.ui);
    const dEnvelope1 = new DEnvelopeModule({ name: "denv1" }, audioContext);
    contentContext.appendChild(dEnvelope1.ui);
    const osc2 = new OscillatorModule(
      { name: "osc2", autostart: true },
      audioContext
    );
    contentContext.appendChild(osc2.ui);
    const dEnvelope2 = new DEnvelopeModule({ name: "denv2" }, audioContext);
    contentContext.appendChild(dEnvelope2.ui);
    const osc3 = new OscillatorModule(
      { name: "osc3", autostart: true },
      audioContext
    );
    contentContext.appendChild(osc3.ui);
    const dEnvelope3 = new DEnvelopeModule({ name: "denv3" }, audioContext);
    contentContext.appendChild(dEnvelope3.ui);
    const mixer1 = new MixerModule({ name: "mixer1" }, audioContext);
    contentContext.appendChild(mixer1.ui);
    mixer1.audio.nodes.sum.connect(audioContext.destination);
    osc1.audio.node.connect(dEnvelope1.audio.node).connect(new GainNode(audioContext, { gain: 1e3 })).connect(osc2.audio.node.frequency);
    osc2.audio.node.connect(dEnvelope2.audio.node).connect(new GainNode(audioContext, { gain: 1e3 })).connect(osc3.audio.node.frequency);
    osc1.audio.node.connect(dEnvelope1.audio.node).connect(mixer1.audio.nodes.channel1);
    osc2.audio.node.connect(dEnvelope2.audio.node).connect(mixer1.audio.nodes.channel2);
    osc3.audio.node.connect(dEnvelope3.audio.node).connect(mixer1.audio.nodes.channel3);
    toggleAudioButton.addEventListener("click", async () => {
      console.log("Button clicked");
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      } else if (audioContext.state === "running") {
        await audioContext.suspend();
      }
    });
    triggerEnvelopesGlobal.addEventListener("click", () => {
      dEnvelope1.audio.trigger();
      dEnvelope2.audio.trigger();
      dEnvelope3.audio.trigger();
    });
  }
  window.addEventListener("load", () => {
    console.log("Window loaded");
    main().catch((error) => {
      console.error("Error in main:", error);
    });
  });
})();

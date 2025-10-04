"use strict";
(() => {
  // src/sound/constant/constant.audio.ts
  var ConstantAudio = class {
    constructor(audioContext) {
      this.audioContext = audioContext;
      this.constantNode = new ConstantSourceNode(this.audioContext);
      this.constantNode.start();
    }
    get node() {
      return this.constantNode;
    }
  };

  // src/sound/constant/constant.module.ts
  var ConstantModule = class {
    constructor(audioContext) {
      this.audioContext = audioContext;
      this.audio = new ConstantAudio(this.audioContext);
    }
  };

  // src/ui/UILookup.ts
  var UILookup = class {
    static findSliderElement(ui, { id, parameterName }) {
      const element = ui.querySelector(
        `#${id}-${parameterName}`
      );
      if (!element) {
        throw new Error(`"${id}-${parameterName}" slider not found`);
      }
      const label = ui.querySelector(
        `#${id}-${parameterName}-label`
      );
      if (!label) {
        console.log(`${id}-${parameterName}-label`);
        throw new Error('"${id}-${parameterName}" slider label not found');
      }
      label.textContent = element.value;
      return { element, label };
    }
    static findRadioElement(ui, { id, parameterName }) {
      const element = ui.querySelector(
        `#${id}-${parameterName}`
      );
      if (!element) {
        throw new Error("Type input not found");
      }
      return { element };
    }
    static findButtonElement(ui, { id, parameterName }) {
      const element = ui.querySelector(
        `#${id}-${parameterName}`
      );
      if (!element) {
        throw new Error("Trigger button not found");
      }
      return { element };
    }
  };

  // src/ui/UIEventHandler.ts
  var UIEventHandler = class {
    static attach(elements, ui, callbackArray) {
      for (const [index, element] of elements.entries()) {
        switch (element.type) {
          case "slider":
            const { element: foundSlider, label } = UILookup.findSliderElement(
              ui,
              {
                id: element.id,
                parameterName: element.parameterName
              }
            );
            callbackArray[index](foundSlider.value);
            foundSlider.addEventListener("input", ({ target }) => {
              const { value } = target;
              callbackArray[index](value);
              label.textContent = foundSlider.value;
            });
            break;
          case "radio":
            const { element: foundRadio } = UILookup.findRadioElement(ui, {
              id: element.id,
              parameterName: element.parameterName
            });
            callbackArray[index](foundRadio.value);
            foundRadio.addEventListener("change", ({ target }) => {
              const { value } = target;
              callbackArray[index](value);
            });
            break;
          case "button":
            const { element: foundButton } = UILookup.findButtonElement(ui, {
              id: element.id,
              parameterName: element.parameterName
            });
            callbackArray[index](foundButton.value);
            foundButton.addEventListener("click", () => {
              callbackArray[index]();
            });
            break;
          default:
            break;
        }
      }
    }
  };

  // src/utils/constant.ts
  var epsilon = 1e-5;

  // src/sound/d-envelope/d-envelope.audio.ts
  var DEnvelopeAudio = class {
    constructor(audioContext, { decay }) {
      this.audioContext = audioContext;
      this.decay = decay;
      this.gainNode = new GainNode(this.audioContext, { gain: epsilon });
    }
    trigger(externalCurrentTime) {
      const now = externalCurrentTime || this.audioContext.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
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

  // src/ui/components/button.ts
  function button({
    id,
    parameterName,
    displayValue
  }) {
    return `
<button id="${id}-${parameterName}" class="w-full rounded-lg bg-primary py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90">
  ${displayValue}
</button> 
  `;
  }

  // src/ui/components/fieldset.ts
  function fieldset({ label }) {
    return `
<fieldset class="rounded-lg border border-primary/30 dark:border-gray-700 p-6">
  <legend class="px-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">${label}</legend>
  <div class="space-y-6">
  </div>
</fieldset>`;
  }

  // src/ui/components/radiobutton.ts
  function radiobutton({
    id,
    label,
    parameterName,
    parameters
  }) {
    return `
<span class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">${label}</span>
<div id="${id}-${parameterName}" class="mt-2 grid grid-cols-${parameters.length} gap-2">
  ${parameters.map((parameter) => {
      return singleRadioButton({ id, parameterName, parameters: parameter });
    }).join("\n")}
`;
  }
  function singleRadioButton({
    id,
    parameterName,
    parameters
  }) {
    return `  
<label
  class="flex cursor-pointer items-center justify-center rounded border border-primary/30 bg-background-light px-4 py-2 text-center text-sm font-medium text-neutral-700 has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-white dark:border-primary/50 dark:bg-primary/30 dark:text-neutral-200 dark:has-[:checked]:border-primary dark:has-[:checked]:bg-primary dark:has-[:checked]:text-white"
>
  <input ${parameters.checked ? "checked" : ""} class="sr-only" name="${id}-${parameterName}" type="radio" value="${parameters.value}" />
  <span>${parameters.displayValue}</span>
</label>`;
  }

  // src/ui/components/slider.ts
  function slider({
    id,
    label,
    parameterName,
    parameters: {
      min = 1,
      max = 4e3,
      value = 500,
      type = "range",
      step = 1
    } = {}
  }) {
    return `
<label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300" for="${id}-${parameterName}"
  >${label}</label
>
<div class="mt-2 flex items-center gap-4">
  <input
    class="h-2 w-full cursor-pointer appearance-none rounded-full bg-primary/20 dark:bg-primary/50 slider-thumb"
    id="${id}-${parameterName}"
    min="${min}"
    max="${max}"      
    type="${type}"
    value="${value}"
    step="${step}"
  />
  <span id="${id}-${parameterName}-label" class="w-10 text-right text-sm font-medium text-neutral-900 dark:text-white">500</span>
</div>
`;
  }

  // src/ui/UIBuilder.ts
  var UIBuilder = class _UIBuilder {
    static {
      this.elements = new Array();
    }
    constructor() {
    }
    static wrap(element) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = element;
      return wrapper;
    }
    static addSlider(properties) {
      const element = slider(properties);
      _UIBuilder.elements.push({
        wrapper: _UIBuilder.wrap(element),
        element: {
          ...properties,
          type: "slider"
        }
      });
      return this;
    }
    static addButton(properties) {
      const element = button(properties);
      _UIBuilder.elements.push({
        wrapper: _UIBuilder.wrap(element),
        element: {
          ...properties,
          type: "button"
        }
      });
      return this;
    }
    static addRadioButton(properties) {
      const element = radiobutton(properties);
      _UIBuilder.elements.push({
        wrapper: _UIBuilder.wrap(element),
        element: {
          ...properties,
          type: "radio"
        }
      });
      return this;
    }
    static build(label, buildElements) {
      const ui = _UIBuilder.wrap(fieldset({ label }));
      if (_UIBuilder.elements.length === 0 && buildElements && buildElements?.length > 0) {
        ui.querySelector("div")?.append(...buildElements);
        return {
          ui,
          elements: []
        };
      }
      ui.querySelector("div")?.append(
        ..._UIBuilder.elements.map((item) => item.wrapper)
      );
      const elements = _UIBuilder.elements.map((item) => item.element);
      _UIBuilder.elements = new Array();
      return {
        ui,
        elements
      };
    }
  };

  // src/sound/d-envelope/d-envelope.ui.ts
  function createDEnvelopeUI(params) {
    const ui = UIBuilder.addSlider({
      id: params.name,
      parameterName: "d-envelope-decay",
      label: "Decay",
      parameters: { min: 0, max: 5, value: 1, step: 0.01, type: "range" }
    }).addButton({
      id: params.name,
      parameterName: "d-envelope-trigger",
      displayValue: "Trigger"
    }).build(params.label);
    return ui;
  }

  // src/sound/d-envelope/d-envelope.module.ts
  var DEnvelopeModule = class {
    constructor(audioContext, { name, label }) {
      this.name = name;
      this.audioContext = audioContext;
      const { ui, elements } = createDEnvelopeUI({
        name: this.name,
        label
      });
      this.ui = ui;
      this.elements = elements;
      this.audio = new DEnvelopeAudio(this.audioContext, { decay: 0.8 });
      this.setupEventListeners();
    }
    setupEventListeners() {
      const eventHandlers = [
        (value) => {
          this.audio.setDecay(Number(value));
        },
        () => {
          this.audio.trigger();
        }
      ];
      UIEventHandler.attach(this.elements, this.ui, eventHandlers);
    }
  };

  // src/sound/dca/dca.audio.ts
  var DcaAudio = class {
    constructor(audioContext, { gain }) {
      this.audioContext = audioContext;
      this.gain = gain;
      this.gainNode = new GainNode(this.audioContext, { gain: this.gain });
    }
    setGain(value) {
      this.gain = value;
      this.gainNode.gain.setValueAtTime(value, this.audioContext.currentTime);
    }
    get node() {
      return this.gainNode;
    }
  };

  // src/sound/dca/dca.ui.ts
  function createDcaUI(params) {
    const ui = UIBuilder.addSlider({
      id: params.name,
      parameterName: "dca-gain",
      label: "Gain",
      parameters: {
        min: 0,
        max: 1e3,
        value: params.gain,
        step: 1,
        type: "range"
      }
    }).build(params.label);
    return ui;
  }

  // src/sound/dca/dca.module.ts
  var DcaModule = class {
    constructor(audioContext, {
      name,
      label,
      gain = 1e3
    }) {
      this.name = name;
      this.audioContext = audioContext;
      const { ui, elements } = createDcaUI({ name: this.name, label, gain });
      this.ui = ui;
      this.elements = elements;
      this.audio = new DcaAudio(this.audioContext, { gain: 1 });
      this.setupEventListeners();
    }
    setupEventListeners() {
      const eventHandlers = [
        (value) => {
          this.audio.setGain(Number(value));
        }
      ];
      UIEventHandler.attach(this.elements, this.ui, eventHandlers);
    }
  };

  // src/sound/mixer/mixer.audio.ts
  var MixerAudio = class {
    constructor(audioContext, {
      channel1Level = 1,
      channel2Level = 1,
      channel3Level = 1
    }) {
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

  // src/sound/mixer/mixer.ui.ts
  function createMixerUI(params) {
    const ui = UIBuilder.addSlider({
      id: params.name,
      parameterName: "channel-1-level",
      label: "Channel 1",
      parameters: {
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.7
      }
    }).addSlider({
      id: params.name,
      parameterName: "channel-2-level",
      label: "Channel 2",
      parameters: {
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.7
      }
    }).addSlider({
      id: params.name,
      parameterName: "channel-3-level",
      label: "Channel 3",
      parameters: {
        min: 0,
        max: 1,
        step: 0.01,
        value: 0.7
      }
    }).build(params.label);
    return ui;
  }

  // src/sound/mixer/mixer.module.ts
  var MixerModule = class {
    constructor(audioContext, { name, label }) {
      this.name = name;
      const { ui, elements } = createMixerUI({ name: this.name, label });
      this.ui = ui;
      this.elements = elements;
      this.audio = new MixerAudio(audioContext, {
        channel1Level: 1,
        channel2Level: 1,
        channel3Level: 1
      });
      this.setupEventListeners();
    }
    setupEventListeners() {
      const eventHandlers = [
        (value) => {
          this.audio.setChannel1Level(Number(value));
        },
        (value) => {
          this.audio.setChannel2Level(Number(value));
        },
        (value) => {
          this.audio.setChannel3Level(Number(value));
        }
      ];
      UIEventHandler.attach(this.elements, this.ui, eventHandlers);
    }
  };

  // src/sound/oscillator/oscillator.audio.ts
  var OscillatorAudio = class {
    constructor(audioContext, {
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

  // src/sound/oscillator/oscillator.ui.ts
  function createOscillatorUI(params) {
    const ui = UIBuilder.addSlider({
      id: params.name,
      parameterName: "frequency",
      label: "Frequency",
      parameters: {
        min: 1,
        max: 2e3,
        value: params.frequency,
        step: 1,
        type: "range"
      }
    }).addRadioButton({
      id: params.name,
      label: "Type",
      parameterName: "type",
      parameters: [
        {
          checked: true,
          value: "sine",
          displayValue: "Sine"
        },
        {
          value: "sawtooth",
          displayValue: "Saw"
        },
        {
          value: "square",
          displayValue: "Square"
        },
        {
          value: "triangle",
          displayValue: "Triangle"
        }
      ]
    }).build(params.label);
    return ui;
  }

  // src/sound/oscillator/oscillator.module.ts
  var OscillatorModule = class {
    constructor(audioContext, {
      name,
      label,
      autostart = true,
      frequency = 1e3
    }) {
      this.name = name;
      this.audioContext = audioContext;
      const { ui, elements } = createOscillatorUI({
        name: this.name,
        label,
        frequency
      });
      this.ui = ui;
      this.elements = elements;
      this.audio = new OscillatorAudio(this.audioContext, {
        frequency: 500,
        type: "sine"
      });
      if (autostart) {
        this.audio.start();
      }
      this.setupEventListeners();
    }
    setupEventListeners() {
      const eventHandlers = [
        (value) => {
          this.audio.setFrequency(Number(value));
        },
        (value) => {
          this.audio.setType(value);
        }
      ];
      UIEventHandler.attach(this.elements, this.ui, eventHandlers);
    }
  };

  // src/index.ts
  async function main() {
    const audioContext = new AudioContext();
    const contentContext = document.getElementById("content");
    if (!contentContext) {
      throw new Error("Content element not found");
    }
    const globalButtons = UIBuilder.addButton({
      id: "global",
      parameterName: "toggle-audio",
      displayValue: "Toggle Audio"
    }).addButton({
      id: "global",
      parameterName: "trigger-envelopes",
      displayValue: "Trigger"
    }).build("Global");
    contentContext.appendChild(globalButtons.ui);
    const dcaFm12Level = new DcaModule(audioContext, {
      name: "dca1",
      label: "Oscillator 1 > 2 FM Level",
      gain: 100
    });
    const osc1 = new OscillatorModule(audioContext, {
      name: "osc1",
      label: "Oscillator 1",
      frequency: 722
    });
    const ampEnvelope1 = new DEnvelopeModule(audioContext, {
      name: "ampenv1",
      label: "DCA 1 Envelope"
    });
    const pitchEnvelopeDca1 = new DcaModule(audioContext, {
      name: "pitchEnvelopeDca1",
      label: "Pitch 2 Envelope Level",
      gain: 100
    });
    const pitchEnvelope1 = new DEnvelopeModule(audioContext, {
      name: "pitchenv1",
      label: "Pitch 1 Envelope"
    });
    const dcaFm23Level = new DcaModule(audioContext, {
      name: "dca2",
      label: "Oscillator 2 > 3 FM Level",
      gain: 100
    });
    const osc2 = new OscillatorModule(audioContext, {
      name: "osc2",
      label: "Oscillator 2",
      frequency: 56
    });
    const ampEnvelope2 = new DEnvelopeModule(audioContext, {
      name: "denv2",
      label: "DCA 2 Envelope"
    });
    const pitchEnvelopeDca2 = new DcaModule(audioContext, {
      name: "pitchEnvelopeDca2",
      label: "Pitch 2 Envelope Level",
      gain: 50
    });
    const pitchEnvelope2 = new DEnvelopeModule(audioContext, {
      name: "pitchenv2",
      label: "Pitch 2 Envelope"
    });
    const dcaFm31Level = new DcaModule(audioContext, {
      name: "dca3",
      label: "Oscillator 3 > 1 FM Level",
      gain: 300
    });
    const osc3 = new OscillatorModule(audioContext, {
      name: "osc3",
      label: "Oscillator 3",
      frequency: 175
    });
    const ampEnvelope3 = new DEnvelopeModule(audioContext, {
      name: "denv3",
      label: "DCA 3 Envelope"
    });
    const pitchEnvelopeDca3 = new DcaModule(audioContext, {
      name: "pitchEnvelopeDca3",
      label: "Pitch 3 Envelope Level",
      gain: 500
    });
    const pitchEnvelope3 = new DEnvelopeModule(audioContext, {
      name: "pitchenv3",
      label: "Pitch 3 Envelope"
    });
    const operator1 = UIBuilder.build("Operator 1", [
      dcaFm31Level.ui,
      osc1.ui,
      ampEnvelope1.ui,
      pitchEnvelopeDca1.ui,
      pitchEnvelope1.ui
    ]);
    contentContext.appendChild(operator1.ui);
    const operator2 = UIBuilder.build("Operator 2", [
      dcaFm12Level.ui,
      osc2.ui,
      ampEnvelope2.ui,
      pitchEnvelopeDca2.ui,
      pitchEnvelope2.ui
    ]);
    contentContext.appendChild(operator2.ui);
    const operator3 = UIBuilder.build("Operator 3", [
      dcaFm23Level.ui,
      osc3.ui,
      ampEnvelope3.ui,
      pitchEnvelopeDca3.ui,
      pitchEnvelope3.ui
    ]);
    contentContext.appendChild(operator3.ui);
    const mixer1 = new MixerModule(audioContext, {
      name: "mixer1",
      label: "Mixer"
    });
    contentContext.appendChild(mixer1.ui);
    mixer1.audio.nodes.sum.connect(audioContext.destination);
    osc1.audio.node.connect(ampEnvelope1.audio.node).connect(dcaFm12Level.audio.node).connect(osc2.audio.node.frequency);
    new ConstantModule(audioContext).audio.node.connect(pitchEnvelopeDca1.audio.node).connect(pitchEnvelope1.audio.node).connect(osc1.audio.node.frequency);
    osc2.audio.node.connect(ampEnvelope2.audio.node).connect(dcaFm23Level.audio.node).connect(osc3.audio.node.frequency);
    new ConstantModule(audioContext).audio.node.connect(pitchEnvelopeDca2.audio.node).connect(pitchEnvelope2.audio.node).connect(osc2.audio.node.frequency);
    osc3.audio.node.connect(ampEnvelope3.audio.node).connect(dcaFm31Level.audio.node).connect(osc1.audio.node.frequency);
    new ConstantModule(audioContext).audio.node.connect(pitchEnvelopeDca3.audio.node).connect(pitchEnvelope3.audio.node).connect(osc3.audio.node.frequency);
    osc1.audio.node.connect(ampEnvelope1.audio.node).connect(mixer1.audio.nodes.channel1);
    osc2.audio.node.connect(ampEnvelope2.audio.node).connect(mixer1.audio.nodes.channel2);
    osc3.audio.node.connect(ampEnvelope3.audio.node).connect(mixer1.audio.nodes.channel3);
    function envelopesHandler() {
      ampEnvelope1.audio.trigger(audioContext.currentTime);
      pitchEnvelope1.audio.trigger(audioContext.currentTime);
      ampEnvelope2.audio.trigger(audioContext.currentTime);
      pitchEnvelope2.audio.trigger(audioContext.currentTime);
      ampEnvelope3.audio.trigger(audioContext.currentTime);
      pitchEnvelope3.audio.trigger(audioContext.currentTime);
    }
    document.addEventListener("keydown", (event) => {
      if (event.key === "w" || event.key === "W") {
        envelopesHandler();
      }
    });
    const globalButtonsEventHandlers = [
      async () => {
        console.log("Button clicked");
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        } else if (audioContext.state === "running") {
          await audioContext.suspend();
        }
      },
      () => {
        envelopesHandler();
      }
    ];
    UIEventHandler.attach(
      globalButtons.elements,
      globalButtons.ui,
      globalButtonsEventHandlers
    );
  }
  window.addEventListener("load", () => {
    console.log("Window loaded");
    main().catch((error) => {
      console.error("Error in main:", error);
    });
  });
})();
//# sourceMappingURL=bundle.js.map

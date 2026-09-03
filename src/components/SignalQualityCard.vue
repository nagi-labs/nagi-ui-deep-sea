<script setup lang="ts">
import { VisArea, VisAxis, VisLine, VisXYContainer } from "@unovis/vue";
import { computed, ref, watch } from "vue";

import { NButton, NCard } from "./nagi";
import type { Station } from "../data/stations";

const props = defineProps<{
  selected: Station;
  stations: readonly Station[];
  timeline: readonly string[];
}>();

const emit = defineEmits<{
  select: [stationId: string];
  rendered: [];
}>();

interface SignalSample {
  index: number;
  value: number;
}

const rendered = ref(false);
const chartDuration = ref(0);
const chartMargin = { top: 6, right: 4, bottom: 18, left: 0 };
const chartData = computed<SignalSample[]>(() =>
  props.selected.signalHistory.map((value, index) => ({ index, value })),
);

const sampleIndex = (sample: SignalSample) => sample.index;
const signalValue = (sample: SignalSample) => sample.value;
const formatTimeline = (value: number | Date) =>
  typeof value === "number" ? (props.timeline[Math.round(value)] ?? "") : "";
const formatSignal = (value: number | Date) =>
  typeof value === "number" ? String(Math.round(value)) : "";

watch(
  () => props.selected.id,
  () => {
    chartDuration.value = 820;
  },
);

function reportRendered() {
  if (rendered.value) return;
  rendered.value = true;
  emit("rendered");
}
</script>

<template>
  <section class="deep-sea-signal-quality-card">
    <n-card
      class="n-card"
      title="Signal quality"
      :description="`${selected.name} · last 12 hours`"
      :data-rendered="rendered"
    >
      <div class="n-card-content">
        <div class="unit -switcher">
          <span class="text">Switch station</span>
          <div
            class="group"
            role="group"
            aria-label="Switch station"
          >
            <n-button
              v-for="station in stations"
              :key="station.id"
              class="n-button"
              :aria-pressed="station.id === selected.id"
              @click="emit('select', station.id)"
            >
              <span
                v-if="station.id === selected.id"
                class="icon"
                aria-hidden="true"
              />
              <span class="text">{{ station.name }}</span>
            </n-button>
          </div>
        </div>

        <div class="unit -reading">
          <span class="text">Current</span>
          <strong class="strong">{{ selected.signal }}%</strong>
          <span
            class="text -trend"
            :data-attention="selected.signal < 80 ? '' : undefined"
          >
            {{ selected.signal >= 80 ? "Stable" : "Needs review" }}
          </span>
        </div>

        <figure
          class="figure"
          data-nagi-unovis
        >
          <VisXYContainer
            class="unovis-xy-container"
            :data="chartData"
            :height="224"
            :y-domain="[50, 100]"
            :margin="chartMargin"
            :aria-label="`${selected.name} signal quality over the last 12 hours, ending at ${selected.signal} percent`"
            :on-render-complete="reportRendered"
          >
            <VisArea
              class="unovis-area"
              :x="sampleIndex"
              :y="signalValue"
              :baseline="50"
              color="var(--vis-color0)"
              :opacity="0.08"
              :duration="chartDuration"
            />
            <VisLine
              class="unovis-line"
              :x="sampleIndex"
              :y="signalValue"
              color="var(--vis-color0)"
              :line-width="2"
              :duration="chartDuration"
            />
            <VisAxis
              class="unovis-axis"
              type="x"
              :tick-values="chartData.map((sample) => sample.index)"
              :tick-format="formatTimeline"
              :tick-line="false"
              :domain-line="false"
            />
            <VisAxis
              class="unovis-axis"
              type="y"
              :tick-values="[60, 80, 100]"
              :tick-format="formatSignal"
              :tick-line="false"
              :domain-line="false"
            />
          </VisXYContainer>
          <figcaption class="figcaption">
            Seven signal samples for {{ selected.name }}, ranging from
            {{ Math.min(...selected.signalHistory) }} to
            {{ Math.max(...selected.signalHistory) }} percent.
          </figcaption>
        </figure>
      </div>
    </n-card>
  </section>
</template>

<style scoped>
.deep-sea-signal-quality-card {
  > .n-card {
    border-color: var(--nagi-color-border-muted);
    border-radius: var(--n-radius-3);
    background: var(--nagi-color-surface);
    box-shadow: none;

    .n-card-content {
      > .unit.-switcher {
        display: grid;
        gap: var(--n-space-3);
        margin-block-end: var(--n-space-6);

        > .text {
          color: var(--nagi-color-text-muted);
          font-size: var(--n-font-size-1);
          font-weight: 650;
        }

        > .group {
          display: flex;
          gap: var(--n-space-2);
          padding-block-end: var(--n-space-1);
          overflow-x: auto;
          scrollbar-width: thin;

          > .n-button {
            --button-size: small;
            --button-appearance: ghost;

            position: relative;
            isolation: isolate;
            flex: 0 0 auto;
            color: var(--nagi-color-text-muted);
            font-size: var(--n-font-size-1);

            &[aria-pressed="true"] {
              color: var(--nagi-color-text);
            }

            .n-button-content {
              > .icon {
                position: absolute;
                inset: 0;
                z-index: 0;
                border: var(--n-border-width-1) solid var(--nagi-color-border-strong);
                border-radius: inherit;
                background: var(--nagi-color-surface-raised);
                pointer-events: none;
              }

              > .text {
                position: relative;
                z-index: 1;
              }
            }
          }
        }
      }

      > .unit.-reading {
        display: flex;
        gap: var(--n-space-4);
        align-items: baseline;
        margin-block-end: var(--n-space-2);

        > .text {
          color: var(--nagi-color-text-muted);
          font-size: var(--n-font-size-1);
        }

        > .strong {
          font-size: var(--n-font-size-6);
          font-weight: 600;
        }

        > .text.-trend {
          color: var(--nagi-color-success);

          &[data-attention] {
            color: var(--nagi-color-warning);
          }
        }
      }

      > .figure {
        block-size: 14rem;
        margin: 0;
        background: var(--nagi-color-surface);

        > .unovis-xy-container {
          inline-size: 100%;
          block-size: 100%;
        }

        > .figcaption {
          position: absolute;
          inline-size: 1px;
          block-size: 1px;
          padding: 0;
          overflow: hidden;
          clip-path: inset(50%);
          white-space: nowrap;
          border: 0;
        }
      }
    }
  }
}
</style>

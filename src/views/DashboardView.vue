<script setup lang="ts">
import { VisArea, VisAxis, VisLine, VisXYContainer } from "@unovis/vue";
import { AnimatePresence, motion, useReducedMotion } from "motion-v";
import { computed, onBeforeUnmount, ref } from "vue";

import { NBadge, NButton, NCard, NCombobox, NDialog, NProgress, NTable } from "../components/nagi";
import {
  signalTimeline,
  stationColumns,
  stationOptions,
  stations,
  type StationStatus,
} from "../data/stations";

const reduceMotion = useReducedMotion();
const query = ref("");
const selectedStation = ref<string | null>("kermadec-07");
const dialogOpen = ref(false);
const syncing = ref(false);
const lastSync = ref("04:18 UTC");
let syncTimer: ReturnType<typeof setTimeout> | undefined;

const selected = computed(
  () => stations.find((station) => station.id === selectedStation.value) ?? stations[0],
);

interface SignalSample {
  index: number;
  value: number;
}

const chartData = computed<SignalSample[]>(() =>
  selected.value.signalHistory.map((value, index) => ({ index, value })),
);
const sampleIndex = (sample: SignalSample) => sample.index;
const signalValue = (sample: SignalSample) => sample.value;
const formatTimeline = (value: number | Date) =>
  typeof value === "number" ? (signalTimeline[Math.round(value)] ?? "") : "";
const formatSignal = (value: number | Date) =>
  typeof value === "number" ? String(Math.round(value)) : "";

const enterTransition = computed(() => ({
  duration: reduceMotion.value ? 0 : 0.44,
  ease: [0.22, 1, 0.36, 1] as const,
}));

const stateTransition = computed(() =>
  reduceMotion.value
    ? { duration: 0 }
    : { type: "spring" as const, visualDuration: 0.56, bounce: 0.16 },
);

const chartDuration = computed(() => (reduceMotion.value ? 0 : 820));

function syncNetwork() {
  if (syncing.value) return;

  syncing.value = true;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(
    () => {
      syncing.value = false;
      lastSync.value = "just now";
    },
    reduceMotion.value ? 0 : 720,
  );
}

function selectStation(stationId: string) {
  selectedStation.value = stationId;
  query.value = "";
}

function badgeTone(status: StationStatus) {
  if (status === "Nominal") return "success";
  if (status === "Watch") return "warning";
  return "accent";
}

onBeforeUnmount(() => clearTimeout(syncTimer));
</script>

<template>
  <main class="dashboard-view">
    <header class="page-heading">
      <div class="heading-copy">
        <p class="eyebrow">Pacific monitoring network</p>
        <h1>Network overview</h1>
        <p class="lede">Station health, signal quality, and scheduled transfers.</p>
      </div>
      <div class="actions">
        <n-button
          class="sync-button"
          :disabled="syncing"
          @click="syncNetwork"
        >
          <motion.span
            class="sync-icon"
            aria-hidden="true"
            :animate="{ rotate: syncing ? 360 : 0 }"
            :transition="{ duration: reduceMotion ? 0 : 0.62, ease: 'easeInOut' }"
          >
            ↻
          </motion.span>
          {{ syncing ? "Syncing" : "Sync data" }}
        </n-button>
        <n-dialog
          class="report-dialog"
          v-model:open="dialogOpen"
          trigger-label="Create report"
          title="Create network report"
          description="Export the current operational snapshot for the handover log."
        >
          <p class="dialog-copy">
            The report includes station status, the selected signal history, and the latest
            telemetry received by this browser session.
          </p>
          <template #actions>
            <n-button class="confirm-report">Export report</n-button>
          </template>
        </n-dialog>
      </div>
    </header>

    <motion.section
      class="metric-grid"
      aria-label="Network summary"
      :initial="reduceMotion ? undefined : { opacity: 0, y: 8 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="enterTransition"
    >
      <motion.article
        class="metric"
        layout
        :while-hover="reduceMotion ? undefined : { y: -2 }"
        :transition="stateTransition"
      >
        <span class="label">Stations online</span>
        <strong>18 / 18</strong>
        <span class="change -positive">All reporting</span>
      </motion.article>
      <motion.article
        class="metric"
        layout
        :while-hover="reduceMotion ? undefined : { y: -2 }"
        :transition="stateTransition"
      >
        <span class="label">Selected signal</span>
        <AnimatePresence mode="wait">
          <motion.strong
            :key="selected.id"
            :initial="reduceMotion ? undefined : { opacity: 0, y: 6 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -6 }"
            :transition="enterTransition"
          >
            {{ selected.signal }}%
          </motion.strong>
        </AnimatePresence>
        <span class="change">{{ selected.name }}</span>
      </motion.article>
      <motion.article
        class="metric"
        layout
        :while-hover="reduceMotion ? undefined : { y: -2 }"
        :transition="stateTransition"
      >
        <span class="label">Network availability</span>
        <strong>99.98%</strong>
        <span class="change">30-day window</span>
      </motion.article>
      <motion.article
        class="metric"
        layout
        :while-hover="reduceMotion ? undefined : { y: -2 }"
        :transition="stateTransition"
      >
        <span class="label">Next transfer</span>
        <strong>42 min</strong>
        <span class="change">Sandwich 04</span>
      </motion.article>
    </motion.section>

    <section class="operations-grid">
      <n-card
        class="signal-card"
        title="Signal quality"
        :description="`${selected.name} · last 12 hours`"
      >
        <div class="station-switcher">
          <span>Switch station</span>
          <div
            class="station-tabs"
            role="group"
            aria-label="Switch station"
          >
            <n-button
              v-for="station in stations"
              :key="station.id"
              class="station-tab"
              :aria-pressed="station.id === selected.id"
              @click="selectStation(station.id)"
            >
              <motion.span
                v-if="station.id === selected.id"
                class="station-tab-indicator"
                layout-id="selected-station"
                :transition="stateTransition"
                aria-hidden="true"
              />
              <span>{{ station.name }}</span>
            </n-button>
          </div>
        </div>

        <div class="chart-summary">
          <span>Current</span>
          <strong>{{ selected.signal }}%</strong>
          <span :class="['trend', selected.signal >= 80 ? '-positive' : '-attention']">
            {{ selected.signal >= 80 ? "Stable" : "Needs review" }}
          </span>
        </div>

        <figure
          class="signal-chart"
          data-nagi-unovis
        >
          <VisXYContainer
            class="unovis-xy-container"
            :data="chartData"
            :height="224"
            :y-domain="[50, 100]"
            :aria-label="`${selected.name} signal quality over the last 12 hours, ending at ${selected.signal} percent`"
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
          <figcaption>
            Seven signal samples for {{ selected.name }}, ranging from
            {{ Math.min(...selected.signalHistory) }} to {{ Math.max(...selected.signalHistory) }}
            percent.
          </figcaption>
        </figure>
      </n-card>

      <motion.aside
        class="telemetry-panel"
        layout
        :transition="stateTransition"
      >
        <header>
          <div>
            <span class="eyebrow">Selected station</span>
            <h2>Station details</h2>
          </div>
          <n-badge
            :label="selected.status"
            :tone="badgeTone(selected.status)"
          />
        </header>

        <n-combobox
          class="station-picker"
          v-model="query"
          v-model:selected="selectedStation"
          label="Find another station"
          :items="stationOptions"
          placeholder="Search all stations"
          clearable
        />

        <div class="station-detail-stage">
          <AnimatePresence>
            <motion.div
              :key="selected.id"
              class="station-detail"
              :initial="reduceMotion ? undefined : { opacity: 0, x: 18 }"
              :animate="{ opacity: 1, x: 0 }"
              :exit="{ opacity: 0, x: -18 }"
              :transition="enterTransition"
            >
              <div class="telemetry-list">
                <n-progress
                  label="Signal"
                  :value="selected.signal"
                  :max="100"
                />
                <n-progress
                  label="Battery"
                  :value="selected.battery"
                  :max="100"
                />
                <n-progress
                  label="Sample capacity"
                  :value="selected.capacity"
                  :max="100"
                />
              </div>

              <dl class="readings">
                <div>
                  <dt>Pressure</dt>
                  <dd>{{ selected.pressure }}</dd>
                </div>
                <div>
                  <dt>Salinity</dt>
                  <dd>{{ selected.salinity }}</dd>
                </div>
                <div>
                  <dt>Drift</dt>
                  <dd>{{ selected.drift }}</dd>
                </div>
                <div>
                  <dt>Last packet</dt>
                  <dd>{{ selected.lastPacket }}</dd>
                </div>
              </dl>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.aside>
    </section>

    <motion.section
      class="station-section"
      :initial="reduceMotion ? undefined : { opacity: 0, y: 10 }"
      :while-in-view="{ opacity: 1, y: 0 }"
      :in-view-options="{ once: true, amount: 0.2 }"
      :transition="enterTransition"
    >
      <header>
        <div>
          <h2>Stations</h2>
          <p>Priority stations ordered by operational status.</p>
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            :key="lastSync"
            class="sync-time"
            :initial="reduceMotion ? undefined : { opacity: 0, y: 4 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -4 }"
            :transition="enterTransition"
          >
            Updated {{ lastSync }}
          </motion.span>
        </AnimatePresence>
      </header>

      <n-table
        :rows="stations"
        :columns="stationColumns"
        caption="Priority monitoring stations"
        caption-hidden
        row-key="id"
      >
        <template #cell-name="{ row }">
          <span class="station-name">
            <span
              class="station-dot"
              aria-hidden="true"
            />
            <span>
              <strong>{{ row.name }}</strong>
              <small>{{ row.temperature }}</small>
            </span>
          </span>
        </template>
        <template #cell-signal="{ value }">{{ value }}%</template>
        <template #cell-status="{ value }">
          <n-badge
            :label="String(value)"
            :tone="badgeTone(value as StationStatus)"
          />
        </template>
      </n-table>
    </motion.section>
  </main>
</template>

<script setup lang="ts">
import { motion, useReducedMotion } from "motion-v";
import { computed, ref } from "vue";

import { NBadge, NButton, NCard, NCombobox, NDialog, NProgress, NTable } from "../components/nagi";
import { stationColumns, stationOptions, stations, type StationStatus } from "../data/stations";

const reduceMotion = useReducedMotion();
const query = ref("");
const selectedStation = ref<string | null>("hadal-07");
const dialogOpen = ref(false);
const lastSync = ref("04:18 UTC");

const enterTransition = computed(() => ({
  duration: reduceMotion.value ? 0 : 0.48,
  ease: [0.22, 1, 0.36, 1] as const,
}));

function syncArray() {
  lastSync.value = "just now";
}

function badgeTone(status: StationStatus) {
  if (status === "Nominal") return "success";
  if (status === "Watch") return "warning";
  return "accent";
}
</script>

<template>
  <main class="dashboard-view">
    <motion.header
      class="page-heading"
      :initial="reduceMotion ? undefined : { opacity: 0, y: 12 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="enterTransition"
    >
      <div class="heading-copy">
        <p class="eyebrow">North Pacific array · 04:20 UTC</p>
        <h1>Command deck</h1>
        <p class="lede">
          A live operational view of the instruments working below the photic zone.
        </p>
      </div>
      <div class="actions">
        <n-button @click="syncArray">Synchronize</n-button>
        <n-dialog
          class="plan-dive-dialog"
          v-model:open="dialogOpen"
          trigger-label="Plan a dive"
          title="Plan a dive"
          description="Create a draft mission around the current abyssal conditions."
        >
          <div class="dialog-copy">
            <span class="coordinate">31° 12′ S · 176° 28′ W</span>
            <p>
              Hadal 07 reports a stable water column and a 96% acoustic link. The draft remains
              local until an operator confirms it.
            </p>
          </div>
          <template #actions>
            <n-button class="confirm-dive">Create draft</n-button>
          </template>
        </n-dialog>
      </div>
    </motion.header>

    <motion.section
      class="metric-grid"
      aria-label="Current array metrics"
      :initial="reduceMotion ? undefined : { opacity: 0, y: 16 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ ...enterTransition, delay: reduceMotion ? 0 : 0.06 }"
    >
      <article class="metric">
        <span class="label">Active stations</span>
        <strong>18</strong>
        <span class="change -positive">All primary links online</span>
      </article>
      <article class="metric">
        <span class="label">Deepest signal</span>
        <strong>9,842 m</strong>
        <span class="change">Hadal 07 · Kermadec</span>
      </article>
      <article class="metric">
        <span class="label">Water column</span>
        <strong>1.7 °C</strong>
        <span class="change">Stable over 6 hours</span>
      </article>
      <article class="metric">
        <span class="label">Next uplink</span>
        <strong>00:42</strong>
        <span class="change">Umbra 04 surfacing</span>
      </article>
    </motion.section>

    <section class="operations-grid">
      <motion.div
        class="sonar-card"
        :initial="reduceMotion ? undefined : { opacity: 0, scale: 0.985 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{ ...enterTransition, delay: reduceMotion ? 0 : 0.12 }"
      >
        <n-card
          title="Abyssal field"
          description="Acoustic contacts across the active observation radius"
        >
          <div class="sonar-field">
            <div
              class="sonar-rings"
              aria-hidden="true"
            >
              <span class="ring -one" />
              <span class="ring -two" />
              <span class="ring -three" />
              <span class="sweep" />
              <span class="contact -a" />
              <span class="contact -b" />
              <span class="contact -c" />
              <span class="contact -d" />
            </div>
            <div class="sonar-reading">
              <span class="kicker">Primary contact</span>
              <strong>Hadal 07</strong>
              <span>31° 12′ S · 176° 28′ W</span>
              <span class="depth">−9,842 m</span>
            </div>
          </div>
        </n-card>
      </motion.div>

      <motion.aside
        class="telemetry-panel"
        :initial="reduceMotion ? undefined : { opacity: 0, x: 16 }"
        :animate="{ opacity: 1, x: 0 }"
        :transition="{ ...enterTransition, delay: reduceMotion ? 0 : 0.16 }"
      >
        <header>
          <div>
            <span class="eyebrow">Selected station</span>
            <h2>Telemetry</h2>
          </div>
          <n-badge
            label="Live"
            tone="success"
          />
        </header>

        <n-combobox
          class="station-picker"
          v-model="query"
          v-model:selected="selectedStation"
          label="Jump to station"
          :items="stationOptions"
          placeholder="Search the array"
          clearable
        />

        <div class="telemetry-list">
          <n-progress
            label="Acoustic link"
            :value="96"
            :max="100"
          />
          <n-progress
            label="Battery reserve"
            :value="78"
            :max="100"
          />
          <n-progress
            label="Sample capacity"
            :value="61"
            :max="100"
          />
        </div>

        <dl class="readings">
          <div>
            <dt>Pressure</dt>
            <dd>99.4 MPa</dd>
          </div>
          <div>
            <dt>Salinity</dt>
            <dd>34.7 PSU</dd>
          </div>
          <div>
            <dt>Drift</dt>
            <dd>0.12 kn NE</dd>
          </div>
        </dl>
      </motion.aside>
    </section>

    <motion.section
      class="station-section"
      :initial="reduceMotion ? undefined : { opacity: 0, y: 18 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ ...enterTransition, delay: reduceMotion ? 0 : 0.2 }"
    >
      <header>
        <div>
          <h2>Observation array</h2>
          <p>Priority stations ordered by current mission relevance.</p>
        </div>
        <span class="sync-time">Last synchronized {{ lastSync }}</span>
      </header>

      <n-table
        :rows="stations"
        :columns="stationColumns"
        caption="Priority observation stations"
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

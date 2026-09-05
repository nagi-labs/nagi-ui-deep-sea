<script setup lang="ts">
import { motion } from "motion-v";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

import { createToastManager } from "@nagi-labs/nagi-ui";

import { NBadge, NButton, NCombobox, NDialog, NMeter, NTable, NToast } from "../components/nagi";
import DashboardSkeleton from "../components/DashboardSkeleton.vue";
import SignalQualityCard from "../components/SignalQualityCard.vue";
import {
  signalTimeline,
  stationColumns,
  stationOptions,
  stations,
  type StationStatus,
} from "../data/stations";

const query = ref("");
const selectedStation = ref<string | null>("kermadec-07");
const dialogOpen = ref(false);
const syncing = ref(false);
const syncMotionRevision = ref(0);
const lastSync = ref("04:18 UTC");
const minimumSkeletonElapsed = ref(false);
const chartRendered = ref(false);
const toastManager = createToastManager({ duration: 5000, limit: 3 });
let syncTimer: ReturnType<typeof setTimeout> | undefined;
let skeletonTimer: ReturnType<typeof setTimeout> | undefined;

const minimumSkeletonDuration = 700;

const selected = computed(
  () => stations.find((station) => station.id === selectedStation.value) ?? stations[0],
);
const pageReady = computed(() => minimumSkeletonElapsed.value && chartRendered.value);

function syncNetwork() {
  if (syncing.value) return;

  syncing.value = true;
  syncMotionRevision.value += 1;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncing.value = false;
    lastSync.value = "just now";
    toastManager.add({
      title: "Network synchronized",
      description: "All 18 station feeds are current.",
      tone: "success",
    });
  }, 720);
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

onBeforeUnmount(() => {
  clearTimeout(syncTimer);
  clearTimeout(skeletonTimer);
  toastManager.dispose();
});

onMounted(() => {
  skeletonTimer = setTimeout(() => {
    minimumSkeletonElapsed.value = true;
  }, minimumSkeletonDuration);
});
</script>

<template>
  <div
    class="deep-sea-dashboard-view"
    :aria-busy="!pageReady"
  >
    <main
      class="main"
      data-motion-policy="selective"
      :data-ready="pageReady"
      :aria-hidden="pageReady ? undefined : 'true'"
    >
      <header class="header -page">
        <div class="unit -heading">
          <span class="text -eyebrow">Pacific monitoring network</span>
          <h1 class="title">Network overview</h1>
          <span class="text -lede">Station health, signal quality, and scheduled transfers.</span>
        </div>
        <div class="actions">
          <router-link
            class="link"
            :to="{ path: '/components', query: { source: 'page-dashboard-view' } }"
          >
            View page source
          </router-link>
          <n-button
            class="-sync n-button"
            :disabled="syncing"
            @click="syncNetwork"
          >
            <motion.span
              :key="syncMotionRevision"
              class="icon"
              aria-hidden="true"
              :initial="{ rotate: 0 }"
              :animate="{ rotate: syncMotionRevision === 0 ? 0 : 360 }"
              :transition="{ duration: 0.62, ease: 'easeInOut' }"
              >↻</motion.span
            >
            {{ syncing ? "Syncing" : "Sync data" }}
          </n-button>
          <n-dialog
            v-model:open="dialogOpen"
            class="n-dialog"
            force-motion-preview
            trigger-label="Create report"
            title="Create network report"
            description="Export the current operational snapshot for the handover log."
          >
            <div class="n-dialog-content">
              <span class="text">
                The report includes station status, the selected signal history, and the latest
                telemetry received by this browser session.
              </span>
            </div>
            <template #actions>
              <div class="n-dialog-actions">
                <n-button class="n-button">Export report</n-button>
              </div>
            </template>
          </n-dialog>
        </div>
      </header>

      <section
        class="section -metrics"
        aria-label="Network summary"
      >
        <article class="article">
          <span class="text -metric-label">Stations online</span>
          <strong class="strong">18 / 18</strong>
          <span
            class="text -change"
            data-positive
            >All reporting</span
          >
        </article>
        <article class="article">
          <span class="text -metric-label">Selected signal</span>
          <strong class="strong">{{ selected.signal }}%</strong>
          <span class="text -change">{{ selected.name }}</span>
        </article>
        <article class="article">
          <span class="text -metric-label">Network availability</span>
          <strong class="strong">99.98%</strong>
          <span class="text -change">30-day window</span>
        </article>
        <article class="article">
          <span class="text -metric-label">Next transfer</span>
          <strong class="strong">42 min</strong>
          <span class="text -change">Sandwich 04</span>
        </article>
      </section>

      <section class="section -operations">
        <signal-quality-card
          :selected="selected"
          :stations="stations"
          :timeline="signalTimeline"
          @select="selectStation"
          @rendered="chartRendered = true"
        />

        <aside class="aside">
          <header class="header">
            <div class="unit -heading">
              <span class="text -eyebrow">Selected station</span>
              <h2 class="title">Station details</h2>
            </div>
            <n-badge
              :label="selected.status"
              :tone="badgeTone(selected.status)"
            />
          </header>

          <n-combobox
            v-model="query"
            v-model:selected="selectedStation"
            class="n-combobox"
            label="Find another station"
            :items="stationOptions"
            placeholder="Search all stations"
            clearable
            force-motion-preview
          />

          <div class="unit -meters">
            <n-meter
              label="Signal"
              :value="selected.signal"
              :max="100"
              :motion-active="pageReady"
            />
            <n-meter
              label="Battery"
              :value="selected.battery"
              :max="100"
              :motion-active="pageReady"
            />
            <n-meter
              label="Sample capacity"
              :value="selected.capacity"
              :max="100"
              :motion-active="pageReady"
            />
          </div>

          <dl class="list">
            <div class="field">
              <dt class="term">Pressure</dt>
              <dd class="definition">{{ selected.pressure }}</dd>
            </div>
            <div class="field">
              <dt class="term">Salinity</dt>
              <dd class="definition">{{ selected.salinity }}</dd>
            </div>
            <div class="field">
              <dt class="term">Drift</dt>
              <dd class="definition">{{ selected.drift }}</dd>
            </div>
            <div class="field">
              <dt class="term">Last packet</dt>
              <dd class="definition">{{ selected.lastPacket }}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section class="section -stations">
        <header class="header">
          <div class="unit -heading">
            <h2 class="title">Stations</h2>
            <span class="text">Priority stations ordered by operational status.</span>
          </div>
          <time class="time">Updated {{ lastSync }}</time>
        </header>

        <n-table
          class="n-table"
          :rows="stations"
          :columns="stationColumns"
          caption="Priority monitoring stations"
          caption-hidden
          row-key="id"
        >
          <template #cell-name="{ row }">
            <span class="n-table-cell-content">
              <span
                class="icon"
                aria-hidden="true"
              />
              <span class="text">
                <strong class="strong">{{ row.name }}</strong>
                <small class="note">{{ row.temperature }}</small>
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
      </section>

      <n-toast
        :manager="toastManager"
        label="Network activity"
        force-motion-preview
      />
    </main>

    <dashboard-skeleton
      :data-ready="pageReady"
      :aria-hidden="pageReady ? 'true' : undefined"
    />
  </div>
</template>

<style scoped>
.deep-sea-dashboard-view {
  --local-eyebrow-tracking: 0.08em;
  --local-metric-size: 1.375rem;
  --local-panel-tracking: 0.06em;
  --local-page-title-max: 2rem;
  --local-page-title-min: 1.5rem;
  --local-tight-tracking: -0.025em;

  display: grid;
  inline-size: 100%;
  justify-items: center;
  min-inline-size: 0;

  > .main,
  > .deep-sea-dashboard-skeleton {
    grid-area: 1 / 1;
  }

  > .main {
    display: grid;
    gap: var(--n-space-7);
    inline-size: min(100%, 82rem);
    margin-inline: auto;
    padding: var(--n-space-8);
    transition: opacity 0.42s cubic-bezier(0.22, 1, 0.36, 1);

    &[data-ready="false"] {
      visibility: hidden;
      opacity: 0;
    }

    > .header.-page {
      display: flex;
      gap: var(--n-space-8);
      align-items: end;
      justify-content: space-between;
      block-size: 5.125rem;

      > .unit.-heading {
        max-inline-size: 38rem;

        > .text.-eyebrow {
          display: block;
          margin-block: 0 var(--n-space-3);
          color: var(--nagi-color-text-muted);
          font-size: var(--n-font-size-1);
          font-weight: 650;
          letter-spacing: var(--local-eyebrow-tracking);
          text-transform: uppercase;
        }

        > .title {
          margin: 0;
          font-size: clamp(var(--local-page-title-min), 2.4vw, var(--local-page-title-max));
          font-weight: 620;
          letter-spacing: var(--local-tight-tracking);
          line-height: 1.08;
        }

        > .text.-lede {
          display: block;
          margin: var(--n-space-3) 0 0;
          color: var(--nagi-color-text-muted);
          font-size: var(--n-font-size-4);
        }
      }

      > .actions {
        display: flex;
        flex: 0 0 auto;
        gap: var(--n-space-4);
        align-items: center;

        > .link {
          padding: var(--n-space-3) var(--n-space-5);
          border: var(--n-border-width-1) solid var(--nagi-color-border-muted);
          border-radius: var(--n-radius-2);
          color: var(--nagi-color-text-muted);
          font-size: var(--n-font-size-2);
          font-weight: 600;
          text-decoration: none;

          &:hover {
            border-color: var(--nagi-color-border-strong);
            background: var(--nagi-color-surface-raised);
            color: var(--nagi-color-text);
          }

          &:focus-visible {
            outline: none;
            box-shadow: var(--nagi-shadow-focus);
          }
        }

        > .n-button.-sync {
          --button-size: small;
          --button-appearance: outlined;

          gap: var(--n-space-3);

          .n-button-content {
            > .icon {
              display: inline-grid;
              place-items: center;
              font-size: var(--n-font-size-4);
              line-height: 1;
            }
          }
        }

        > .n-dialog {
          --dialog-backdrop-background: var(--deep-sea-backdrop);
          --dialog-backdrop-filter: blur(1px);
          --dialog-surface-background: var(--nagi-color-surface-raised);
          --dialog-surface-border-color: var(--nagi-color-border-strong);

          .n-dialog-content {
            > .text {
              display: block;
              max-inline-size: 32rem;
              margin: 0;
              color: var(--nagi-color-text-muted);
              font-size: var(--n-font-size-4);
            }
          }
        }
      }
    }

    > .section.-metrics {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: var(--n-space-5);

      > .article {
        display: grid;
        gap: var(--n-space-2);
        padding: var(--n-space-7) var(--n-space-8);
        border: var(--n-border-width-1) solid var(--nagi-color-border-muted);
        border-radius: var(--n-radius-3);
        background: var(--nagi-color-surface);

        > .text.-metric-label,
        > .text.-change {
          overflow: hidden;
          color: var(--nagi-color-text-muted);
          font-size: var(--n-font-size-1);
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        > .text.-metric-label {
          font-weight: 650;
        }

        > .strong {
          color: var(--nagi-color-text);
          font-size: var(--local-metric-size);
          font-weight: 580;
          letter-spacing: var(--local-tight-tracking);
          line-height: 1.2;
        }

        > .text.-change[data-positive] {
          color: var(--nagi-color-success);
        }
      }
    }

    > .section.-operations {
      display: grid;
      grid-template-columns: minmax(0, 1.55fr) minmax(17rem, 0.72fr);
      gap: var(--n-space-5);

      > .aside {
        display: grid;
        gap: var(--n-space-7);
        align-content: start;
        padding: var(--n-space-7) var(--n-space-8) var(--n-space-8);
        overflow: hidden;
        border: var(--n-border-width-1) solid var(--nagi-color-border-muted);
        border-radius: var(--n-radius-3);
        background: var(--nagi-color-surface);

        > .header {
          display: flex;
          align-items: start;
          justify-content: space-between;

          > .unit.-heading {
            > .text.-eyebrow {
              color: var(--nagi-color-text-muted);
              font-size: var(--n-font-size-1);
              font-weight: 650;
              letter-spacing: var(--local-panel-tracking);
              text-transform: uppercase;
            }

            > .title {
              margin: var(--n-space-1) 0 0;
              font-size: var(--n-font-size-4);
              font-weight: 650;
            }
          }
        }

        > .n-combobox {
          inline-size: 100%;
        }

        > .unit.-meters {
          display: grid;
          gap: var(--n-space-6);
        }

        > .list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          margin: 0;
          border-block-start: var(--n-border-width-1) solid var(--nagi-color-border-muted);
          border-inline-start: var(--n-border-width-1) solid var(--nagi-color-border-muted);

          > .field {
            padding: var(--n-space-5);
            border-block-end: var(--n-border-width-1) solid var(--nagi-color-border-muted);
            border-inline-end: var(--n-border-width-1) solid var(--nagi-color-border-muted);

            > .term {
              color: var(--nagi-color-text-muted);
              font-size: var(--n-font-size-1);
            }

            > .definition {
              margin: var(--n-space-1) 0 0;
              color: var(--nagi-color-text);
              font-size: var(--n-font-size-2);
              font-weight: 600;
            }
          }
        }
      }
    }

    > .section.-stations {
      display: grid;
      gap: var(--n-space-5);

      > .header {
        display: flex;
        gap: var(--n-space-8);
        align-items: end;
        justify-content: space-between;
        padding-block-start: var(--n-space-2);

        > .unit.-heading {
          > .title {
            margin: 0;
            font-size: var(--n-font-size-4);
            font-weight: 650;
          }

          > .text {
            display: block;
            margin: var(--n-space-1) 0 0;
            color: var(--nagi-color-text-muted);
            font-size: var(--n-font-size-1);
          }
        }

        > .time {
          color: var(--nagi-color-text-muted);
          font-size: var(--n-font-size-1);
        }
      }

      > .n-table {
        border-color: var(--nagi-color-border-muted);
        border-radius: var(--n-radius-3);
        background: var(--nagi-color-surface);

        .n-table-cell-content {
          display: flex;
          gap: var(--n-space-4);
          align-items: center;

          > .icon {
            inline-size: var(--n-space-3);
            block-size: var(--n-space-3);
            border-radius: 50%;
            background: var(--nagi-color-accent);
          }

          > .text {
            display: grid;

            > .note {
              color: var(--nagi-color-text-muted);
              font-weight: 400;
            }
          }
        }
      }
    }
  }

  > .deep-sea-dashboard-skeleton {
    transition:
      opacity 0.36s ease,
      visibility 0s linear 0.42s;

    &[data-ready="true"] {
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
    }
  }
}

@media (max-width: 68rem) {
  .deep-sea-dashboard-view {
    > .main {
      > .section.-operations {
        grid-template-columns: 1fr;
      }
    }
  }
}

@media (max-width: 44rem) {
  .deep-sea-dashboard-view {
    > .main {
      padding: var(--n-space-8);

      > .header.-page {
        align-items: start;
        flex-direction: column;
        gap: var(--n-space-7);
        block-size: auto;

        > .actions {
          flex-wrap: wrap;
        }
      }

      > .section.-metrics {
        grid-template-columns: repeat(2, 1fr);
      }

      > .section.-stations {
        > .header {
          align-items: start;
          flex-direction: column;
        }
      }
    }
  }
}
</style>

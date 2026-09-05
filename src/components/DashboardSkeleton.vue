<script setup lang="ts">
import { NSkeleton } from "./nagi";
</script>

<template>
  <div
    class="deep-sea-dashboard-skeleton"
    role="status"
    aria-label="Loading dashboard"
  >
    <header class="header">
      <div class="unit -copy">
        <n-skeleton class="-eyebrow n-skeleton" />
        <n-skeleton class="-heading n-skeleton" />
        <n-skeleton class="-lede n-skeleton" />
      </div>
      <div class="actions">
        <n-skeleton class="-action n-skeleton" />
        <n-skeleton class="-action -primary n-skeleton" />
      </div>
    </header>

    <section class="section -metrics">
      <article
        v-for="index in 4"
        :key="index"
        class="article"
      >
        <n-skeleton class="-metric-label n-skeleton" />
        <n-skeleton class="-number n-skeleton" />
        <n-skeleton class="-annotation n-skeleton" />
      </article>
    </section>

    <section class="section -operations">
      <article class="article -chart">
        <n-skeleton class="-short n-skeleton" />
        <n-skeleton class="-medium n-skeleton" />
        <div class="unit -choices">
          <n-skeleton
            v-for="index in 5"
            :key="index"
            class="-choice n-skeleton"
          />
        </div>
        <n-skeleton class="-reading n-skeleton" />
        <n-skeleton class="-chart n-skeleton" />
      </article>

      <aside class="aside">
        <div class="unit -heading">
          <div class="seg">
            <n-skeleton class="-eyebrow n-skeleton" />
            <n-skeleton class="-heading n-skeleton" />
          </div>
          <n-skeleton class="-pill n-skeleton" />
        </div>
        <n-skeleton class="-control n-skeleton" />
        <div class="unit -meters">
          <n-skeleton
            v-for="index in 3"
            :key="index"
            class="-bar n-skeleton"
          />
        </div>
        <n-skeleton class="-grid n-skeleton" />
      </aside>
    </section>

    <section class="section -stations">
      <div class="unit -heading">
        <div class="seg">
          <n-skeleton class="-heading n-skeleton" />
          <n-skeleton class="-medium n-skeleton" />
        </div>
        <n-skeleton class="-updated n-skeleton" />
      </div>
      <div class="unit -table-preview">
        <n-skeleton
          v-for="index in 6"
          :key="index"
          class="-row-preview n-skeleton"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.deep-sea-dashboard-skeleton {
  display: grid;
  gap: var(--n-space-7);
  inline-size: min(100%, 82rem);
  padding: var(--n-space-8);

  > .header {
    display: flex;
    gap: var(--n-space-8);
    align-items: end;
    justify-content: space-between;
    min-block-size: 5.125rem;

    > .unit.-copy {
      display: grid;
      gap: var(--n-space-4);
      inline-size: min(32rem, 60%);
    }

    > .actions {
      display: flex;
      gap: var(--n-space-4);
    }
  }

  > .section.-metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--n-space-5);

    > .article {
      box-sizing: border-box;
      display: grid;
      gap: var(--n-space-4);
      min-block-size: 6.0625rem;
      padding: var(--n-space-7) var(--n-space-8);
      border: var(--n-border-width-1) solid var(--nagi-color-border-muted);
      border-radius: var(--n-radius-3);
      background: var(--nagi-color-surface);
    }
  }

  > .section.-operations {
    display: grid;
    grid-template-columns: minmax(0, 1.55fr) minmax(17rem, 0.72fr);
    gap: var(--n-space-5);

    > .article,
    > .aside {
      box-sizing: border-box;
      min-block-size: 25.5625rem;
      padding: var(--n-space-7) var(--n-space-8) var(--n-space-8);
      border: var(--n-border-width-1) solid var(--nagi-color-border-muted);
      border-radius: var(--n-radius-3);
      background: var(--nagi-color-surface);

      > .unit.-meters,
      > .unit.-choices {
        display: grid;
        gap: var(--n-space-6);
      }

      > .unit.-choices {
        grid-template-columns: repeat(5, 1fr);
      }
    }

    > .article.-chart,
    > .aside {
      display: grid;
      gap: var(--n-space-6);
    }
  }

  > .section.-stations {
    display: grid;
    gap: var(--n-space-5);

    > .unit.-heading {
      display: flex;
      align-items: end;
      justify-content: space-between;
      min-block-size: 2.5rem;
    }

    > .unit.-table-preview {
      display: grid;
      overflow: hidden;
      border: var(--n-border-width-1) solid var(--nagi-color-border-muted);
      border-radius: var(--n-radius-3);
      background: var(--nagi-color-surface);

      > .n-skeleton.-row-preview {
        box-sizing: border-box;
        block-size: 3.2375rem;
        border-radius: 0;
        border-block-end: var(--n-border-width-1) solid var(--nagi-color-border-muted);
      }
    }
  }
}

@media (max-width: 68rem) {
  .deep-sea-dashboard-skeleton {
    > .section.-operations {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 44rem) {
  .deep-sea-dashboard-skeleton {
    padding: var(--n-space-8);

    > .header {
      align-items: start;
      flex-direction: column;
    }

    > .section.-metrics {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
</style>

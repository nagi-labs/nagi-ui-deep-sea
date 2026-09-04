<script setup lang="ts">
import type { SourceFile } from "../data/source-catalog";

defineProps<{
  source: SourceFile;
  siblings: readonly SourceFile[];
}>();

defineEmits<{
  select: [sourceId: string];
}>();
</script>

<template>
  <article class="deep-sea-source-browser">
    <header class="header">
      <div class="unit -heading">
        <span class="text">{{ source.ownerLabel }} · {{ source.language }}</span>
        <h2 class="title">{{ source.label }}</h2>
        <p class="p">{{ source.description }}</p>
        <code class="code">{{ source.path }}</code>
      </div>
      <a
        class="link"
        :href="source.githubUrl"
        target="_blank"
        rel="noreferrer"
      >
        Open on GitHub ↗
      </a>
    </header>

    <nav
      v-if="siblings.length > 1"
      class="nav"
      :aria-label="`Files in ${source.ownerLabel}`"
    >
      <ul class="list">
        <li
          v-for="sibling in siblings"
          :key="sibling.id"
          class="item"
        >
          <button
            class="button"
            type="button"
            :aria-pressed="sibling.id === source.id"
            @click="$emit('select', sibling.id)"
          >
            {{ sibling.label }}
          </button>
        </li>
      </ul>
    </nav>

    <pre
      class="pre"
      tabindex="0"
      :aria-label="`${source.label} source code`"
    ><code class="code">{{ source.code }}</code></pre>
  </article>
</template>

<style scoped>
.deep-sea-source-browser {
  --local-eyebrow-tracking: 0.06em;

  display: grid;
  min-inline-size: 0;
  overflow: hidden;
  border: var(--n-border-width-1) solid var(--nagi-color-border-muted);
  border-radius: var(--n-radius-3);
  background: var(--nagi-color-surface);

  > .header {
    display: flex;
    gap: var(--n-space-8);
    align-items: start;
    justify-content: space-between;
    padding: var(--n-space-7) var(--n-space-8);
    border-block-end: var(--n-border-width-1) solid var(--nagi-color-border-muted);

    > .unit.-heading {
      display: grid;
      min-inline-size: 0;

      > .text {
        color: var(--nagi-color-accent);
        font-size: var(--n-font-size-1);
        font-weight: 650;
        letter-spacing: var(--local-eyebrow-tracking);
        text-transform: uppercase;
      }

      > .title {
        margin: var(--n-space-2) 0 0;
        font-size: var(--n-font-size-6);
        font-weight: 620;
      }

      > .p {
        margin: var(--n-space-2) 0 0;
        color: var(--nagi-color-text-muted);
        font-size: var(--n-font-size-2);
      }

      > .code {
        margin-block-start: var(--n-space-4);
        overflow: hidden;
        color: var(--nagi-color-text-muted);
        font-size: var(--n-font-size-1);
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    > .link {
      flex: 0 0 auto;
      padding: var(--n-space-3) var(--n-space-5);
      border: var(--n-border-width-1) solid var(--nagi-color-border-muted);
      border-radius: var(--n-radius-2);
      color: var(--nagi-color-text);
      font-size: var(--n-font-size-2);
      font-weight: 600;
      text-decoration: none;

      &:hover {
        border-color: var(--nagi-color-border-strong);
        background: var(--nagi-color-surface-active);
      }
    }
  }

  > .nav {
    min-inline-size: 0;
    border-block-end: var(--n-border-width-1) solid var(--nagi-color-border-muted);
    background: var(--nagi-color-surface-raised);

    > .list {
      display: flex;
      margin: 0;
      padding: var(--n-space-3) var(--n-space-4);
      overflow-x: auto;
      list-style: none;

      > .item {
        flex: 0 0 auto;

        > .button {
          padding: var(--n-space-3) var(--n-space-5);
          border: 0;
          border-radius: var(--n-radius-2);
          background: transparent;
          color: var(--nagi-color-text-muted);
          font: inherit;
          font-size: var(--n-font-size-2);
          cursor: pointer;

          &[aria-pressed="true"] {
            background: var(--nagi-color-surface-active);
            color: var(--nagi-color-text);
          }

          &:focus-visible {
            outline: none;
            box-shadow: var(--nagi-shadow-focus);
          }
        }
      }
    }
  }

  > .pre {
    max-block-size: min(70svh, 48rem);
    margin: 0;
    padding: var(--n-space-8);
    overflow: auto;
    background: var(--deep-sea-depth);
    tab-size: 2;

    > .code {
      color: var(--nagi-color-text);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: var(--n-font-size-2);
      line-height: 1.65;
    }
  }
}

@media (max-width: 44rem) {
  .deep-sea-source-browser {
    > .header {
      flex-direction: column;

      > .link {
        align-self: stretch;
        text-align: center;
      }
    }

    > .pre {
      max-block-size: 60svh;
    }
  }
}
</style>

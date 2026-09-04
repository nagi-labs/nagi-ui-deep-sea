<script setup lang="ts">
import { AnimatePresence, motion } from "motion-v";
import { RouterLink, RouterView } from "vue-router";

import { NSidebar, NSidebarLink, NSidebarSection } from "./components/nagi";

const navigation = [
  { label: "Overview", to: "/" },
  { label: "Owned source", to: "/components" },
] as const;

const appVersion = __DEEP_SEA_VERSION__;
</script>

<template>
  <div class="deep-sea-app">
    <n-sidebar
      class="n-sidebar"
      label="Deep Sea operations"
    >
      <router-link
        class="n-sidebar-content"
        to="/"
        aria-label="Deep Sea command deck"
      >
        <span
          class="icon"
          aria-hidden="true"
          >DS</span
        >
        <span class="value">
          <strong class="strong">Deep Sea</strong>
          <small class="note">Monitoring · v{{ appVersion }}</small>
        </span>
      </router-link>

      <n-sidebar-section label="Workspace">
        <router-link
          v-for="item in navigation"
          :key="item.to"
          v-slot="{ href, navigate, isExactActive }"
          :to="item.to"
          custom
        >
          <n-sidebar-link
            :href="href"
            :current="isExactActive"
            :navigate="navigate"
          >
            {{ item.label }}
          </n-sidebar-link>
        </router-link>
      </n-sidebar-section>

      <template #footer>
        <div class="n-sidebar-footer">
          <span
            class="icon"
            aria-hidden="true"
          />
          <span class="value">
            <strong class="strong">Network online</strong>
            <small class="note">18 stations reporting</small>
          </span>
        </div>
      </template>
    </n-sidebar>

    <div class="unit -frame">
      <header class="header">
        <router-link
          class="link -identity"
          to="/"
        >
          <span
            class="icon"
            aria-hidden="true"
            >DS</span
          >
          <span class="value">
            <strong class="strong">Deep Sea</strong>
            <small class="note">v{{ appVersion }}</small>
          </span>
        </router-link>
        <nav
          class="nav"
          aria-label="Primary navigation"
        >
          <router-link
            v-for="item in navigation"
            :key="item.to"
            class="link"
            :to="item.to"
          >
            {{ item.label }}
          </router-link>
        </nav>
      </header>

      <router-view v-slot="{ Component, route }">
        <AnimatePresence
          mode="wait"
          :initial="false"
        >
          <motion.div
            :key="route.path"
            class="seg -route"
            :initial="{ opacity: 0, x: 8 }"
            :animate="{ opacity: 1, x: 0 }"
            :exit="{ opacity: 0, x: -8 }"
            :transition="{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }"
          >
            <component :is="Component" />
          </motion.div>
        </AnimatePresence>
      </router-view>
    </div>
  </div>
</template>

<style scoped>
.deep-sea-app {
  --local-brand-tracking: 0.04em;
  --local-sidebar-width: 13.5rem;
  --local-brand-size: 1.75rem;
  --local-meta-tracking: 0.08em;

  display: grid;
  grid-template-columns: var(--local-sidebar-width) minmax(0, 1fr);
  min-block-size: 100svb;

  > .n-sidebar {
    position: sticky;
    inset-block-start: 0;
    z-index: var(--n-z-sticky);
    block-size: 100svb;
    padding: var(--n-space-8) var(--n-space-6);
    border-color: var(--nagi-color-border-muted);
    background: var(--deep-sea-depth);

    .n-sidebar-content {
      display: flex;
      gap: var(--n-space-5);
      align-items: center;
      color: var(--nagi-color-text);
      text-decoration: none;

      > .icon {
        display: grid;
        flex: 0 0 auto;
        place-items: center;
        inline-size: var(--local-brand-size);
        block-size: var(--local-brand-size);
        border: var(--n-border-width-1) solid var(--nagi-color-border-strong);
        border-radius: var(--n-radius-2);
        background: var(--nagi-color-surface-raised);
        color: var(--nagi-color-accent);
        font-size: var(--n-font-size-1);
        font-weight: 750;
        letter-spacing: var(--local-brand-tracking);
      }

      > .value {
        display: grid;
        line-height: 1.15;

        > .strong {
          font-size: var(--n-font-size-4);
          font-weight: 650;
          letter-spacing: 0;
        }

        > .note {
          margin-block-start: var(--n-space-1);
          color: var(--nagi-color-text-muted);
          font-size: var(--n-font-size-1);
          letter-spacing: var(--local-meta-tracking);
          text-transform: uppercase;
        }
      }
    }

    .n-sidebar-footer {
      display: flex;
      gap: var(--n-space-4);
      align-items: center;
      padding: var(--n-space-5);
      border-block-start: var(--n-border-width-1) solid var(--nagi-color-border-muted);

      > .icon {
        inline-size: var(--n-space-3);
        block-size: var(--n-space-3);
        border-radius: 50%;
        background: var(--nagi-color-success);
      }

      > .value {
        display: grid;

        > .strong {
          color: var(--nagi-color-text);
          font-size: var(--n-font-size-2);
          font-weight: 600;
        }

        > .note {
          color: var(--nagi-color-text-muted);
          font-size: var(--n-font-size-1);
        }
      }
    }
  }

  > .unit.-frame {
    min-inline-size: 0;

    > .header {
      display: none;
    }

    > .seg.-route {
      display: grid;
      min-inline-size: 0;
      justify-items: center;
    }
  }
}

@media (max-width: 56rem) {
  .deep-sea-app {
    grid-template-columns: 1fr;

    > .n-sidebar {
      display: none;
    }

    > .unit.-frame {
      > .header {
        position: sticky;
        inset-block-start: 0;
        z-index: var(--n-z-sticky);
        display: flex;
        gap: var(--n-space-8);
        align-items: center;
        justify-content: space-between;
        padding: var(--n-space-5) var(--n-space-8);
        border-block-end: var(--n-border-width-1) solid var(--nagi-color-border-muted);
        background: var(--deep-sea-mobile-surface);
        backdrop-filter: blur(12px);

        > .link.-identity {
          display: flex;
          gap: var(--n-space-5);
          align-items: center;
          color: var(--nagi-color-text);
          text-decoration: none;

          > .icon {
            display: grid;
            place-items: center;
            inline-size: var(--local-brand-size);
            block-size: var(--local-brand-size);
            border: var(--n-border-width-1) solid var(--nagi-color-border-strong);
            border-radius: var(--n-radius-2);
            background: var(--nagi-color-surface-raised);
            color: var(--nagi-color-accent);
            font-size: var(--n-font-size-1);
            font-weight: 750;
          }
        }

        > .nav {
          display: flex;
          gap: var(--n-space-2);

          > .link {
            padding: var(--n-space-3) var(--n-space-5);
            border-radius: var(--n-radius-2);
            color: var(--nagi-color-text-muted);
            font-size: var(--n-font-size-2);
            text-decoration: none;

            &[aria-current="page"] {
              background: var(--nagi-color-surface-raised);
              color: var(--nagi-color-text);
            }
          }
        }
      }
    }
  }
}
</style>

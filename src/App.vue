<script setup lang="ts">
import { AnimatePresence, motion, useReducedMotion } from "motion-v";
import { RouterLink, RouterView } from "vue-router";

import { NSidebar, NSidebarLink, NSidebarSection } from "./components/nagi";

const navigation = [
  { label: "Overview", to: "/" },
  { label: "Owned source", to: "/components" },
] as const;

const reduceMotion = useReducedMotion();
</script>

<template>
  <div class="deep-sea-app">
    <n-sidebar
      class="app-sidebar"
      label="Deep Sea operations"
    >
      <a
        class="identity"
        href="#/"
        aria-label="Deep Sea command deck"
      >
        <span
          class="mark"
          aria-hidden="true"
          >DS</span
        >
        <span class="wordmark">
          <strong>Deep Sea</strong>
          <small>Monitoring</small>
        </span>
      </a>

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
            <motion.span
              v-if="isExactActive"
              class="nav-indicator"
              layout-id="active-navigation"
              :transition="
                reduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', visualDuration: 0.28, bounce: 0.1 }
              "
              aria-hidden="true"
            />
            {{ item.label }}
          </n-sidebar-link>
        </router-link>
      </n-sidebar-section>

      <template #footer>
        <div class="system-status">
          <span
            class="signal"
            aria-hidden="true"
          />
          <span>
            <strong>Network online</strong>
            <small>18 stations reporting</small>
          </span>
        </div>
      </template>
    </n-sidebar>

    <div class="app-frame">
      <header class="mobile-header">
        <a
          class="identity"
          href="#/"
        >
          <span
            class="mark"
            aria-hidden="true"
            >DS</span
          >
          <span class="wordmark"><strong>Deep Sea</strong></span>
        </a>
        <nav aria-label="Primary navigation">
          <router-link
            v-for="item in navigation"
            :key="item.to"
            :to="item.to"
          >
            {{ item.label }}
          </router-link>
        </nav>
      </header>

      <router-view v-slot="{ Component, route }">
        <AnimatePresence mode="wait">
          <motion.div
            :key="route.path"
            class="route-view"
            :initial="reduceMotion ? undefined : { opacity: 0, x: 8 }"
            :animate="{ opacity: 1, x: 0 }"
            :exit="{ opacity: 0, x: -8 }"
            :transition="{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }"
          >
            <component :is="Component" />
          </motion.div>
        </AnimatePresence>
      </router-view>
    </div>
  </div>
</template>

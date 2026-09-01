<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";

import { NSidebar, NSidebarLink, NSidebarSection } from "./components/nagi";

const navigation = [
  { label: "Command deck", to: "/" },
  { label: "Owned source", to: "/components" },
] as const;
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
        >
          <span class="pulse" />
        </span>
        <span class="wordmark">
          <strong>Deep Sea</strong>
          <small>Abyssal operations</small>
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
            <strong>Array connected</strong>
            <small>18 beacons reporting</small>
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
          >
            <span class="pulse" />
          </span>
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

      <router-view />
    </div>
  </div>
</template>

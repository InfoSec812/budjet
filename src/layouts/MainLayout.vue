<template>
  <q-layout view="lHh Lpr lFf" style="height: 100%;">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Quasar App
        </q-toolbar-title>

        <q-btn-dropdown 
          dropdown-icon="account_circle"
          no-icon-animation flat dense
          :label="currentUser?.name"
          align="right"
          style="width: fit-content;"
          >
          <q-list>
            <q-item clickable>
              <q-item-section>Profile</q-item-section>
              <q-item-section avatar><q-icon name="person_outline" size="1.2rem" style="padding-left: 0.3rem" /></q-item-section>
            </q-item>
            <q-item clickable>
              <q-item-section>Logout</q-item-section>
              <q-item-section avatar><q-icon name="logout" size="1.2rem" style="padding-left: 0.3rem" /></q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      bordered
    >
      <q-list>
        <q-item clickable to="/" >
          <q-item-section avatar>
            <q-icon name="grid_on" color="black" />
          </q-item-section>
          <q-item-section style="color: black;">Bills</q-item-section>
        </q-item>
        <q-item clickable to="/income/list" >
          <q-item-section avatar>
            <q-icon name="money" color="black" />
          </q-item-section>
          <q-item-section style="color: black;">Income</q-item-section>
        </q-item>
        <q-item clickable to="/cashflow" >
          <q-item-section avatar>
            <q-icon name="air" color="black" />
          </q-item-section>
          <q-item-section style="color: black;">Cash Flow</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container style="height: 100%;">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">

import { sysStore } from 'src/stores/SystemStore';
import { defineComponent, ref, computed } from 'vue';

export default defineComponent({
  name: 'MainLayout',

  async setup() {
    const sys = sysStore();
    await sys.getCurrentUser();
    const leftDrawerOpen = ref(false);

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };

    return {
      leftDrawerOpen,
      toggleLeftDrawer,
      currentUser: computed(() => sys.currentUser)
    };
  },
});
</script>

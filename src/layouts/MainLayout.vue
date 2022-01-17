<template>
  <QLayout view="lHh Lpr lFf" style="height: 100%;">
    <QHeader elevated>
      <QToolbar>
        <QBtn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <QToolbarTitle class="title-area">
          <img src="/BudJet.svg" class="title-logo" /><b>BudJet</b> <i>Help Your Money Fly Further</i>
        </QToolbarTitle>

        <QBtnDropdown 
          dropdown-icon="account_circle"
          no-icon-animation flat dense
          :label="currentUser?.name"
          align="right"
          style="width: fit-content;"
          >
          <QList>
            <QItem clickable>
              <QItemSection>Profile</QItemSection>
              <QItemSection avatar><QIcon name="person_outline" size="1.2rem" style="padding-left: 0.3rem" /></QItemSection>
            </QItem>
            <QItem clickable>
              <QItemSection>Logout</QItemSection>
              <QItemSection avatar><QIcon name="logout" size="1.2rem" style="padding-left: 0.3rem" /></QItemSection>
            </QItem>
          </QList>
        </QBtnDropdown>
      </QToolbar>
    </QHeader>

    <QDrawer
      v-model="leftDrawerOpen"
      bordered
    >
      <QList>
        <QItem>
          <QItemSection style="margin: auto;">
            <img class="drawer-logo" src="/BudJet.svg" />
          </QItemSection>
        </QItem>
        <QItem clickable to="/" >
          <QItemSection avatar>
            <QIcon name="grid_on" color="black" />
          </QItemSection>
          <QItemSection style="color: black;">Bills</QItemSection>
        </QItem>
        <QItem clickable to="/income/list" >
          <QItemSection avatar>
            <QIcon name="money" color="black" />
          </QItemSection>
          <QItemSection style="color: black;">Income</QItemSection>
        </QItem>
        <QItem clickable to="/cashflow" >
          <QItemSection avatar>
            <QIcon name="air" color="black" />
          </QItemSection>
          <QItemSection style="color: black;">Cash Flow</QItemSection>
        </QItem>
      </QList>
    </QDrawer>

    <QPageContainer style="height: 100%;">
      <router-view />
    </QPageContainer>
  </QLayout>
</template>

<script lang="ts">
import { unifiedStore } from '../stores/UnifiedStore';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'MainLayout',

  async setup() {
    const api = unifiedStore();
    await api.getCurrentUser();
    const leftDrawerOpen = ref(false);

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };

    return {
      leftDrawerOpen,
      toggleLeftDrawer,
      currentUser: api.currentUser
    };
  },
});
</script>

<style lang="sass" scoped>
.title-area
  display: flex
  flex
  justify-content: flex-start center
  align-items: center

.title-logo
  height: 2.7rem
  padding-right: 0.5rem

.drawer-logo
  width: 17rem

i
  font-size: 0.8rem
  padding-left: 0.8rem
</style>
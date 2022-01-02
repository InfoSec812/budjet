import { defineStore } from 'pinia';
import { User } from 'src/sdk';

interface SysState {
  user?: User
}

export const initState = (): SysState => ({

});

export const sysStore = defineStore('system', {
  state: initState,
  getters: {
    currentUser: (state) => state.user
  },
  actions: {
    async getCurrentUser(): Promise<void> {
      try {
        const { data } = await this.systemApi.getCurrentUser();
        this.setCurrentUser(data);
      } catch (err) {
        console.log(`Error: ${JSON.stringify(err, null, 4)}`)
        this.q.notify({message: 'Failed to get current user. Are you logged in?', type: 'warning'})
      }
    },
    setCurrentUser(current: User) {
      this.user = current;
    }
  }
});
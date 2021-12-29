import { PiniaPluginContext, StateTree, DefineStoreOptions } from 'pinia';
import { BillsApi, Configuration, SystemApi } from 'src/sdk';

// Extend pinia with new attributes which allow us to attach our API Clients
declare module 'pinia' {
  export interface PiniaCustomProperties<Id, S, G, A> {
    id: Id
    state?: () => S
    getters?: G
    actions?: A
    systemApi: SystemApi
    billsApi: BillsApi
  }
  export interface DefineStoreOptionsInPlugin<Id extends string, S extends StateTree, G, A> extends Omit<DefineStoreOptions<Id, S, G, A>, 'id' | 'actions'> {
    apiConfig: Configuration
  }
}

export const APIPlugin = ({ options, store }: PiniaPluginContext): void => {
  const { apiConfig } = options;

  if (apiConfig) {
    store.systemApi = new SystemApi(apiConfig);
    store.billsApi = new BillsApi(apiConfig);
  } else {
    store.systemApi = new SystemApi();
    store.billsApi = new BillsApi();
  }
};

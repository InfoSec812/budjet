import { PiniaPluginContext, StateTree, DefineStoreOptions } from 'pinia';
import { LoadingBar, QVueGlobals, useQuasar } from 'quasar';
import {  BudJetApi, Configuration } from '../sdk';

// Extend pinia with new attributes which allow us to attach our API Clients
declare module 'pinia' {
  export interface PiniaCustomProperties<Id, S, G, A> {
    id: Id
    state?: () => S
    getters?: G
    actions?: A
    q: QVueGlobals
    api: BudJetApi
    progress: LoadingBar
  }
  export interface DefineStoreOptionsInPlugin<Id extends string, S extends StateTree, G, A> extends Omit<DefineStoreOptions<Id, S, G, A>, 'id' | 'actions'> {
    apiConfig?: Configuration
  }
}

export const APIPlugin = ({ options, store }: PiniaPluginContext): void => {
  const { apiConfig } = options;
  store.q = useQuasar();
  store.api = new BudJetApi(apiConfig);
};

import { defineStore } from 'pinia';
import { Income, NewIncome } from 'src/sdk';
import { AxiosRequestConfig } from 'axios';
import { LoadingBar } from 'quasar';

interface IncomeState {
  incomes: Income[]
}

export const initState = (): IncomeState => ({
  incomes: [],
});

// eslint-disable-next-line no-unused-vars
const progressInit = (progressBar: LoadingBar): AxiosRequestConfig => {
  const axiosConfig = {} as AxiosRequestConfig;
  
  progressBar.increment(10);
  axiosConfig.onUploadProgress = (progressEvent: ProgressEvent) => progressBar.increment(progressEvent.loaded * 80);
  progressBar.increment(20);
  return axiosConfig;
};

export const incomeStore = defineStore('Incomes', {
  state: initState,

  getters: {
    incomesList: (state) => state.incomes,
  },

  actions: {
    async loadIncomes(
                  ): Promise<void> {
      const axiosConfig = progressInit(this.q.loadingBar);
      try {
        const { data } = await this.incomeApi.getIncomeSources(axiosConfig);
        this.updateIncomes(data);
        stop();
      } catch (err) {
        this.q.notify({message: 'An error occurred loading Income items from the API', type: 'negative'});
        console.log(`Error: ${JSON.stringify(err)}`);
      }
      this.q.loadingBar.increment(100);
    },
    async loadIncome(
                  id: string,
                ): Promise<Income> {
      const axiosConfig = progressInit(this.q.loadingBar);
      try {
        const { data } = await this.incomeApi.getIncome(id, axiosConfig);
        this.q.loadingBar.increment(100);
        this.addIncome(data);
        return Promise.resolve(data);
      } catch (err) {
        stop();
        this.q.notify({message: 'An error occurred loading Income items from the API', type: 'negative'});
        return Promise.reject(err);
      }
    },
    updateIncomes(Incomes: Income[]): void {
      this.incomes = Incomes;
    },
    updateIncome(income: Income): void {
      const incomeIndex = this.incomes.findIndex((item) => item.id === income.id);
      const updatedIncome = {
        ...this.incomes[incomeIndex],
        ...income,
      };
      this.incomes[incomeIndex] = updatedIncome;
    },
    async saveIncome(
                  income: Income,
                ): Promise<void> {
      if (income?.id === undefined || income?.id === null) {
        this.q.notify({message: 'The ID string of the Income must be set', type: 'negative'});
        return Promise.reject('The ID string of the Income must be set');
      }
      const axiosConfig = progressInit(this.q.loadingBar);
      try {
        await this.incomeApi.updateIncome(income.id, income, axiosConfig);
        this.q.loadingBar.increment(100);
        this.updateIncome(income);
        return Promise.resolve();
      } catch (err) {
        stop();
        this.q.notify({message: 'An error occurred saving the Income updates', type: 'negative'});
        return Promise.reject(err);
      }
    },
    async newIncome(
                    income: NewIncome,
                  ): Promise<void> {
      const axiosConfig = progressInit(this.q.loadingBar);
      try {
        const { data } = await this.incomeApi.addIncomeSource(income, axiosConfig);
        this.q.loadingBar.increment(100);
        this.addIncome(data);
        return Promise.resolve();
      } catch (err) {
        stop();
        this.q.notify({message: 'An error occurred saving the Income updates', type: 'negative'});
        return Promise.reject(err);
      }
    },
    addIncome(income: Income) {
      this.incomes.push(income);
    },
    async getIncomeById(id: string): Promise<Income | undefined> {
      const retVal = this.incomes.find(income => income.id === id);

      if (retVal === undefined || retVal === null) {
        try {
          const axiosConfig = progressInit(this.q.loadingBar);
          const { data } = await this.incomeApi.getIncome(id, axiosConfig);
          this.q.loadingBar.increment(100);
          this.addIncome(data);
          return Promise.resolve(data);
        } catch(err) {
          this.q.notify({message: `Unable to load Income with ID: ${id}`, type: 'negative'});
        }
      }

      return retVal;
    }
  },
});

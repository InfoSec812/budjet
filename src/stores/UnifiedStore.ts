import { defineStore } from 'pinia';
import { Bill, Income, NewIncome, User, NewBill, Month } from 'src/sdk';
import { LoadingBar } from 'quasar';
import { AxiosRequestConfig } from 'axios';

interface State {
  bills: Bill[]
  user?: User
  incomes: Income[]
}

export const initState = (): State => ({
  bills: [],
  incomes: [],
});

// eslint-disable-next-line no-unused-vars
const progressInit = (progress: LoadingBar): AxiosRequestConfig => {
  const axiosConfig = {} as AxiosRequestConfig;

  progress.increment(10);
  axiosConfig.onUploadProgress = (progressEvent: ProgressEvent) => progress.increment(progressEvent.loaded * 80);
  progress.increment(20);
  return axiosConfig;
};

export const unifiedStore = defineStore('unified', {
  state: initState,
  getters: {
    billsList: (state: State) => state.bills,
    currentUser: (state: State) => state.user,
    incomesList: (state: State) => state.incomes,
  },
  actions: {
    async getCurrentUser(): Promise<void> {
      try {
        const { data } = await this.api.getCurrentUser();
        this.setCurrentUser(data);
      } catch (err) {
        console.log(`Error: ${JSON.stringify(err, null, 4)}`)
        this.q.notify({message: 'Failed to get current user. Are you logged in?', type: 'warning'})
      }
    },
    setCurrentUser(current: User) {
      this.user = current;
    },
    async loadIncomes(
      startDate?: string,
      endDate?: string
                  ): Promise<void> {
      const axiosConfig = progressInit(this.q.loadingBar);
      try {
        const { data } = await this.api.getIncomeSources(startDate, endDate, axiosConfig);
        this.updateIncomes(data);
      } catch (err) {
        this.q.notify({message: 'An error occurred loading Income items from the API', type: 'negative'});
        console.log(`Error: ${JSON.stringify(err)}`);
      }
      this.q.loadingBar.increment(100);
      stop();
    },
    async loadIncome(
                  id: string,
                ): Promise<Income> {
      const axiosConfig = progressInit(this.q.loadingBar);
      try {
        const { data } = await this.api.getIncome(id, axiosConfig);
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
        await this.api.updateIncome(income.id, income, axiosConfig);
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
        const { data } = await this.api.addIncomeSource(income, axiosConfig);
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
          const { data } = await this.api.getIncome(id, axiosConfig);
          this.q.loadingBar.increment(100);
          this.addIncome(data);
          return Promise.resolve(data);
        } catch(err) {
          this.q.notify({message: `Unable to load Income with ID: ${id}`, type: 'negative'});
        }
      }

      return retVal;
    },
    async loadBills(
                  ): Promise<void> {
      const axiosConfig = progressInit(this.q.loadingBar);
      try {
        const { data } = await this.api.getAllBills(undefined, undefined, axiosConfig);
        this.updateBills(data);
        stop();
      } catch (err) {
        this.q.notify({message: 'An error occurred loading Bill items from the API', type: 'negative'});
        console.log(`Error: ${JSON.stringify(err)}`);
      }
      this.q.loadingBar.increment(100);
    },
    async loadBill(
                  id: string,
                ): Promise<Bill> {
      const axiosConfig = progressInit(this.q.loadingBar);
      try {
        const { data } = await this.api.getBill(id, axiosConfig);
        this.q.loadingBar.increment(100);
        this.addBill(data);
        return Promise.resolve(data);
      } catch (err) {
        stop();
        this.q.notify({message: 'An error occurred loading Bill items from the API', type: 'negative'});
        return Promise.reject(err);
      }
    },
    updateBills(bills: Bill[]): void {
      this.bills = bills;
    },
    updateBill(bill: Bill): void {
      const billIndex = this.bills.findIndex((item) => item.id === bill.id);
      const updatedBill = {
        ...this.bills[billIndex],
        ...bill,
      };
      this.bills[billIndex] = updatedBill;
    },
    async saveBill(
                  bill: Bill,
                ): Promise<void> {
      if (bill?.id === undefined || bill?.id === null) {
        this.q.notify({message: 'The ID string of the bill must be set', type: 'negative'});
        return Promise.reject('The ID string of the bill must be set');
      }
      const axiosConfig = progressInit(this.q.loadingBar);
      try {
        await this.api.updateBill(bill.id, bill, axiosConfig);
        this.q.loadingBar.increment(100);
        this.updateBill(bill);
        return Promise.resolve();
      } catch (err) {
        stop();
        this.q.notify({message: 'An error occurred saving the bill updates', type: 'negative'});
        return Promise.reject(err);
      }
    },
    async newBill(
                    bill: NewBill,
                  ): Promise<void> {
      const axiosConfig = progressInit(this.q.loadingBar);
      try {
        const { data } = await this.api.addBill(bill, axiosConfig);
        this.q.loadingBar.increment(100);
        this.addBill(data);
        return Promise.resolve();
      } catch (err) {
        stop();
        this.q.notify({message: 'An error occurred saving the bill updates', type: 'negative'});
        return Promise.reject(err);
      }
    },
    addBill(bill: Bill) {
      this.bills.push(bill);
    },
    async changePaidStatus(
                          id: string,
                          month: Month,
                        ) {
      const axiosConfig = progressInit(this.q.loadingBar);
      try {
        const { data } = await this.api.updatePaidStatus(id, month.year,
          month.month, month.paid, axiosConfig);
        this.q.loadingBar.increment(100);
        this.updateMonth(id, data);
      } catch (err) {
        stop();
        this.q.notify({message: 'An error occurred saving the bill updates', type: 'negative'});
      }
    },
    updateMonth(id: string, month: Month): void {
      const billIdx = this.bills.findIndex((b) => b.id === id);
      if (billIdx !== undefined && billIdx >= 0) {
        const bill = this.bills[billIdx] as Bill;
        const monthIdx = bill.months?.findIndex((m) => (
          m.year === month.year
          && m.month === month.month
          && m.day === month.day
        ));
        if (
          monthIdx !== undefined
          && monthIdx >= 0
          && bill.months !== undefined
          && bill.months[monthIdx] !== undefined
        ) {
          bill.months[monthIdx] = month;
          this.bills[billIdx] = bill;
        }
      }
    },
    async getBillById(id: string): Promise<Bill | undefined> {
      const retVal = this.bills.find(bill => bill.id === id);

      if (retVal === undefined || retVal === null) {
        try {
          const axiosConfig = progressInit(this.q.loadingBar);
          const { data } = await this.api.getBill(id, axiosConfig);
          this.q.loadingBar.increment(100);
          this.addBill(data);
          return Promise.resolve(data);
        } catch(err) {
          this.q.notify({message: `Unable to load bill with ID: ${id}`, type: 'negative'});
        }
      }

      return retVal;
    }
  }
});

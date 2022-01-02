import { defineStore } from 'pinia';
import { Bill, Month, NewBill } from 'src/sdk';
import { AxiosRequestConfig } from 'axios';
import { LoadingBar } from 'quasar';

interface BillState {
  bills: Bill[]
}

export const initState = (): BillState => ({
  bills: [],
});

// eslint-disable-next-line no-unused-vars
const progressInit = (progressBar: LoadingBar): AxiosRequestConfig => {
  const axiosConfig = {} as AxiosRequestConfig;
  
  progressBar.increment(10);
  axiosConfig.onUploadProgress = (progressEvent: ProgressEvent) => progressBar.increment(progressEvent.loaded * 80);
  progressBar.increment(20);
  return axiosConfig;
};

export const billStore = defineStore('bills', {
  state: initState,

  getters: {
    billsList: (state) => state.bills,
  },

  actions: {
    async loadBills(
                  ): Promise<void> {
      const axiosConfig = progressInit(this.q.loadingBar);
      try {
        const { data } = await this.billsApi.getAllBills(undefined, undefined, axiosConfig);
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
        const { data } = await this.billsApi.getBill(id, axiosConfig);
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
        await this.billsApi.updateBill(bill.id, bill, axiosConfig);
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
        const { data } = await this.billsApi.addBill(bill, axiosConfig);
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
        const { data } = await this.billsApi.updatePaidStatus(id, month.year,
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
          const { data } = await this.billsApi.getBill(id, axiosConfig);
          this.q.loadingBar.increment(100);
          this.addBill(data);
          return Promise.resolve(data);
        } catch(err) {
          this.q.notify({message: `Unable to load bill with ID: ${id}`, type: 'negative'});
        }
      }

      return retVal;
    }
  },
});

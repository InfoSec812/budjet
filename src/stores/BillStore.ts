import { defineStore } from 'pinia';
import { Bill, Month } from 'src/sdk';
import { AxiosRequestConfig } from 'axios';

interface BillState {
  bills: Bill[]
}

export const initState = (): BillState => ({
  bills: [],
});

// eslint-disable-next-line no-unused-vars
const progressInit = (increment: (arg0?: number) => void): AxiosRequestConfig => {
  increment(10);
  const axiosConfig = {
    onUploadProgress: (progressEvent: ProgressEvent) => {
      increment(progressEvent.loaded * 80);
    },
  };
  increment(20);
  return axiosConfig;
};

export const billStore = defineStore('bills', {
  state: initState,

  getters: {
    billsList: (state) => state.bills,
  },

  actions: {
    async loadBills(
                    notify: (message: string, type: string) => void,
                    increment: (arg0?: number) => void,
                    stop: () => void,
                  ): Promise<void> {
      const axiosConfig = progressInit(increment);
      try {
        const { data } = await this.billsApi.getAllBills('', '', axiosConfig);
        this.updateBills(data);
        stop();
      } catch (err) {
        notify('An error occurred loading Bill items from the API', 'negative');
      }
      increment(100);
    },
    async loadBill(
                  notify: (message: string, type: string) => void,
                  increment: (arg0?: number) => void,
                  stop: () => void,
                  id: string,
                ): Promise<Bill> {
      const axiosConfig = progressInit(increment);
      try {
        const { data } = await this.billsApi.getBill(id, axiosConfig);
        increment(100);
        this.addBill(data);
        return Promise.resolve(data);
      } catch (err) {
        stop();
        notify('An error occurred loading Bill items from the API', 'negative');
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
                  notify: (message: string, type: string) => void,
                  increment: (arg0?: number) => void,
                  stop: () => void,
                  bill: Bill,
                ): Promise<void> {
      if (bill?.id === undefined || bill?.id === null) {
        notify('The ID string of the bill must be set', 'negative');
        return Promise.reject('The ID string of the bill must be set');
      }
      const axiosConfig = progressInit(increment);
      try {
        const { data } = await this.billsApi.updateBill(bill.id, bill, axiosConfig);
        increment(100);
        this.updateBill(data);
        return Promise.resolve();
      } catch (err) {
        stop();
        notify('An error occurred saving the bill updates', 'negative');
        return Promise.reject(err);
      }
    },
    addBill(bill: Bill) {
      this.bills.push(bill);
    },
    async changePaidStatus(
                          notify: (message: string, type: string) => void,
                          increment: (arg0?: number) => void,
                          stop: () => void,
                          id: string,
                          month: Month,
                        ) {
      const axiosConfig = progressInit(increment);
      try {
        const { data } = await this.billsApi.updatePaidStatus(id, month.year,
          month.month, month.paid, axiosConfig);
        increment(100);
        this.updateMonth(id, data);
      } catch (err) {
        stop();
        notify('An error occurred saving the bill updates', 'negative');
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
  },
});

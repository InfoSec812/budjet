<template>
  <q-page padding>
    <div class="flex q-md-pa padding">
      <q-input
        v-model.number="startingBalance"
        label="Starting Balance"
        :prefix="currencySymbol()"
      />
      <q-input v-model="startDate" type="date" label="Start Date" />
      <q-input v-model="endDate" type="date" label="End Date" />
    </div>
    <line-chart :chart-data="cashflow" />
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import LineChart from 'src/components/LineChart';
import { date } from 'quasar';
import { CashflowApi } from 'src/sdk';

const { addToDate } = date;

export default defineComponent({
  name: 'CashFlow',
  components: {
    LineChart
  },
  async setup(ctx) {
    const cashFlowAPI = new CashflowApi();

    const startingBalance = ref(0.0);

    const startDate = ref(addToDate(new Date, { months: -1 }));
    const endDate = ref(addToDate(new Date, { months: 1 }));

    const currency = ref('USD');

    const currencySymbol = () => {
      switch (currency.value) {
        case 'USD':
          return '$';
        case 'GBP':
          return '£';
        default:
          return '€';
      }
    };

    return {
      startingBalance,
      startDate,
      endDate,
      currency,
      currencySymbol,
    };
  },
});
</script>

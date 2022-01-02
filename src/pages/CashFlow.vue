<template>
  <q-page padding>
    <div class="flex q-md-pa padding">
      <q-input
        v-model.number="startingBalance"
        label="Starting Balance"
        :prefix="currencySymbol()"
        @change="debounceInput()"
      />
      <q-input v-model="startDate" type="date" label="Start Date" @change="debounceInput()" />
      <q-input v-model="endDate" type="date" label="End Date" @change="debounceInput()" />
      <q-btn icon="refresh" @click="updateData" flat dense/>
    </div>
    <line-chart :chart-data="cashflow" />
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import LineChart from 'src/components/LineChart';
import { date, debounce, useQuasar } from 'quasar';
import { CashflowApi } from 'src/sdk';

const { addToDate, formatDate } = date;

export default defineComponent({
  name: 'CashFlow',
  components: {
    LineChart
  },
  setup() {
    const $q = useQuasar();
    const api = new CashflowApi();

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

    interface DataSet {
      label: string
      backgroundColor: string
      data: number[]
    }

    const chartData = ref({
      labels: [] as string[],
      datasets: [
        {
          label: 'Cash Flow',
          backgroundColor: 'rgb(230, 0, 0)',
          data: [] as number[]
        } as DataSet
      ]
    });

    const updateData = async () => {
      try {
        const { data } = await api.getCashFlow(formatDate(startDate.value), formatDate(endDate.value), startingBalance.value);
        data.forEach((day) => {
          chartData.value.labels.push(day.date);
          chartData.value.datasets[0].data.push(day.balance);
        });
      } catch(err) {
        $q.notify({ message: 'Error loading cash flow data', type: 'negative' })
      }
    }

    onMounted(updateData);

    const debounceInput = debounce(updateData, 5000);

    return {
      startingBalance,
      startDate,
      endDate,
      currency,
      currencySymbol,
      debounceInput,
      updateData,
    };
  },
});
</script>

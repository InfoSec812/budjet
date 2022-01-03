<template>
  <q-page padding>
    <div class="flex q-md-pa padding">
      <q-input
        v-model.number="startingBalance"
        label="Starting Balance"
        :prefix="currencySymbol()"
        style="padding-right: 1.2rem"
        @change="debounceInput"
      />
      <q-input
        v-model="startDate"
        type="date"
        label="Start Date"
        style="padding-right: 1.2rem"
        @change="debounceInput"
      />
      <q-input
        v-model="endDate"
        type="date"
        label="End Date"
        style="padding-right: 1.2rem"
        @change="debounceInput"
      />
      <q-btn icon="refresh" @click="updateData" flat dense />
    </div>
    <highcharts :options="chartOptions"/>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from 'vue';
import { date, useQuasar, debounce } from 'quasar';

import { Chart, ChartOptions } from 'highcharts-vue';
import  Highcharts, { PointOptionsObject } from 'highcharts';
import { CashflowApi } from 'src/sdk';

const { addToDate, formatDate } = date;

export default defineComponent({
  components: {
    highcharts: Chart
  },
  async setup() {
    const $q = useQuasar();
    const api = new CashflowApi();
    const startingBalance = ref(0.0);

    const startDate = ref(
      formatDate(addToDate(new Date(), { months: -1 }), 'YYYY-MM-DD')
    );
    const endDate = ref(formatDate(addToDate(new Date(), { months: 1 }), 'YYYY-MM-DD'));

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

    const chartOptions = ref({
      chart: {
        animation: false,
      },
      xAxis: [{
        labels: {
          rotation: -75
        },
      }],
      plotOptions: {
        series: {
          animation: {
            duration: 500,
          },
        },
      },
      series: [{
        type: 'area',
        color: '#000000',
        negativeColor: '#FF0000',
        data: [] as PointOptionsObject[]
      }]
    });

    const updateData = async () => {
      try {
        const { data } = await api.getCashFlow(
          formatDate(startDate.value, 'YYYY-MM-DD'),
          formatDate(endDate.value, 'YYYY-MM-DD'),
          startingBalance.value
        );
        if (data.length > 0 && chartOptions.value?.series && chartOptions.value?.series.length > 0) {
          chartOptions.value.series[0].data = data.map((day) => ({ y: day.balance, name: formatDate(day.date, 'YYYY-MM-DD') }));
        }
      } catch (err) {
        console.log(`update error: ${JSON.stringify(err)}`);
        $q.notify({ message: 'Error loading cash flow data', type: 'negative' });
      }
    };

    await updateData();

    const debounceInput = debounce(updateData, 5000);

    return {
      startingBalance,
      startDate,
      endDate,
      currency,
      currencySymbol,
      chartOptions,
      debounceInput,
      updateData,
    };
  },
});
</script>

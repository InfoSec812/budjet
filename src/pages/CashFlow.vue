<template>
  <q-page padding>
    <div class="flex q-md-pa padding">
      <q-input
        v-model.number="startingBalance"
        label="Starting Balance"
        :prefix="currencySymbol()"
        style="padding-right: 1.2rem"
      />
      <q-input
        v-model="startDate"
        type="date"
        label="Start Date"
        style="padding-right: 1.2rem"
      />
      <q-input
        v-model="endDate"
        type="date"
        label="End Date"
        style="padding-right: 1.2rem"
      />
      <q-btn icon="refresh" @click="updateData" flat dense />
    </div>
    <line-chart v-bind="lineChartProps" />
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { date, useQuasar, debounce } from 'quasar';
import { CashflowApi } from 'src/sdk';
import { LineChart, useLineChart } from 'vue-chart-3';
import { Chart, ChartData, registerables } from 'chart.js';

Chart.register(...registerables);

const { addToDate, formatDate } = date;

export default defineComponent({
  name: 'CashFlow',
  components: {
    'line-chart': LineChart
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

    const chartData = ref([] as number[]);
    const labels = ref([] as string[]);

    const formattedData = computed<ChartData<'line'>>(() => ({
      labels: labels.value,
      datasets: [
        {
          fill: {
            target: 'origin',
            below: 'rgb(255, 0, 0)',   // Area will be red above the origin
            above: 'rgb(0, 0, 0)'    // And blue below the origin
          },
          label: 'Balance',
          data: chartData.value,
          backgroundColor: 'rgb(210,0,0)',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointBackgroundColor: 'rgba(255,255,255,0.0)',
          pointBorderColor: 'rgba(255,127,0,0.8)',
          tension: 0.1,
        },
      ],
    }));

    const options = ref({
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Cash Flow',
        },
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 75,
            minRotation: 75
          }
        }
      }
    });

    const { lineChartProps, lineChartRef } = useLineChart({
      chartData: formattedData.value,
      options,
    });

    const updateData = async () => {
      try {
        const { data } = await api.getCashFlow(
          formatDate(startDate.value, 'YYYY-MM-DD'),
          formatDate(endDate.value, 'YYYY-MM-DD'),
          startingBalance.value
        );
        if (data.length > 0) {
          formattedData.value.datasets[0].data = data.map((day) => day.balance);
          formattedData.value.labels = data.map((day) => formatDate(day.date, 'YYYY-MM-DD'));
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
      lineChartProps,
      lineChartRef,
      debounceInput,
      updateData,
    };
  },
});
</script>

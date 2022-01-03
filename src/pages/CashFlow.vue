<template>
  <div class="flex" style="height: 100%;">
    <div class="fit row no-wrap justify-center items-start content-start">
      <q-input
        v-model.number="startingBalance"
        label="Starting Balance"
        :prefix="currencySymbol()"
        style="padding-right: 1.2rem"
        @change="debounceInput"
        class="col"
      />
      <q-input
        v-model="startDate"
        type="date"
        label="Start Date"
        style="padding-right: 1.2rem"
        @change="debounceInput"
        class="col"
      />
      <q-input
        v-model="endDate"
        type="date"
        label="End Date"
        style="padding-right: 1.2rem"
        @change="debounceInput"
        class="col"
      />
      <q-btn icon="refresh" @click="updateData" flat dense class="col-shrink"/>
    </div>
    <div class="fit row justify-evenly items-stretch content-stretch" style="height: 100%;" ref="chartContainer">
      <highcharts :options="chartOptions" class="col-grow"/>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { date, useQuasar, debounce } from 'quasar';

import { Chart } from 'highcharts-vue';
import { PointOptionsObject } from 'highcharts';
import { CashflowApi } from 'src/sdk';

import Highcharts from 'highcharts';
import exportingInit from 'highcharts/modules/exporting'

exportingInit(Highcharts);

const { addToDate, formatDate } = date;

export default defineComponent({
  components: {
    highcharts: Chart
  },
  async setup() {
    const $q = useQuasar();
    const chartContainer = ref(null);
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
      title: {
        text: 'Cash Flow',
      },
      exporting: {
        enabled: true,
      },
      chart: {
        animation: {
          duration: 300,
        },
        height: 700,
      },
      xAxis: [{
        categories: [] as string[],
        labels: {
          rotation: -65,
          style: {
            fontSize: '0.9rem',
          },
        },
        gridLineWidth: 1,
      }],
      yAxis: [{
        gridLineWidth: 1,
      }],
      plotOptions: {
        series: {
          animation: {
            duration: 500,
          },
        },
      },
      series: [{
        name: 'Balances',
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
        if (data.length > 0 && chartOptions.value.xAxis[0]?.categories && chartOptions.value?.series && chartOptions.value?.series.length > 0) {
          chartOptions.value.series[0].data = data.map((day) => ({ y: day.balance }));
          chartOptions.value.xAxis[0].categories = data.map((day) => formatDate(day.date, 'YYYY-MM-DD'));
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
      chartContainer,
    };
  },
});
</script>

<style lang="sass">
.fill-chart
  flex: 1
  margin: auto

</style>
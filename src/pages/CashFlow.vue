<template>
  <div class="flex" style="height: 100%;">
    <div class="fit row input-row wrap justify-start items-start content-start">
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
    <div class="fit row no-wrap chart-row justify-evenly items-stretch content-stretch" ref="chartContainer">
      <highcharts :options="chartOptions" class="col-grow"/>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { date, useQuasar, debounce } from 'quasar';

import { Chart } from 'highcharts-vue';
import { PlotOptions, PointOptionsObject, SeriesAreaOptions, YAxisOptions, XAxisOptions, ChartOptions, TitleOptions, ExportingOptions } from 'highcharts';
import { CashflowApi } from '../sdk';

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
        style: {
          fontSize: '1.6rem',
          fontWeight: 'bold',
        },
      } as TitleOptions,
      exporting: {
        enabled: true,
      } as ExportingOptions,
      chart: {
        animation: {
          duration: 300,
        },
      } as ChartOptions,
      xAxis: [{
        categories: [] as string[],
        labels: {
          rotation: -65,
          style: {
            fontSize: '0.9rem',
          },
        },
        gridLineWidth: 1,
      }] as XAxisOptions[],
      yAxis: [{
        gridLineWidth: 1,
      }] as YAxisOptions[],
      plotOptions: {
        series: {
          animation: {
            duration: 500,
          },
        },
      } as PlotOptions,
      series: [{
        name: 'Balances',
        type: 'area',
        color: '#000000',
        negativeColor: '#FF0000',
        data: [] as PointOptionsObject[]
      }] as SeriesAreaOptions[]
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
.input-row
  padding: 0.9rem !important
  max-height: 10vh

.chart-row
  min-height: 70vh
  max-height: 95vh
  margin: auto
</style>
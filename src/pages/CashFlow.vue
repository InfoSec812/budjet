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
    <div class="flex q-md-pa padding" ref="chartArea">
      <Chart
        :data="chartData"
        :margin="margin"
        :direction="direction">

        <template #layers>
          <Grid strokeDasharray="2,2" />
          <Line :dataKeys="['name', 'balance']" />
        </template>
      </Chart>
    </div>
    <q-resize-observer @resize="onResize" />
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, Ref } from 'vue';
import { date, useQuasar, debounce, dom } from 'quasar';
import { Chart, Grid, Line } from 'vue3-charts';
import { CashflowApi } from 'src/sdk';

const { addToDate, formatDate } = date;
const { width, height } = dom;

export default defineComponent({
  name: 'CashFlow',
  components: {
    Chart,
    Grid,
    Line
  },
  async setup() {
    const $q = useQuasar();
    const chartArea = ref(null) as unknown as Ref<Element>;
    const api = new CashflowApi();
    const startingBalance = ref(0.0);
    const direction = ref('horizontal');
    const margin = ref({
      left: 0,
      top: 20,
      right: 20,
      bottom: 0
    });

    const size = ref({ width: 500, height: 400 });

    const applyResize = () => {
      const newSize = { height: height(chartArea?.value), width: width(chartArea?.value) };
      console.log(`New Size: ${JSON.stringify(newSize)}`);
      size.value = newSize;
    };

    const onResize = debounce(applyResize, 500);

    onMounted(applyResize);

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

    interface ChartRecord {
      name: string
      balance: number
    }

    const chartData = ref([] as ChartRecord[]);

    const updateData = async () => {
      try {
        const { data } = await api.getCashFlow(
          formatDate(startDate.value, 'YYYY-MM-DD'),
          formatDate(endDate.value, 'YYYY-MM-DD'),
          startingBalance.value
        );
        if (data.length > 0) {
          chartData.value = data.map((day) => ({ name: formatDate(day.date, 'YYYY-MM-DD'), balance: day.balance }));
        }
      } catch (err) {
        console.log(`update error: ${JSON.stringify(err)}`);
        $q.notify({ message: 'Error loading cash flow data', type: 'negative' });
      }
    };

    await updateData();

    const debounceInput = debounce(updateData, 5000);

    return {
      onResize,
      startingBalance,
      startDate,
      endDate,
      currency,
      currencySymbol,
      margin,
      chartData,
      debounceInput,
      updateData,
      size,
      direction,
      chartArea,
    };
  },
});
</script>

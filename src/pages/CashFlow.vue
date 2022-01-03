<template>
  <q-page padding>
    <div class="flex q-md-pa padding">
      <q-input
        v-model.number="startingBalance"
        label="Starting Balance"
        :prefix="currencySymbol()"
        @change="debounceInput"
      />
      <q-input v-model="startDate" type="date" label="Start Date" @change="debounceInput" />
      <q-input v-model="endDate" type="date" label="End Date" @change="debounceInput" />
      <q-btn icon="refresh" @click="updateData" flat dense/>
    </div>
    <line-chart v-if="dataLoaded" :data="chartData" xtitle="Balance" ytitle="Date" />
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { date, debounce, useQuasar } from 'quasar';
import { CashflowApi } from 'src/sdk';

const { addToDate, formatDate } = date;

export default defineComponent({
  // name: 'PageName'
  setup() {
    const $q = useQuasar();
    const api = new CashflowApi();
    const startingBalance = ref(0.0);

    const startDate = ref(addToDate(new Date(), { months: -1 }));
    const endDate = ref(addToDate(new Date(), { months: 1 }));

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

    const chartData = ref([] as Record<string, number>[]);

    const updateData = async () => {
      try {
        const { data } = await api.getCashFlow(formatDate(startDate.value, 'YYYY-MM-DD'), formatDate(endDate.value, 'YYYY-MM-DD'), startingBalance.value);
        data.forEach((day) => {
          chartData.value.push(JSON.parse(`{ "${formatDate(day.date, 'YYYY-MM-DD')}": ${day.balance} }`));
        });
      } catch(err) {
        $q.notify({ message: 'Error loading cash flow data', type: 'negative' })
      }
    }

    onMounted(updateData);
    
    const debounceInput = debounce(updateData, 2000);

    return {
      chartData,
      startingBalance,
      startDate,
      endDate,
      updateData,
      debounceInput,
      currency,
      currencySymbol,
      dataLoaded: computed(() => chartData.value.length > 0)
    };
  },
});
</script>

<template>
  <q-page padding>
    <q-form @submit="submit" @reset="reset" class="q-gutter-md">
      <q-input v-model="currentIncome.name" label="Name" hint="The name of this income" />
      <q-select
        v-model="currentIncome.currency"
        label="Currency"
        :options="currencyOptions"
        emit-value
        map-options
      />
      <q-input
        v-model.number="currentIncome.amount"
        label="Amount"
        hint="The minimum payment amount"
        :mask="maskString"
        fill-mask="0"
        reverse-fill-mask
        :rules="[(val) => Number.isFinite(val)]"
        :prefix="currencySymbol()"
      />
      <q-select
        v-model="currentIncome.period"
        label="Period/Frequency"
        :options="periodOptions"
        map-options
        emit-value
      />
      <q-input
        v-model="currentIncome.start_date"
        hint="Start date or the date of the payment"
        type="date"
      />
      <q-input
        v-model="currentIncome.end_date"
        hint="End Date (Optional)"
        v-if="isNotOnce"
        type="date"
      />
      <div>
        <q-btn label="Submit" type="submit" color="primary" />
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
      </div>
    </q-form>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed } from 'vue';
import { Income, NewIncome, Currency, Period } from '../sdk';
import { useRouter } from 'vue-router';
import { format, date } from 'quasar';
import { unifiedStore } from '../stores/UnifiedStore';

const { formatDate } = date;
const { capitalize } = format;

const PERIOD_LIST = 'once,weekly,biweekly,semimonthly,monthly,quarterly,semianually,annually';

export default defineComponent({
  name: 'IncomeEdit',
  props: {
    incomeId: {
      type: String,
      required: false,
    },
  },
  async setup(props) {
    const router = useRouter();
    const api = unifiedStore();

    const maskString = computed(() => {
      const numberFormat = new Intl.NumberFormat(navigator.language, { style: 'currency', currency: currentIncome.value.currency as string });
      const parts = numberFormat.formatToParts(currentIncome.value.amount);

      let mask = '';

      for(let i = 0; i < parts.length; i++) {
        switch(parts[i].type) {
          case 'integer':
            for (let a = 0; a < `${parts[i].value}`.length; a++) {
              mask += '#';
            }
            break;
          case 'group':
            mask += parts[i].value;
            break;
          case 'decimal':
            mask += parts[i].value;
            break;
          case 'fraction':
            for (let a = 0; a < `${parts[i].value}`.length; a++) {
              mask += '#';
            }
            break;
        }
      }

      return mask;
    });

    if (api.incomesList.length == 0) {
      void api.loadIncomes();
    }

    let initIncome: Income | undefined = {
      period: Period.Once,
      currency: Currency.Usd,
      amount: 0.00,
      start_date: formatDate(new Date(), 'YYYY-MM-DD'),
    } as NewIncome;

    if (props?.incomeId) {
      initIncome = await api.getIncomeById(props.incomeId);
    }

    let currentIncome = {} as Ref<NewIncome>;

    const reset = () => {
      currentIncome = ref(Object.assign({}, initIncome));
    };

    const submit = async () => {
      if (props.incomeId) {
        console.log('ID is set');
        try {
          await api.saveIncome(currentIncome.value);
          void router.push('/income/list');
        } finally {
        }
      } else {
        console.log('ID is NOT set');
        try {
          await api.newIncome(currentIncome.value);
          void router.push('/income/list');
        } finally {
        }
      }
    };

    const currencySymbol = () => {
      switch (currentIncome.value.currency) {
        case 'USD':
          return '$';
        case 'GBP':
          return '£';
        default:
          return '€';
      }
    };

    reset();

    const periodOptions = computed(() => {
      return PERIOD_LIST
                .split(',')
                .map((item) => ({ label: capitalize(item), value: item }));
    });

    const isNotOnce = computed((): boolean => {
      return (currentIncome.value.period !== NewIncomePeriodEnum.Once);
    });

    return {
      currentIncome,
      currencySymbol,
      currencyOptions: ['USD', 'GBP', 'EUR'],
      reset,
      submit,
      periodOptions,
      isNotOnce,
      maskString,
    };
  },
});
</script>

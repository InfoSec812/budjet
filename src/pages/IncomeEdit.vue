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
        :rules="[(val) => Number.isFinite(val)]"
        :prefix="currencySymbol()"
      />
      <div>
        <q-btn label="Submit" type="submit" color="primary" />
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
      </div>
    </q-form>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from 'vue';
import { Income, NewIncome } from 'src/sdk';
import { incomeStore } from 'src/stores/IncomeStore';
import { useRouter } from 'vue-router';

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
    const incomes = incomeStore();

    if (incomes.incomesList.length == 0) {
      void incomes.loadIncomes();
    }

    let initIncome: Income | undefined = {} as Income;

    if (props?.incomeId) {
      initIncome = await incomes.getIncomeById(props.incomeId);
    }

    let currentIncome = {} as Ref<NewIncome>;

    const reset = () => {
      currentIncome = ref(Object.assign({}, initIncome));
    };

    const submit = async () => {
      if (props.incomeId) {
        console.log('ID is set');
        try {
          await incomes.saveIncome(currentIncome.value);
          void router.push('/income/list');
        } finally {
        }
      } else {
        console.log('ID is NOT set');
        try {
          await incomes.newIncome(currentIncome.value);
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

    return {
      currentIncome,
      currencySymbol,
      currencyOptions: ['USD', 'GBP', 'EUR'],
      reset,
      submit,
    };
  },
});
</script>

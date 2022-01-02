<template>
  <q-page padding>
    <q-form
      @submit="submit"
      @reset="reset"
      class="q-gutter-md"
      >
      <q-input v-model="currentBill.name" label="Name" hint="The name of this bill" />
      <q-select v-model="currentBill.currency" label="Currency" :options="currencyOptions" emit-value map-options/>
      <q-input v-model.number="currentBill.amount" label="Amount" hint="The minimum payment amount" :rules="[ val => Number.isFinite(val) ]" :prefix="currencySymbol()" />
      <q-input v-model="currentBill.due_date" label="Due Date" hint="The day of the month on which this bill is due" />
      <q-input v-model="currentBill.late_date" label="Grace Period" hint="The number of days after the due date before a penalty is incurred" />
      <q-input v-model="currentBill.link" label="Link" hint="A link to where the bill can be paid online" />
      <div>
        <q-btn label="Submit" type="submit" color="primary"/>
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
      </div>
    </q-form>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from 'vue';
import { Bill, NewBill } from 'src/sdk';
import { billStore } from 'src/stores/BillStore';
import { useRouter } from 'vue-router';

export default defineComponent({
  props: {
    id: {
      type: String,
      required: false
    }
  },
  async setup(props) {
    const router = useRouter();
    const bills = billStore();

    if (bills.billsList.length == 0) {
      void bills.loadBills();
    }

    let initBill: Bill | undefined = {} as Bill;

    if (props?.id) {
      initBill = await bills.getBillById(props.id);
    }

    let currentBill = {} as Ref<NewBill>;

    const reset = () => {
      currentBill = ref(Object.assign({}, initBill) as Bill);
    }

    const submit = async () => {
      if (props.id) {
        try {
          await bills.saveBill(currentBill.value);
          void router.push('/');
        } finally {

        }
      } else {
        try {
          await bills.newBill(currentBill.value);
          void router.push('/');
        } finally {
          
        }
      }
    }

    const currencySymbol = () => {
      switch(currentBill.value.currency) {
        case 'USD':
          return '$';
        case 'GBP':
          return '£';
        default:
          return '€';
      }
    }

    reset();

    return {
      currentBill,
      currencySymbol,
      currencyOptions: ['USD','GBP','EUR'],
      reset,
      submit,
    }
  }
});
</script>

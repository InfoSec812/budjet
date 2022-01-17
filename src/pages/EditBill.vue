<template>
  <QPage padding>
    <QForm @submit="submit" @reset="reset" class="q-gutter-md">
      <QInput v-model="currentBill.name" label="Name" hint="The name of this bill" />
      <QSelect
        v-model="currentBill.currency"
        label="Currency"
        :options="currencyOptions"
        emit-value
        map-options
      />
      <QInput
        v-model.number="currentBill.amount"
        label="Amount"
        hint="The minimum payment amount"
        :rules="[(val) => Number.isFinite(val)]"
        :prefix="currencySymbol()"
      />
      <QInput
        v-model.number="currentBill.due_date"
        label="Due Date"
        hint="The day of the month on which this bill is due"
        :rules="[ (val) => (1 <= val && val <= 31) ]"
      />
      <QInput
        v-model.number="currentBill.late_date"
        label="Grace Period"
        hint="The number of days after the due date before a penalty is incurred"
      />
      <QInput
        v-model="currentBill.link"
        label="Link"
        hint="A link to where the bill can be paid online"
      />
      <div>
        <QBtn label="Submit" type="submit" color="primary" />
        <QBtn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
      </div>
    </QForm>
  </QPage>
</template>

<script setup lang="ts">
import { ref, Ref } from 'vue';
import { Bill, NewBill } from '../sdk';
import { useRouter } from 'vue-router';
import { unifiedStore } from '../stores/UnifiedStore';

const props = defineProps({
  id: {
    type: String,
    required: false,
  },
});

const router = useRouter();
const api = unifiedStore();

if (api.billsList.length == 0) {
  void api.loadBills();
}

let initBill: Bill | undefined = {} as Bill;

if (props?.id) {
  initBill = await api.getBillById(props.id);
}

let currentBill = {} as Ref<NewBill>;

const reset = () => {
  currentBill = ref(Object.assign({}, initBill) as Bill);
};

const submit = async () => {
  if (props.id) {
    console.log('ID is set');
    try {
      await api.saveBill(currentBill.value);
      void router.push('/');
    } finally {
    }
  } else {
    console.log('ID is NOT set');
    try {
      await api.newBill(currentBill.value);
      void router.push('/');
    } finally {
    }
  }
};

const currencySymbol = () => {
  switch (currentBill.value.currency) {
    case 'USD':
      return '$';
    case 'GBP':
      return '£';
    default:
      return '€';
  }
};

reset();

const currencyOptions = ['USD', 'GBP', 'EUR'];
</script>

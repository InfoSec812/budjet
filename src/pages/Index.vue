<template>
  <div class="flex q-pa-md" style="margin: 0;">
    <q-table
      title="Bills"
      class="sticky-table-elements"
      :rows="rows"
      flat bordered>
      <template v-slot:top>
        Bills <q-btn icon="refresh" @click="reload" flat dense/>
      </template>
      <template v-slot:header>
        <q-tr>
          <q-th>Name</q-th>
          <q-th>Amount</q-th>
          <q-th>Due</q-th>
          <q-th v-for="(month, index) in months" :key="index">{{ month }}</q-th>
        </q-tr>
      </template>
      <template v-slot:body="props">
        <q-tr>
          <q-td>
            <q-btn icon="edit" :to="`/bill/edit/${props.row.id}`" dense flat />
            <a :href="props.row.link" target="_blank">{{ props.row.name }}</a></q-td>
          <q-td>{{ moneyFormat(props.row.amount, props.row.currency) }}</q-td>
          <q-td>{{ props.row.due_date }}</q-td>
          <q-td v-for="(month, index) in props.row.months" :key="index" style="align: center;">
            <q-checkbox v-model="month.paid" @click="toggleMonthPaid(props.row.id, month)" />
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-ajax-bar ref="progressBar" position="bottom" size="0.8rem"/>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="accent" />
    </q-page-sticky>
  </div>
</template>

<script lang="ts">
import { QAjaxBar, useQuasar } from 'quasar';
import { defineComponent, ref, computed } from 'vue';
import dayjs from 'dayjs';
import { Month } from 'src/sdk';
import { billStore } from 'src/stores/BillStore';

export default defineComponent(() => {
  const $q = useQuasar();
  const progressBar = ref<QAjaxBar>();
  const bills = billStore();

  /**
   * Wrap the increment method from the Quasar QAjaxBar for use in stores
   * @param increment Amount to increase the progress bar (0 to 100)
   */
  const incrementer = (amount?: number) => {
    progressBar?.value?.increment(amount);
  };

  /**
   * Wrap the stop method from the Quasar QAjaxBar for use in stores
   */
  const stop = () => progressBar?.value?.stop();

  /**
   * Use Quasar's Notify plugin to show a toast/snackbar message
   * @param message The message to be displayed in the alert
   * @param type The type of alert 'positive', 'negative', 'warning', 'info', 'ongoing'
   */
  const notify = (message: string, type = 'info') => $q.notify({ message, type });

  /**
   * Load the list of bills from the API
   */
  function loadBills() {
    console.log('C-A');
    progressBar?.value?.start(50);
    console.log('C-B');
    void bills.loadBills(notify, incrementer, stop);
  }

  /**
   * Convert the numeric month number to the short month name
   * @param num Numeric month ID
   */
  const monthName = (num = 0): string => {
    const mon = new Date().setMonth(num);
    const dateObj = dayjs(mon);
    return dateObj.format('MMM');
  }

  if (bills.billsList === undefined || bills.billsList === null || bills.billsList.length < 1) {
    loadBills();
  }

  /**
   * Get the list of months from the first bill
   */
  const months = (offset = 0): string[] => {

    const startMonth = new Date();
    startMonth.setMonth(startMonth.getMonth() + offset);

    const retVal: string[] = [];
    for (let i = 0; i < 10; i++) {
      const iterDate = new Date();
      iterDate.setMonth(startMonth.getMonth() + i);
      const twoDigitYear = `${iterDate.getFullYear()}`.substring(2);
      retVal.push(`${monthName(iterDate.getMonth())} ${twoDigitYear}`)
    }
    return retVal;
  }

  /**
   * Format monetary values according to the browser's locale information
   * @param value The numeric value to be formatted
   * @param currency The type of currency to be formatting ('USD', 'GBP', 'EUR' for now)
   */
  const moneyFormat = (value: number, currency = 'USD'): string => {
    return new Intl.NumberFormat(navigator.language, { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  }

  /**
   * Change the paid status of a bill for a given month
   * @param id The id of the Bill for which we are updating the status
   * @param month The Month object which we are updating within that bill
   */
  const toggleMonthPaid = (id: string, month: Month): void => {
    void bills.changePaidStatus(notify, incrementer, stop, id, month);
  }

  return {
    rows: computed(() => bills.billsList),
    reload: loadBills,
    months: computed(months),
    monthName,
    moneyFormat,
    toggleMonthPaid,
  }
});
</script>


<style lang="sass" scoped>

$name-width: 15rem
$amt-width: 6rem
$due-width: 5rem
$due-left: ($name-width + $amt-width)
$header-color: #CCEAEA
$column-highlight: #E7F1FA

.sticky-table-elements
  /* height or max-height is important */
  min-height: 82vh
  max-height: 88vh
  min-width: 75vw
  max-width: 100vw
  padding: 0px

  & .q-table
    padding: 0px
    table-layout: fixed

  td
    white-space: nowrap !important
    overflow: ellipsis !important

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: $header-color

  thead tr th
    position: sticky
    z-index: 1
    background-color: $header-color
    max-width: 7rem
    min-width: 7rem
  thead tr:first-child th
    top: 0

  thead tr > :first-child
    min-width: $name-width
    max-width: $name-width
    position: sticky
    z-index: 6
    left: 0rem
    resize: none
  thead tr > :nth-child(2)
    min-width: $amt-width
    max-width: $amt-width
    position: sticky
    z-index: 7
    left: $name-width
    resize: none
  thead tr > :nth-child(3)
    min-width: $due-width
    max-width: $due-width
    position: sticky
    z-index: 8
    left: $due-left
    resize: none

  tbody
    overflow: scroll

  tbody tr td
    text-align: center !important

  td:nth-child(even)
      background-color: $column-highlight

  // Make first 3 columns sticky
  tbody tr > :first-child
    position: sticky
    min-width: $name-width
    max-width: $name-width
    z-index: 3
    background-color: white
    left: 0rem
    resize: none
    white-space: nowrap !important
    overflow: ellipsis !important
    text-align: left !important

  tbody tr > :nth-child(2)
    position: sticky
    min-width: $amt-width
    max-width: $amt-width
    z-index: 4
    background-color: white
    left: $name-width
    resize: none
    text-align: right !important

  tbody tr > :nth-child(3)
    min-width: $due-width
    max-width: $due-width
    position: sticky
    z-index: 5
    background-color: white
    left: $due-left
    resize: none
    text-align: center !important

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
</style>


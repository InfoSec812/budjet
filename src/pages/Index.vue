<template>
  <div class="flex q-pa-md grid-container">
    <q-table
      title="Bills"
      class="sticky-table-elements col-grow"
      :rows="rows"
      flat bordered
      :style="tableDimensions"
      >
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
          <q-td v-for="(month, index) in props.row.months" :key="index" style="text-align: center;">
            <q-checkbox v-model="month.paid" @click="toggleMonthPaid(props.row.id, month)" />
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-page-sticky position="bottom-right" :offset="[8, 8]">
      <q-btn fab icon="add" color="accent" to="/bill/add" />
    </q-page-sticky>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { date, dom } from 'quasar';
import { Month } from 'src/sdk';
import { billStore } from 'src/stores/BillStore';

const { formatDate, addToDate } = date;
const { height, width } = dom;

export default defineComponent(() => {
  const gridContainer = ref<Element>()
  const bills = billStore();

  /**
   * Load the list of bills from the API
   */
  function loadBills() {
    void bills.loadBills();
  }

  /**
   * Convert the numeric month number to the short month name
   * @param num Numeric month ID
   */
  const monthName = (num = 0): string => {
    return formatDate(
      addToDate(new Date(), { months: num }),
      'MMM'
    );
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
    void bills.changePaidStatus(id, month);
  }

  return {
    rows: computed(() => bills.billsList),
    reload: loadBills,
    months: computed(months),
    monthName,
    moneyFormat,
    toggleMonthPaid,
    tableDimensions: computed(() => {
      let retVal = '';
      if (gridContainer?.value) {
        const tableHeight = height(gridContainer?.value) - 5;
        const tableWidth = width(gridContainer?.value) - 5;
        retVal = `width: ${tableWidth}px; height: ${tableHeight}px;`
      }
      return retVal;
    })
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

.grid-container
  overflow: hidden
  height: 88vh

.sticky-table-elements
  /* height or max-height is important */
  // max-height: 88vh
  // max-width: 100%
  position: relative
  top: 5px
  left: 5px
  right: 5px
  bottom: 20px
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
    min-width: 4rem
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
    text-align: right
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


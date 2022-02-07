<template>
  <div class="flex q-pa-md grid-container">
    <q-table
      title="incomes"
      class="sticky-table-elements col-grow"
      :rows="rows"
      flat bordered
      :style="tableDimensions"
      >
      <template v-slot:top>
        Income
        <q-input v-model="startDate" type="date" hint="Starting date" style="padding-left: 0.8rem;" />
        <q-input v-model="endDate" type="date" hint="Ending date" style="padding-left: 0.8rem;" />
        <q-btn icon="refresh" @click="reload" flat dense/>
      </template>
      <template v-slot:header>
        <q-tr>
          <q-th>Name</q-th>
          <q-th>Amount</q-th>
          <q-th>Period</q-th>
        </q-tr>
      </template>
      <template v-slot:body="props">
        <q-tr>
          <q-td>
            <q-btn icon="edit" :to="`/income/edit/${props.row.id}`" dense flat></q-btn>
            {{ props.row.name }}
          </q-td>
          <q-td>{{ moneyFormat(props.row.amount, props.row.currency) }}</q-td>
          <q-td>{{ props.row.period }}</q-td>
        </q-tr>
      </template>
    </q-table>
    <q-page-sticky position="bottom-right" :offset="[8, 8]">
      <q-btn fab icon="add" color="accent" to="/income/add" />
    </q-page-sticky>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { dom } from 'quasar';
import { unifiedStore } from '../stores/UnifiedStore';
import { date } from 'quasar';

const { height, width } = dom;

const gridContainer = ref<Element>();
const api = unifiedStore();

const today = new Date();
const startDate = date.formatDate(today, 'YYYY-MM-DD');
const endDate = date.formatDate(date.addToDate(today, { months: 3 }), 'YYYY-MM-DD');

/**
 * Load the list of incomes from the API
 */
function reload() {
  void api.loadIncomes(startDate, endDate);
}

if (api.incomesList === undefined || api.incomesList === null || api.incomesList.length < 1) {
  reload();
}

/**
 * Format monetary values according to the browser's locale information
 * @param value The numeric value to be formatted
 * @param currency The type of currency to be formatting ('USD', 'GBP', 'EUR' for now)
 */
const moneyFormat = (value: number, currency = 'USD'): string => {
  return new Intl.NumberFormat(navigator.language, { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

const rows = computed(() => api.incomesList);
const tableDimensions = computed(() => {
    let retVal = '';
    if (gridContainer?.value) {
      const tableHeight = height(gridContainer?.value) - 5;
      const tableWidth = width(gridContainer?.value) - 5;
      retVal = `width: ${tableWidth}px; height: ${tableHeight}px;`
    }
    return retVal;
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

  & .QTable
    padding: 0px
    table-layout: fixed

  td
    white-space: nowrap !important
    overflow: ellipsis !important

  .QTable__top,
  .QTable__bottom,
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
    text-align: left
    padding-left: 3rem
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
  &.QTable--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
</style>


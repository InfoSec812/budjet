import { RouteRecordRaw } from 'vue-router';
import Index from 'src/pages/Index.vue';
import EditBill from 'src/pages/EditBill.vue';
import IncomeEdit from 'src/pages/IncomeEdit.vue';
import IncomeList from 'src/pages/IncomeList.vue';
import CashFlow from 'src/pages/CashFlow.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: Index },
      { path: '/bill/add', component: EditBill },
      { path: '/bill/edit/:id', component: EditBill, props: true },
      { path: '/income/list', component: IncomeList },
      { path: '/income/add', component: IncomeEdit },
      { path: '/income/edit/:incomeId', component: IncomeEdit, props: true },
      { path: '/cashflow', component: CashFlow },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;

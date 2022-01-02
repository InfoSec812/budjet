import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: '/bill/add', component: () => import('pages/EditBill.vue') },
      { path: '/bill/edit/:id', component: () => import('pages/EditBill.vue'), props: true },
      { path: '/income', component: () => import('pages/IncomeList.vue') },
      { path: '/income/add', component: () => import('pages/EditIncome.vue') },
      { path: '/income/edit/:id', component: () => import('pages/EditIncome.vue'), props: true },
      { path: '/cashflow', component: () => import('pages/CashFlow.vue') },
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

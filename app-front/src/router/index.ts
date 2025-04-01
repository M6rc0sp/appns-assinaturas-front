import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SubscriptionListView from '@/views/subscriptions/SubscriptionListView.vue'
import SubscriptionDetailView from '@/views/subscriptions/SubscriptionDetailView.vue'
import SimulateSubscriptionView from '@/views/simulations/SimulateSubscriptionView.vue'
import ManagementView from '../views/management/ManagementView.vue'
import SellerListView from '../views/management/sellers/SellerListView.vue'
import SellerDetailView from '../views/management/sellers/SellerDetailView.vue'
import SellerFormView from '../views/management/sellers/SellerFormView.vue'
import ShopperListView from '../views/management/shoppers/ShopperListView.vue'
import ShopperDetailView from '../views/management/shoppers/ShopperDetailView.vue'
import ShopperFormView from '../views/management/shoppers/ShopperFormView.vue'
import OrderListView from '../views/management/orders/OrderListView.vue'
import OrderDetailView from '../views/management/orders/OrderDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/subscriptions',
      name: 'subscriptions',
      component: SubscriptionListView,
    },
    {
      path: '/subscriptions/:id',
      name: 'subscription-details',
      component: SubscriptionDetailView,
    },
    {
      path: '/simulate',
      name: 'simulate-subscription',
      component: SimulateSubscriptionView,
    },
    // Nova seção de gerenciamento
    {
      path: '/management',
      name: 'management',
      component: ManagementView,
      children: [
        // Rotas de Sellers
        {
          path: 'sellers',
          name: 'seller-list',
          component: SellerListView
        },
        {
          path: 'sellers/new',
          name: 'seller-new',
          component: SellerFormView
        },
        {
          path: 'sellers/:id',
          name: 'seller-detail',
          component: SellerDetailView
        },
        {
          path: 'sellers/:id/edit',
          name: 'seller-edit',
          component: SellerFormView
        },
        // Rotas de Shoppers
        {
          path: 'shoppers',
          name: 'shopper-list',
          component: ShopperListView
        },
        {
          path: 'shoppers/new',
          name: 'shopper-new',
          component: ShopperFormView
        },
        {
          path: 'shoppers/:id',
          name: 'shopper-detail',
          component: ShopperDetailView
        },
        {
          path: 'shoppers/:id/edit',
          name: 'shopper-edit',
          component: ShopperFormView
        },
        // Rotas de Orders
        {
          path: 'orders',
          name: 'order-list',
          component: OrderListView
        },
        {
          path: 'orders/:id',
          name: 'order-detail',
          component: OrderDetailView
        }
      ]
    }
  ],
})

export default router

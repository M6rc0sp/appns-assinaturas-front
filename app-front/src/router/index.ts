import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import SubscriptionListView from '@/views/subscriptions/SubscriptionListView.vue'
import SubscriptionDetailView from '@/views/subscriptions/SubscriptionDetailView.vue'
import ManagementView from '../views/management/ManagementView.vue'
import SellerListView from '../views/management/sellers/SellerListView.vue'
import SellerDetailView from '../views/management/sellers/SellerDetailView.vue'
import SellerFormView from '../views/management/sellers/SellerFormView.vue'
import ShopperListView from '../views/management/shoppers/ShopperListView.vue'
import ShopperDetailView from '../views/management/shoppers/ShopperDetailView.vue'
import ShopperFormView from '../views/management/shoppers/ShopperFormView.vue'
import OrderListView from '../views/management/orders/OrderListView.vue'
import OrderDetailView from '../views/management/orders/OrderDetailView.vue'
// import CatalogView from '@/views/public/CatalogView.vue' // Removido catálogo
import CheckoutView from '@/views/public/CheckoutView.vue'
import SuccessView from '@/views/public/SuccessView.vue'
import ManageSubscriptionsView from '@/views/public/ManageSubscriptionsView.vue'
import DirectCheckoutView from '../views/public/DirectCheckoutView.vue'
import NotFoundView from '@/views/public/NotFoundView.vue'
import SetupView from '@/views/public/SetupView.vue'
import PrivacyPolicyView from '@/views/public/PrivacyPolicyView.vue'
import SupportView from '@/views/public/SupportView.vue'

// Define as rotas públicas - apenas essas serão acessíveis sem autenticação
const publicRoutes = [
  'public-checkout', 
  'public-success', 
  'public-direct-checkout', 
  'login', 
  'register', 
  'public-setup',
  'public-privacy-policy',
  'public-support',
  'not-found'
] // Removido 'public-catalog'

// Detecta se estamos em ambiente de produção
const isProd = import.meta.env.MODE === 'production';

const router = createRouter({
  history: createWebHistory(isProd ? '/shop/' : '/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/subscriptions',
      name: 'subscriptions',
      component: SubscriptionListView,
      meta: { requiresAuth: true },
    },
    {
      path: '/subscriptions/:id',
      name: 'subscription-details',
      component: SubscriptionDetailView,
      meta: { requiresAuth: true },
    },
  // Rota de simulação removida
    // Rotas de autenticação - permanecem públicas para permitir login/registro
    {
      path: '/auth/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/auth/register',
      name: 'register',
      component: RegisterView
    },
    // Rotas públicas para assinantes (guests)
    // Catálogo removido
    {
      path: '/checkout',
      name: 'public-checkout',
      component: CheckoutView
    },
    {
      path: '/success',
      name: 'public-success',
      component: SuccessView
    },
    {
      path: '/checkout-direto/:productId',
      name: 'public-direct-checkout',
      component: DirectCheckoutView
    },
    {
      path: '/manage',
      name: 'public-manage',
      component: ManageSubscriptionsView,
      meta: { requiresAuth: true },
    },
    // Novas rotas públicas
    {
      path: '/setup',
      name: 'public-setup',
      component: SetupView
    },
    {
      path: '/politicas-de-privacidade',
      name: 'public-privacy-policy',
      component: PrivacyPolicyView
    },
    {
      path: '/suporte',
      name: 'public-support',
      component: SupportView
    },
    // Rotas protegidas de gerenciamento
    {
      path: '/management',
      name: 'management',
      component: ManagementView,
      meta: { requiresAuth: true },
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
    },
    // Redireciona qualquer rota não definida para a página de erro amigável
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView
    }
  ],
})

// Guarda de navegação para verificar autenticação
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  authStore.initialize()
  const requiresAuth = to.meta.requiresAuth !== false && !publicRoutes.includes(to.name as string)
  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'home' }) // Redireciona para home se não autenticado
  } else {
    next()
  }
})

export default router

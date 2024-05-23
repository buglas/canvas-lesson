import { createRouter, createWebHistory } from 'vue-router'

const routes = [
	{
    path: '/',
		component: () => import('../examples/Graph2D.vue'),
	},
	{
    path: '/NStar',
		component: () => import('../examples/NStar.vue'),
	},
	{
    path: '/CollisionRebound',
		component: () => import('../examples/CollisionRebound.vue'),
	},
  {
		path: '/BulletScreenTest',
		component: () => import('../examples/BulletScreenTest.vue'),
	},
  {
		path: '/BoundingBox',
		component: () => import('../examples/BoundingBox.vue'),
	},
  {
		path: '/BVH01',
		component: () => import('../examples/BVH01.vue'),
	},
  {
		path: '/BVH02',
		component: () => import('../examples/BVH02.vue'),
	},
]
const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router

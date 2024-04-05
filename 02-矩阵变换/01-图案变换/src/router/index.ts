import { createRouter, createWebHistory } from 'vue-router'

const routes = [
	{
		path: '/',
		component: () => import('../examples/HelloWorld.vue'),
	},
	{
		path: '/MatrixOfCanvas',
		component: () => import('../examples/MatrixOfCanvas.vue'),
	},
	{
		path: '/Camera',
		component: () => import('../examples/Camera.vue'),
	},
	{
		path: '/Img',
		component: () => import('../examples/Img.vue'),
	},
	{
		path: '/Group',
		component: () => import('../examples/Group.vue'),
	},
	{
		path: '/Scene',
		component: () => import('../examples/Scene.vue'),
	},
	{
		path: '/OrbitControler',
		component: () => import('../examples/OrbitControler.vue'),
	},
	{
		path: '/ImgControler',
		component: () => import('../examples/ImgControler.vue'),
	},
]
const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router

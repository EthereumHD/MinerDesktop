import Vue from 'vue'
import Router from 'vue-router'
import AdminPage from '../components/AdminPage'
import ImportPage from '../components/ImportPage'


Vue.use(Router)

export default new Router({
	routes: [
		{
			path: '/import',
			name: 'import',
			component: ImportPage
		},
		{
			path: '/admin',
			name: 'admin',
			component: AdminPage
		},

	]
})

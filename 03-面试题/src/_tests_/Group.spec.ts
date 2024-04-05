import { describe, it, expect } from 'vitest'
import { Group } from '../lmm/objects/Group'
import { Object2D } from '../lmm/objects/Object2D'

describe('EventDispatcher', () => {
	const group1 = new Group()
	group1.addEventListener('add', (event) => {
		console.log('add obj：', event.obj.name)
	})
	const obj1 = new Object2D()
	obj1.name = 'obj1'
	group1.add(obj1)

	const group2 = new Group()
	group2.addEventListener('remove', (event) => {
		console.log('remove obj：', event.obj.name)
	})
	group2.name = 'group2'

	const obj2 = new Object2D()
	obj2.name = 'obj2'
	group2.add(obj2)
	group1.add(group2)

	it('增删改查', () => {
		expect(group1.children.length).toBe(2)
		expect(group1.children[0].uuid).toBe(obj1.uuid)
		expect(group1.getObjectByName('obj2')?.uuid).toBe(obj2.uuid)
		expect(group1.getObjectByProperty('uuid', obj2.uuid)?.uuid).toBe(obj2.uuid)
		let i = 0
		group1.traverse((obj) => {
			expect(obj.name).toBe(['', 'obj1', 'group2', 'obj2'][i])
			i++
		})
		obj1.index = 1
		group1.sort()
		expect(group1.children[1].uuid).toBe(obj1.uuid)
		group1.remove(obj2)
		expect(group1.getObjectByName('obj2')).toBe(undefined)
		group1.clear()
		expect(group1.children.length).toBe(0)
	})
})

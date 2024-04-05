import { describe, expect, it } from 'vitest'
import { EventDispatcher, CustomEvent } from '../lmm/core/EventDispatcher'

describe('EventDispacher', () => {
	it.skip('功能测试', () => {
		const eventDispacher = new EventDispatcher()
		const fn1 = function (event: CustomEvent) {
			console.log('------------')
			console.log(1)
			console.log(event)
			console.log('------------')
		}
		const fn2 = function (event: CustomEvent) {
			console.log('------------')
			console.log(2)
			console.log(event)
			console.log('------------')
		}
		eventDispacher.addEventListener('typeA', fn1)
		eventDispacher.addEventListener('typeA', fn2)
		console.log(eventDispacher.hasEventListener('typeA', fn1))
		eventDispacher.dispatchEvent({ type: 'typeA' })
		eventDispacher.removeEventListener('typeA', fn1)
		console.log(eventDispacher.hasEventListener('typeA', fn1))
	})

	it('继承测试', () => {
		class Wolf extends EventDispatcher {
			constructor(public name: string) {
				super()
			}
		}
		const wolf = new Wolf('灰太狼')
		wolf.addEventListener('coming', (event) => {
			console.log(event.target.name + '来啦！')
		})
		wolf.dispatchEvent({ type: 'coming' })
	})
})

import { Object2D } from '../core/Object2D'
import { Geometry } from '../geometry/Geometry'
import { GeometryGroup } from '../geometry/GeometryGroup'
import { StandStyle } from '../style/StandStyle'
import { Graph2D } from './Graph2D'

class Group extends Object2D {
	// 子集
	children: ChildType[] = []
	// 类型
	readonly isGroup = true

	/* 添加元素 */
	add(...objs: ChildType[]) {
		for (let obj of objs) {
			obj.parent && obj.remove()
			obj.parent = this
			this.children.push(obj)
			this.dispatchEvent({ type: 'add', obj })
			if (obj === this) {
				console.error("obj can't be added as a child of itself.", obj)
				return this
			}
		}
		this.sort()
		return this
	}

	/* 删除元素 */
	remove(...objs: ChildType[]) {
		const { children } = this
		for (let obj of objs) {
			const index = children.indexOf(obj)
			if (index !== -1) {
				obj.parent = undefined
				this.children.splice(index, 1)
				this.dispatchEvent({ type: 'remove', obj })
			} else {
				for (let child of children) {
					if (child instanceof Group) {
						child.remove(obj)
					}
				}
			}
		}
		return this
	}

	/* 清空children */
	clear() {
		for (let obj of this.children) {
			obj.parent = undefined
			this.dispatchEvent({ type: 'removed', obj })
		}
		this.children = []
		return this
	}

	/* 排序 */
	sort() {
		const { children } = this
		children.sort((a, b) => {
			return a.index - b.index
		})
		for (let child of children) {
			child instanceof Group && child.sort()
		}
	}

	/* 根据名称获取元素 */
	getObjectByName(name: string) {
		return this.getObjectByProperty('name', name)
	}

	/* 根据某个属性的值获取子对象 */
	getObjectByProperty<T>(name: string, value: T): ChildType | undefined {
		const { children } = this
		for (let i = 0, l = children.length; i < l; i++) {
			const child = children[i]
			if (child[name] === value) {
				return child
			} else if (child instanceof Group) {
				const obj = child.getObjectByProperty<T>(name, value)
				if (obj) {
					return obj
				}
			}
		}
		return undefined
	}

	/* 遍历元素 */
	traverse(callback: (obj: ChildType) => void) {
		callback(this)
		const { children } = this
		for (let child of children) {
			if (child instanceof Group) {
				child.traverse(callback)
			} else {
				callback(child)
			}
		}
	}

	/* 遍历可见元素 */
	traverseVisible(callback: (obj: ChildType) => void) {
		if (!this.visible) {
			return
		}
		callback(this)
		const { children } = this
		for (let child of children) {
			if (!child.visible) {
				continue
			}
			if (child instanceof Group) {
				child.traverse(callback)
			} else {
				callback(child)
			}
		}
	}

	/* 绘图 */
	drawShape(ctx: CanvasRenderingContext2D) {
		const { children } = this
		/* 绘制子对象 */
		for (let obj of children) {
			obj.draw(ctx)
		}
	}
}

type ChildType=Graph2D<Geometry|GeometryGroup,StandStyle>|Group

export { Group }

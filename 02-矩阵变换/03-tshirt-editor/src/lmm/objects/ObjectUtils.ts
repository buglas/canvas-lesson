import { Scene } from '../core/Scene'
import { Matrix3 } from '../math/Matrix3'
import { Vector2 } from '../math/Vector2'
import { Object2D } from './Object2D'

/* 基于矩阵创建路径 */
function crtPathByMatrix(
	ctx: CanvasRenderingContext2D,
	vertices: number[],
	matrix: Matrix3,
	closePath = false
) {
	const p0 = new Vector2(vertices[0], vertices[1]).applyMatrix3(matrix)
	ctx.moveTo(p0.x, p0.y)
	// console.log(p0)

	for (let i = 2, len = vertices.length; i < len; i += 2) {
		const pn = new Vector2(vertices[i], vertices[i + 1]).applyMatrix3(matrix)
		ctx.lineTo(pn.x, pn.y)
	}
	closePath && ctx.closePath()
}

/* 创建路径 */
function crtPath(
	ctx: CanvasRenderingContext2D,
	vertices: number[],
	closePath = false
) {
	const p0 = new Vector2(vertices[0], vertices[1])
	ctx.moveTo(p0.x, p0.y)
	for (let i = 2, len = vertices.length; i < len; i += 2) {
		const pn = new Vector2(vertices[i], vertices[i + 1])
		ctx.lineTo(pn.x, pn.y)
	}
	closePath && ctx.closePath()
}

/* 加载图像的Promise对象 */
function ImagePromise(image: HTMLImageElement) {
	return new Promise<HTMLImageElement>((resolve) => {
		image.onload = () => {
			resolve(image)
		}
	})
}

/* 图像的批量加载 */
function ImagePromises(images: HTMLImageElement[]) {
	return images.map((image) => ImagePromise(image))
}

/* 选择图案 */
function SelectObj(scene: Scene) {
	return function (objGroup: Object2D[], mp: Vector2): Object2D | null {
		for (let obj of [...objGroup].reverse()) {
			if (scene.isPointInObj(obj, mp, obj.pvmMatrix)) {
				return obj
			}
		}
		return null
	}
}

export { crtPath, crtPathByMatrix, ImagePromise, ImagePromises, SelectObj }

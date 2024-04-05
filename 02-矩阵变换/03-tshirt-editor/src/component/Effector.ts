import { Scene } from '../lmm/core/Scene'
import { Img2D } from '../lmm/objects/Img2D'
import { Vector2 } from '../lmm/math/Vector2'
import { ImagePromise } from '../lmm/objects/ObjectUtils'

/* 图案数据类型 */
type Img2DType = {
	src?: string
	globalCompositeOperation: GlobalCompositeOperation
}

class Effector {
	scene = new Scene()

	onMounted(effectDom: HTMLDivElement) {
		const {
			scene: { canvas },
		} = this
		const { clientWidth: fx, clientHeight: fy } = effectDom
		effectDom.append(canvas)
		canvas.width = fx
		canvas.height = fy
	}

	onUnmounted() {
		this.scene.canvas.remove()
	}

	/* 添加图案 */
	addImgs(effectImg2DData: Img2DType[], resultCanvas: HTMLCanvasElement) {
		const {
			scene: {
				canvas: { width },
			},
			scene,
		} = this
		const pros: Promise<HTMLImageElement>[] = []
		effectImg2DData.forEach(({ src, globalCompositeOperation }, index) => {
			let image: HTMLImageElement | HTMLCanvasElement = new Image()
			if (src) {
				image.src = src
				pros.push(ImagePromise(image))
			} else {
				image = resultCanvas
			}
			scene.add(
				new Img2D({
					size: new Vector2(width),
					offset: new Vector2(-width / 2),
					index,
					image,
					style: { globalCompositeOperation },
				})
			)
		})

		/* 渲染 */
		Promise.all(pros).then(() => {
			scene.render()
		})
	}

	/* 渲染 */
	render() {
		this.scene.render()
	}
}

export { Effector }

import { BasicStyle, BasicStyleType } from './BasicStyle'


/* 绘图方法顺序 */
export type MethodsType = 'fill'|'stroke'|'image'

export type StandStyleType = {
	strokeStyle?: string | CanvasGradient | CanvasPattern | undefined
	fillStyle?: string | CanvasGradient | CanvasPattern | undefined
	lineWidth?: number
	lineDash?: number[] | undefined
	lineDashOffset?: number
	lineCap?: CanvasLineCap
	lineJoin?: CanvasLineJoin
	miterLimit?: number
	order?: MethodsType[]
} & BasicStyleType

class StandStyle extends BasicStyle {
	strokeStyle: string | CanvasGradient | CanvasPattern | undefined
	fillStyle: string | CanvasGradient | CanvasPattern | undefined
	lineWidth: number = 1
	lineDash: number[] | undefined
	lineDashOffset: number = 0
	lineCap: CanvasLineCap = 'butt'
	lineJoin: CanvasLineJoin = 'miter'
	miterLimit: number = 10

	// 绘图顺序
	order: MethodsType[] = ['stroke','fill','image']

	constructor(attr: StandStyleType = {}) {
		super()
		this.setOption(attr)
	}

	/* 设置样式 */
	setOption(attr: StandStyleType = {}) {
		Object.assign(this, attr)
	}

	/* 应用样式 */
	apply(ctx: CanvasRenderingContext2D) {
		super.apply(ctx)
		const {
			fillStyle,
			strokeStyle,
			lineWidth,
			lineCap,
			lineJoin,
			miterLimit,
			lineDash,
			lineDashOffset,
		} = this

		if (strokeStyle) {
			ctx.strokeStyle = strokeStyle
			ctx.lineWidth = lineWidth
			ctx.lineCap = lineCap
			ctx.lineJoin = lineJoin
			ctx.miterLimit = miterLimit
			if (lineDash) {
				ctx.setLineDash(lineDash)
				ctx.lineDashOffset = lineDashOffset
			}
		}
		fillStyle && (ctx.fillStyle = fillStyle)
	}
}
export { StandStyle }

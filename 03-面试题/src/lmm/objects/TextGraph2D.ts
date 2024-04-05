import { Vector2 } from '../math/Vector2'
import { TextStyle, TextStyleType } from '../style/TextStyle'
import { Graph2D } from './Graph2D'
import { RectGeometry } from '../geometry/RectGeometry'
import { StandStyle } from '../style/StandStyle'

type MaxWidthType=number | undefined

/* 虚拟上下文对象 */
const virtuallyCtx = document
	.createElement('canvas')
	.getContext('2d') as CanvasRenderingContext2D

/* 文字对齐方式引起的偏移量 */
const alignRatio = {
	start: 0,
	left: 0,
	center: -0.5,
	end: -1,
	right: -1,
}
const baselineRatio = {
	top: 0,
	middle: -0.5,
	bottom: -1,
	hanging: -0.05,
	alphabetic: -0.78,
	ideographic: -1,
}

class TextGraph2D extends Graph2D<RectGeometry,TextStyle> {
	text:string=''
  offset:Vector2=new Vector2()
	maxWidth: MaxWidthType=undefined
  geometry:RectGeometry=new RectGeometry()
  style:TextStyle=new TextStyle()

	// 类型
	readonly isText = true
  constructor(text?:string,style?:TextStyle)
  constructor(text?:string,offset?:Vector2,style?:TextStyle)
  constructor(text?:string,offset?:Vector2,maxWidth?:MaxWidthType,style?:TextStyle)
	constructor(text?:string,offset?:Vector2|TextStyle,maxWidth?:MaxWidthType|TextStyle,style?:TextStyle) {
		super()
    const argLen=arguments.length
    if(!argLen){return}
    const argEnd=arguments[argLen-1]
    let end=argLen
    if(argEnd instanceof TextStyle){
      this.style=argEnd
      end-=1
    }
    for(let i=0;i<end;i++){
      this[['text','offset','maxWidth'][i]]=arguments[i]
    }
    this.update()
	}

	/* 文本尺寸 */
	get size(): Vector2 {
		const { style, maxWidth, width } = this
		let w = maxWidth === undefined ? width : Math.min(width, maxWidth)
		return new Vector2(w, style.fontSize)
	}

	get width(): number {
		const { style, text } = this
		style.setFont(virtuallyCtx)
		return virtuallyCtx.measureText(text).width
	}

  /* 更新几何体 */
  update(){
    const {geometry,size,style: { textAlign, textBaseline },offset}=this
    const geometryOffset=new Vector2(
      size.x * alignRatio[textAlign],
			size.y * baselineRatio[textBaseline]
    ).add(offset)
    geometry.size.copy(size)
    geometry.offset.copy(geometryOffset)
    geometry.updatePosition()
    geometry.computeBoundingBox()
  }


	/* 绘图 */
	drawShape(ctx: CanvasRenderingContext2D) {
		const {
			text,
			maxWidth,
			style,
      geometry,
      offset:{x,y}
		} = this

		//样式
		style.apply(ctx)

		// 绘图
		for (let method of style.order) {
			style[`${method}Style`] && ctx[`${method}Text`](text, x,y, maxWidth)
      geometry.crtPath(ctx)
		}
	}
}

export { TextGraph2D }

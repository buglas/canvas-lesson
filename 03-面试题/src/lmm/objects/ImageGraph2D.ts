import { Vector2 } from '../math/Vector2'
import { Graph2D } from './Graph2D'
import { RectGeometry } from '../geometry/RectGeometry'
import { StandStyle } from '../style/StandStyle'

type View = {
	x: number
	y: number
	width: number
	height: number
}

type ImageParam=CanvasImageSource|string
type ViewType=View|undefined

/* 
构造函数(几何体RectGeometry，图案样式ImageStyle)
ImageStyle
*/
class ImageGraph2D  extends Graph2D<RectGeometry,StandStyle>{
	image:CanvasImageSource  = new Image()
  offset:Vector2=new Vector2()
	size:Vector2=new Vector2(300,150)
	view: ViewType=undefined
  geometry:RectGeometry=new RectGeometry()

	// 类型
	readonly isImageGraph2D = true

  constructor(image?: ImageParam,style?:StandStyle);
  constructor(image?: ImageParam,offset?:Vector2,style?:StandStyle);
  constructor(image?: ImageParam,offset?:Vector2,size?:Vector2, style?:StandStyle);
  constructor(image?: ImageParam,offset?:Vector2,size?:Vector2, view?:ViewType, style?:StandStyle);
  constructor(image?: ImageParam,offset?:Vector2|StandStyle,size?:Vector2|StandStyle,view?:ViewType|StandStyle,style?:StandStyle) {
    super()
    const argLen=arguments.length
    if(!argLen){return}
    image&&this.setImage(image);
    const argEnd=arguments[argLen-1]
    let end=argLen
    if(argEnd instanceof StandStyle){
      this.style=argEnd
      end-=1
    }
    let keys=['image','offset','size','view']
    
    for(let i=1;i<end;i++){
      this[keys[i]]=arguments[i]
    }
    if(end<=2){
      this.updateSizeByImage()
    }
    this.update()

	}
  setImage(image: ImageParam){
    if(typeof image==='string'){
      const img=new Image()
      img.src=image
      this.image=img
    }else{
      this.image=image
    }
    return this
  }
  updateSizeByImage(){
    const {image}=this
    const width=('width' in image)&&(typeof image.width==='number')?image.width:300
    const height=('height' in image)&&(typeof image.height==='number')?image.height:150
    this.size=new Vector2(width,height)
  }

	/* 更新几何体 */
  update(){
    const {geometry,size,offset}=this
    geometry.size.copy(size)
    geometry.offset.copy(offset)
    geometry.updatePosition()
    geometry.computeBoundingBox()
  }

	/* 绘图 */
	drawShape(ctx: CanvasRenderingContext2D) {
		const { image,offset:{x,y}, size:{width,height},  view, style,geometry } = this
		//样式
		style.apply(ctx)
    // 是否需要创建路径
    let needCrtPath=true
		for (let method of style.order) {
      // 绘制图像
      if(method==='image'){
        if (view) {
          ctx.drawImage(
            image,
            view.x,
            view.y,
            view.width,
            view.height,
            x,
            y,
            width,
            height
          )
        } else {
          ctx.drawImage(image,x, y, width,height)
        }
      }else if(style[`${method}Style`]){
        // 创建路径
        if(needCrtPath){
          geometry.crtPath(ctx)
        }
        // 绘制路径
        ctx[method]()
        needCrtPath=false
      }
			
		}
	}
}

export { ImageGraph2D }

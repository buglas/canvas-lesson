import { Vector2 } from '../math/Vector2'
import { Object2D } from '../core/Object2D'
import { Matrix3 } from '../math/Matrix3'
import { MouseShape } from './MouseShape'
import { ControlFrame, State } from './ControlFrame'
import { Object2DTransformer } from './Object2DTransformer'

type TranformData = {
	position: Vector2
	rotate: number
	scale: Vector2
}

// change 事件
const _changeEvent = { type: 'change' }

class TransformControler extends Object2D {
	// 要控制的Object2D对象
	_obj: Object2D | null = null
	// 图案控制框
	frame = new ControlFrame()
	// 鼠标状态
	mouseState: State = null
	// 鼠标的裁剪坐标位
	clipMousePos = new Vector2()
	// 鼠标图案
	mouseShape = new MouseShape({
		vertives: this.frame.clipVertives,
		center: this.frame.clipCenter,
		mousePos: this.clipMousePos,
	})
	// 渲染顺序
	index = Infinity
	// 不受相机影响
	enableCamera = false

	// 控制状态
	controlState: State = null

	// 拖拽起始位与结束位
	dragStart = new Vector2()
	dragEnd = new Vector2()

	//拖拽起始位减基点
	start2Orign = new Vector2()
	//拖拽结束位减基点
	end2Orign = new Vector2()

	// alt 键是否按下
	_altKey = false
	// shift 键是否按下
	shiftKey = false

	/* 变换器 */
	transformer = new Object2DTransformer()

	// 父级pvm逆矩阵
	parentPvmInvert = new Matrix3()

	// 选中图案时的暂存数据，用于取消变换
	controlStage: TranformData = {
		position: new Vector2(),
		scale: new Vector2(1, 1),
		rotate: 0,
	}

	get obj() {
		return this._obj
	}
	set obj(val) {
		if (this._obj === val) {
			return
		}
		this._obj = val
		if (val) {
			this.frame.obj = val
			this.saveTransformData()
			this.transformer.setLocalMatrixDataByObject2D(val)
			this.dispatchEvent({ type: 'selected', obj: val })
		} else {
			this.mouseState = null
			this.controlState = null
		}
		this.dispatchEvent(_changeEvent)
	}

	get altKey() {
		return this._altKey
	}
	set altKey(val) {
		if (this._altKey === val) {
			return
		}
		this._altKey = val
		const { controlState } = this
		if (controlState) {
			// 清理相对变换
			this.transformer.clearRelativeMatrixData()
			// 重置基点
			this.setOrigin()
			// 设置起点到基点向量
			this.start2Orign.subVectors(
				this.dragStart,
				this.transformer.localPosition
			)
			// 终点到基点的向量
			this.end2Orign.subVectors(this.dragEnd, this.transformer.localPosition)
			// 重新变换
			this.relativeTransform(controlState)
		}

		this.dispatchEvent(_changeEvent)
	}

	/* 鼠标按下 */
	pointerdown(obj: Object2D | null, mp: Vector2) {
		if (!this.mouseState) {
			this.obj = obj
			if (!obj) {
				return
			}
		}
		// 更新鼠标裁剪坐标位
		this.clipMousePos.copy(mp)
		// 获取鼠标状态
		this.mouseState = this.frame.getMouseState(mp)
		// 更新parentPvmInvert
		const pvmInvert = this.obj?.parent?.pvmMatrix.invert()
		pvmInvert && this.parentPvmInvert.copy(pvmInvert)

		if (this.mouseState) {
			// 拖拽起始位(图案父级坐标系)
			this.dragStart.copy(mp.clone().applyMatrix3(this.parentPvmInvert))
			// 控制状态等于鼠标状态
			this.controlState = this.mouseState
			// 设置本地矩阵数据
			this.obj && this.transformer.setLocalMatrixDataByObject2D(this.obj)
			// 设置基点
			this.setOrigin()
			// 设置起点到基点向量
			this.start2Orign.subVectors(
				this.dragStart,
				this.transformer.localPosition
			)
		}
		this.dispatchEvent(_changeEvent)
	}

	/* 鼠标移动 */
	pointermove(mp: Vector2) {
		if (!this.obj) {
			return
		}
		const {
			end2Orign,
			dragEnd,
			clipMousePos,
			controlState,
			frame,
			transformer: { localPosition },
		} = this
		// 更新鼠标裁剪坐标位
		clipMousePos.copy(mp)

		if (controlState) {
			dragEnd.copy(mp.clone().applyMatrix3(this.parentPvmInvert))
			end2Orign.subVectors(dragEnd, localPosition)
			this.relativeTransform(controlState)
		} else {
			// 获取鼠标状态
			this.mouseState = frame.getMouseState(mp)
		}

		this.dispatchEvent(_changeEvent)
	}

	/* 当目标对象发生改变时更新控制框 */
	updateFrame() {
		this.obj?.computeBoundingBox()
	}

	/* 鼠标抬起 */
	pointerup() {
		const { obj, controlState, transformer } = this
		if (!obj || !controlState) {
			return
		}
		transformer.setLocalMatrixDataByObject2D(obj)
		transformer.clearRelativeMatrixData()
		this.controlState = null
		this.dispatchEvent(_changeEvent)
	}

	/* 键盘按下 */
	keydown(key: string, altKey: boolean, shiftKey: boolean) {
		this.shiftKey = shiftKey
		this.altKey = altKey
		if (this.obj) {
			switch (key) {
				case 'Escape':
					// 将选中图案时存储的图案变换数据controlStage 拷贝到图案中
					this.cancleTransform()
					// 图案置空
					this.obj = null
					break
				case 'Enter':
					// 图案置空
					this.obj = null
					break
				case 'Delete':
					this.obj.remove()
					this.obj = null
					break
			}
		}
		this.dispatchEvent(_changeEvent)
	}

	/* 键盘抬起 */
	keyup(altKey: boolean, shiftKey: boolean) {
		this.shiftKey = shiftKey
		this.altKey = altKey
		this.dispatchEvent(_changeEvent)
	}

	/* 相对变换 */
	relativeTransform(controlState: string) {
		const { transformer, start2Orign, dragStart, dragEnd, end2Orign, obj } =
			this
		const key = controlState + Number(this.shiftKey)
		if (!obj || !transformer[key]) {
			return
		}
		if (controlState === 'move') {
			transformer[key](dragStart, dragEnd)
		} else {
			transformer[key](start2Orign, end2Orign)
		}
		this.dispatchEvent({ type: 'transformed', obj })
	}

	/*  设置基点(图案父级坐标系) */
	setOrigin() {
		const {
			altKey,
			controlState,
			frame: { localCenter, localOpposite },
			transformer,
		} = this
		let curOrigin =
			altKey || controlState === 'rotate' ? localCenter : localOpposite
		transformer.setOrigin(curOrigin)
	}

	/* 存储本地模型矩阵的变换数据 */
	saveTransformData() {
		const { obj, controlStage } = this
		obj && this.passTransformData(obj, controlStage)
	}

	/* 取消变换，恢复图形变换前的状态 */
	cancleTransform() {
		const { obj, controlStage } = this
		obj && this.passTransformData(controlStage, obj)
	}

	/* 传递变换数据 */
	passTransformData(obj0: TranformData, obj1: TranformData) {
		const { position, scale, rotate } = obj0
		obj1.position.copy(position)
		obj1.scale.copy(scale)
		obj1.rotate = rotate
	}

	/* 绘图 */
	draw(ctx: CanvasRenderingContext2D) {
		const { obj } = this
		if (!obj) {
			return
		}
		const { frame, mouseShape, mouseState, controlState, transformer } = this

		// 设置本地模型矩阵
		controlState && obj.decomposeModelMatrix(transformer.matrix)

		/* 绘制外框 */
		frame.draw(ctx)
		/* 绘制鼠标图案 */
		mouseShape.draw(ctx, mouseState)

		/* 基点测试 */
		/* const {
			transformer: { localPosition },
		} = this
		ctx.save()
		ctx.fillRect(localPosition.x - 5, localPosition.y - 5, 10, 10)
		ctx.restore() */
	}
}

export { TransformControler }

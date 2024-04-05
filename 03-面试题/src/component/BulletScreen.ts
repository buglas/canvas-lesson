import { Scene } from "../lmm/core/Scene"
import { TextGraph2D } from "../lmm/objects/TextGraph2D"
import { TextStyle } from "../lmm/style/TextStyle"

type BulletDataType = {
	// 出现时间
	time: number
	// 文字内容
	text: string
}
class BulletScreen{
  // dom容器
  video:HTMLVideoElement
  // 视频初次播放的时间
  startTime=0
  // 视频最近一次播放的时间
  playTime=0
  // 视频最近一次暂停播放的时间
  pauseTime=0
  // 视频累计暂停的时间长度
  pauseTimeLen=0
  // 播放状态
  state:'pause'|'play'|'finish'='pause'
  // 文字尺寸
  fontSize=18
  // 文字样式
  textStyle=new TextStyle({
    fontSize:this.fontSize,
    fillStyle: '#fff',
    strokeStyle: '#000',
    lineWidth: 2,
    textBaseline: 'top',
  })
  // 弹幕速度,像素/ms
  velocity=0.1
  // 弹幕的行高,默认字体的1.5倍
  lineHeight=1.5
  // 弹幕的右间距,默认字体的2倍
  rightPadding=2
  // 弹药库
  magazine:TextGraph2D[]=[]
  // 弹药库中要装入弹夹的子弹的索引
  lastBulletIndex=0
  // 场景，弹药库中的子弹会在特定时间飞入场景，并在飞出屏幕时，从场景中删除
  scene=new Scene()
  // 动画帧，可在暂停视频时，取消动画帧的请求，从而实现弹幕的暂停
  frame=0

  constructor(video:HTMLVideoElement,data:BulletDataType[]=[]){
    this.video=video
    this.initScene(video)
    this.createBullets(data)
  }
  // 初始化场景
  initScene(video:HTMLVideoElement){
    const {clientWidth,clientHeight}=video
    const {scene:{camera,canvas}}=this
    // 时画布尺寸与视频一致
    canvas.width=clientWidth
    canvas.height=clientHeight
    // 将弹幕显示范围设置为[0,0]到[clientWidth,clientHeight]
    camera.position.set(clientWidth/2,clientHeight/2)
  }
  // 根据弹幕数据，创建子弹对象TextGraph2D，并将其放到弹药库magazine中。
  createBullets(data:BulletDataType[]){
    const {textStyle,video:{clientWidth:videoWidth},velocity,fontSize,lineHeight,rightPadding,magazine}=this
    // 弹道，存储每个弹道中最新加入的文字完全显示的时间
    const passes: number[] = []
    // 遍历子弹数据
    data.forEach(({ time, text }) => {
      // 建立文字对象
      const text2D = new TextGraph2D(text,textStyle)
      // 文字宽度
      const textWidth=text2D.width
      // 在文字对象上挂载其它文字相关的数据
      text2D.userData={
        // 文字开始显示时间，文字开始飞入屏幕
        startTime:time,
        // 文字结束显示时间，文字飞出屏幕时结束
        endTime:time+(videoWidth+textWidth)/velocity,
      }
      // 从0开始遍历文字的弹道，寻找有空位的弹道，然后将文字放到相应弹道中
      let i=0;
      const len=passes.length
      for (i; i < len; i++) {
        // 若当前文字的显示时间大于当前弹道中最新放入的文字的完全显示的时间，
        // 说明此弹道中可以放入当前文字
        if (time > passes[i]) {
          break;
        }
      }
      // 若没有有空位的弹道，再开一个新的弹道
      (len&&i===len-1)&&(i=len)
      // 根据弹道设置文字高度
      text2D.position.y = i * fontSize*lineHeight
      // 将当前文字完全显示到屏幕中的时间放到相应弹道中
      // 以便让后面的文字判断其是否可以显示于此弹道中
      passes[i]=time+(textWidth+rightPadding*fontSize)/velocity
      // 将文字添加到弹药库中，以便在特定时间射入scene场景
      magazine.push(text2D)
    })
  }

  // 播放
  play(){
    // 记录播放状态
    this.state='play'
    const now=new Date().getTime()
    // 初始播放时间
    this.playTime||(this.playTime=now)
    // 当前播放时间
    this.startTime=now
    // 记录暂停总时长
    this.pauseTime&&(this.pauseTimeLen+=now-this.pauseTime)
    // 让子弹飞
    this.shot()
  }

  // 暂停
  pause(){
    // 记录播放状态
    this.state='pause'
    // 记录暂停时间
    this.pauseTime=new Date().getTime()
    // 取消动画帧的请求
    cancelAnimationFrame(this.frame)
  }

  // 播放结束
  ended(){
    this.playTime=0
    this.startTime=0
    this.pauseTime=0
    this.pauseTimeLen=0
    this.lastBulletIndex=0
    // 清空场景
    this.scene.clear()
  }

  // 让子弹飞一会
  shot(){
    const {lastBulletIndex,magazine,playTime,pauseTimeLen,scene,video:{clientWidth}}=this
    // 视频播放的时长
    const playTimeLen=new Date().getTime()-playTime-pauseTimeLen
    // 若弹药库中有子弹，尝试将子弹射入scene场景
    if(lastBulletIndex<magazine.length-1){
      // 子弹
      const bullet=magazine[lastBulletIndex]
      // 子弹射出的时间
      const {userData:{startTime}}=bullet
      // 若当前子弹到了需要登场的时间
      if(playTimeLen>startTime){
        // 将子弹射入scene场景
        scene.add(bullet)
        // 记录弹药库中下一个要射出的子弹
        this.lastBulletIndex+=1
      }
    }
    
    // 让子弹飞
    scene.traverse(obj=>{
      const {scene,velocity}=this
      const {userData:{endTime,startTime}}=obj
      // 移动子弹，
      obj.position.x=clientWidth-(playTimeLen-startTime)*velocity
      // 若子弹飞出屏幕，从场景中删掉子弹
      if(playTimeLen>endTime){
        scene.remove(obj)
      }
    })
    // 渲染
    scene.render()
    // 请求动画帧
    this.frame=requestAnimationFrame(()=>{this.shot()})
  }
}

export {BulletScreen}
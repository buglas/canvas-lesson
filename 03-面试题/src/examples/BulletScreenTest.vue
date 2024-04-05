<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { randChar } from '../component/Utils'
import { BulletScreen } from '../component/BulletScreen'

// 获取父级属性
defineProps({
	size: { type: Object, default: { width: 0, height: 0 } },
})

const videoRef = ref<HTMLVideoElement>()
const canvasWrapperRef = ref<HTMLDivElement>()

/* 弹幕假数据 */
const bullets = Array.from({ length: 40 }, () => {
	return {
    // 显示时间
		time: Math.floor(Math.random() * 9000),
    // 文字内容-随机长度的字符串
		text: randChar(Math.random() * 10 + 3),
	}
}).sort((a, b) => {
  // 按显示时间排序
	return a.time - b.time
})

// 弹幕对象
let bulletScreen:BulletScreen

onMounted(() => {
	const video = videoRef.value
	const canvasWrapper = canvasWrapperRef.value
	if (video&&canvasWrapper) {
    // 实例化弹幕
    bulletScreen=new BulletScreen(video,bullets)
    // 将弹幕的canvas画布添加到canvas容器中
    canvasWrapper.append(bulletScreen.scene.canvas)
  }
})
</script>

<template>
	<div id="videoCont" >
    <!-- 视频 -->
		<video 
      controls
      name="media"
      width="640"
      ref="videoRef"
      @play="bulletScreen.play"
      @pause="bulletScreen.pause"
      @ended="bulletScreen.ended"
    >
      <source 
        src="https://yxyy-pandora.oss-cn-beijing.aliyuncs.com/canvas-lesson/move01.mp4" 
        type="video/mp4"
      >
    </video>
    <!-- 弹幕的canvas容器 -->
    <div id="canvasWrapper" ref="canvasWrapperRef"></div>
	</div>
</template>

<style scoped>
#videoCont {
	position: relative;
  display: flex;
  justify-content:center;
  margin-top: 36px;
}

#canvasWrapper {
	position: absolute;
  pointer-events: none;
}
</style>
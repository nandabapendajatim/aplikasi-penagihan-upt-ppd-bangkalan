<template>

<div>

  <div class="flex justify-between text-sm mb-1">
    <span>{{ label }}</span>
    <span>{{ kembali }} / {{ terima }}</span>
  </div>

  <div class="w-full bg-gray-200 rounded-full h-3">

    <div
      class="bg-green-500 h-3 rounded-full"
      :style="{width: percent + '%'}"
    ></div>

  </div>

</div>

</template>

<script setup>

const props = defineProps({
  label:String,
  terima:Number,
  kembali:Number
})

const percent = computed(()=>{

  if(!props.terima) return 0

  return Math.round(
    (props.kembali / props.terima) * 100
  )

})

</script>
<template>
  <transition name="fade">
    <div
      v-if="show"
      class="custom-alert"
      role="alert"
    >
      {{ message }} (closing in {{ countDown }}s)
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      default: '',
    },
    duration: {
      // lama alert tampil
      type: Number,
      default: 5,
    },
  },
  data() {
    return {
      show: false,
      countDown: this.duration,
      timer: null,
    }
  },
  watch: {
    message(newVal) {
      if (newVal) {
        this.show = true
        this.countDown = this.duration
        clearInterval(this.timer)
        this.timer = setInterval(() => {
          if (this.countDown > 1) {
            this.countDown--
          } else {
            this.closeAlert()
          }
        }, 1000)
      }
    },
  },
  methods: {
    closeAlert() {
      this.show = false
      clearInterval(this.timer)
    },
  },
}
</script>

<style scoped>
.custom-alert {
  background-color: #68dd0e;
  color: #ffffff;
  border: 1px solid #f5c2c7;
  padding: 12px 16px;
  border-radius: 6px;
  margin: 10px auto;
  width: 80%;
}

/* animasi fade */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

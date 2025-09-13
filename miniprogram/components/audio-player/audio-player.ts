// components/audio-player/audio-player.ts
Component({
  properties: {
    currentTrack: {
      type: Object,
      value: {}
    },
    isPlaying: {
      type: Boolean,
      value: false
    },
    progress: {
      type: Number,
      value: 0
    },
    currentTime: {
      type: Number,
      value: 0
    },
    duration: {
      type: Number,
      value: 0
    }
  },

  data: {
    isVisible: true
  },

  methods: {
    show() {
      this.setData({ isVisible: true });
    },

    hide() {
      this.setData({ isVisible: false });
    },

    togglePlay() {
      this.triggerEvent('toggleplay');
    },

    updateProgress(progress: number) {
      this.setData({ progress });
    },

    updateTrack(track: any) {
      this.setData({ currentTrack: track });
    },

    updatePlayingState(isPlaying: boolean) {
      this.setData({ isPlaying });
    },

    updateTime(currentTime: number, duration: number) {
      console.log('Audio player time update:', { currentTime, duration });
      this.setData({ 
        currentTime, 
        duration,
        progress: duration > 0 ? (currentTime / duration) * 100 : 0
      });
    },

    // 格式化时间显示 (mm:ss)
    formatTime(seconds: number): string {
      if (!seconds || seconds <= 0) return '00:00';
      
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }
})
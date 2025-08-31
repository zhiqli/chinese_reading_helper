// detail.ts
Page({
  data: {
    title: '',
    content: '',
    author: '',
    lessonNumber: '',
    audio: '',
    showVideoPlayer: false
  },

  onLoad(options: any) {
    // 从路径参数中获取课文信息
    const { title, content, author, lessonNumber, audio } = options;
    
    this.setData({
      title: decodeURIComponent(title || ''),
      content: decodeURIComponent(content || ''),
      author: decodeURIComponent(author || ''),
      lessonNumber: decodeURIComponent(lessonNumber || ''),
      audio: decodeURIComponent(audio || '')
    });

    // 设置页面标题
    wx.setNavigationBarTitle({
      title: this.data.title || '课文详情'
    });

    // 如果有音频，自动播放
    if (this.data.audio) {
      setTimeout(() => {
        this.playAudio();
      }, 500);
    }
  },

  // 播放音频
  playAudio() {
    if (this.data.audio) {
      console.log('播放音频:', this.data.audio);
      
      // 检查是否为m3u8格式
      const isM3u8 = this.data.audio.includes('.m3u8');
      
      if (isM3u8) {
        console.log('检测到HLS流媒体格式(.m3u8)，尝试多种播放方式');
        this.playM3u8Audio();
      } else {
        this.playRegularAudio();
      }
      
    } else {
      wx.showToast({
        title: '暂无音频',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 播放M3U8格式音频
  playM3u8Audio() {
    console.log('尝试播放M3U8音频');
    
    // 方法1: 尝试使用背景音频管理器
    const backgroundAudioManager = wx.getBackgroundAudioManager();
    backgroundAudioManager.title = this.data.title || '课文朗读';
    backgroundAudioManager.singer = this.data.author || '未知';
    backgroundAudioManager.src = this.data.audio;
    
    wx.showToast({
      title: '尝试播放HLS音频',
      icon: 'none',
      duration: 2000
    });
    
    let playbackStarted = false;
    
    backgroundAudioManager.onPlay(() => {
      console.log('M3U8音频开始播放');
      playbackStarted = true;
      wx.showToast({
        title: '播放成功',
        icon: 'success',
        duration: 1500
      });
    });
    
    backgroundAudioManager.onError((bgError) => {
      console.error('M3U8播放错误:', bgError);
      
      if (!playbackStarted) {
        console.log('背景音频失败，尝试video组件');
        this.tryVideoPlayback();
      }
    });
    
    // 3秒后如果还没开始播放，尝试video组件
    setTimeout(() => {
      if (!playbackStarted) {
        console.log('背景音频超时，尝试video组件');
        this.tryVideoPlayback();
      }
    }, 3000);
  },

  // 尝试使用video组件播放
  tryVideoPlayback() {
    console.log('使用video组件尝试播放HLS');
    
    this.setData({
      showVideoPlayer: true
    }, () => {
      // 获取video组件并播放
      const videoContext = wx.createVideoContext('audioVideo', this);
      
      setTimeout(() => {
        videoContext.play();
        
        wx.showToast({
          title: '尝试video播放',
          icon: 'none',
          duration: 2000
        });
      }, 500);
    });
  },

  // video播放成功
  onVideoPlay() {
    console.log('Video组件播放成功');
    wx.showToast({
      title: 'HLS播放成功',
      icon: 'success',
      duration: 2000
    });
  },

  // video播放失败
  onVideoError(e: any) {
    console.error('Video组件播放失败:', e.detail);
    
    // 隐藏video组件
    this.setData({
      showVideoPlayer: false
    });
    
    // 显示最终的错误提示
    wx.showModal({
      title: '播放失败',
      content: '当前音频为HLS格式，小程序支持有限。建议:\n1. 在真机上测试\n2. 联系开发者转换为MP3格式\n3. 复制链接在浏览器中播放',
      showCancel: true,
      cancelText: '取消',
      confirmText: '复制链接',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: this.data.audio,
            success: () => {
              wx.showToast({
                title: '链接已复制',
                icon: 'success'
              });
            }
          });
        }
      }
    });
  },

  // 播放普通音频
  playRegularAudio() {
    const audioContext = wx.createInnerAudioContext();
    audioContext.src = this.data.audio;
    audioContext.autoplay = true;
    
    wx.showToast({
      title: '开始播放',
      icon: 'success',
      duration: 1500
    });
    
    audioContext.onPlay(() => {
      console.log('音频开始播放');
    });
    
    audioContext.onError((error) => {
      console.error('音频播放错误:', error);
      
      // 降级到背景音频管理器
      const backgroundAudioManager = wx.getBackgroundAudioManager();
      backgroundAudioManager.title = this.data.title || '课文朗读';
      backgroundAudioManager.singer = this.data.author || '未知';
      backgroundAudioManager.src = this.data.audio;
      
      backgroundAudioManager.onError((bgError) => {
        console.error('背景音频播放错误:', bgError);
        wx.showToast({
          title: '播放失败，请检查网络',
          icon: 'none',
          duration: 2000
        });
      });
    });
    
    audioContext.onEnded(() => {
      audioContext.destroy();
    });
  },

  // 返回按钮
  onBack() {
    // 停止音频播放
    const backgroundAudioManager = wx.getBackgroundAudioManager();
    backgroundAudioManager.stop();
    
    // 隐藏video组件
    if (this.data.showVideoPlayer) {
      this.setData({
        showVideoPlayer: false
      });
    }
    
    wx.navigateBack();
  }
});
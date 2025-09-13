// detail.ts
console.log('=== detail.ts 文件加载 ===');
Page({
  data: {
    title: '',
    content: '',
    author: '',
    lessonNumber: '',
    audio: '',
    showVideoPlayer: false,
    progress: 0,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    audioContext: null as any,
    updateTimer: null as any
  },

  onLoad(options: any) {
    console.log('=== 详情页 onLoad ===');
    console.log('参数 options:', options);
    
    // 从路径参数中获取课文信息
    const { title, content, author, lessonNumber, audio } = options;
    console.log('原始参数 - title:', title, 'audio:', audio);
    
    this.setData({
      title: decodeURIComponent(title || ''),
      content: decodeURIComponent(content || ''),
      author: decodeURIComponent(author || ''),
      lessonNumber: decodeURIComponent(lessonNumber || ''),
      audio: decodeURIComponent(audio || '')
    });
    
    // 启用分享功能
    this.enableSharing();

    console.log('页面数据初始化完成:', {
      title: this.data.title,
      audio: this.data.audio,
      hasAudio: !!this.data.audio,
      audioLength: this.data.audio ? this.data.audio.length : 0
    });

    // 设置页面标题
    wx.setNavigationBarTitle({
      title: this.data.title || '课文详情'
    });

    // 检查页面数据状态
    this.checkPageState();

    // 如果有音频，检查是否有保存的播放状态
    console.log('检查音频条件 - this.data.audio:', this.data.audio);
    console.log('!!this.data.audio:', !!this.data.audio);
    
    if (this.data.audio) {
      console.log('检测到音频文件，开始初始化音频播放');
      
      // 检查是否有保存的播放状态
      const savedPlaybackState = wx.getStorageSync('detailPlaybackState');
      console.log('本地存储的播放状态:', savedPlaybackState);
      
      if (savedPlaybackState && savedPlaybackState.audio === this.data.audio) {
        console.log('恢复详情页播放状态:', savedPlaybackState);
        this.setData({
          progress: savedPlaybackState.progress || 0,
          currentTime: savedPlaybackState.currentTime || 0,
          duration: savedPlaybackState.duration || 0,
          isPlaying: false // 先暂停状态，等待用户操作
        });
        console.log('恢复后的页面状态:', this.data);
      } else {
        console.log('没有保存的播放状态，准备自动播放');
        // 没有保存的状态，自动播放
        setTimeout(() => {
          console.log('开始自动播放音频');
          this.playAudio();
        }, 500);
      }
      
      // 设置音频状态监听
      console.log('设置音频状态监听器');
      this.setupAudioListeners();
      
      // 检查初始状态
      setTimeout(() => {
        this.checkPageState();
      }, 1000);
    } else {
      console.log('没有音频文件，跳过音频初始化');
    }
  },

  // 页面卸载时停止播放
  onUnload() {
    this.stopAllPlayback();
    // 停止定时器
    this.stopProgressUpdate();
    
    // 恢复默认音频选项
    wx.setInnerAudioOption({
      obeyMuteSwitch: true
    });
  },
  
  // 页面隐藏时（切入后台）保持播放
  onHide() {
    console.log('页面切入后台，保持音频播放状态');
  },
  
  // 页面显示时（从后台返回）恢复状态
  onShow() {
    console.log('页面从后台返回，检查音频状态');
    // 检查背景音频管理器状态并同步页面状态
    const backgroundAudioManager = wx.getBackgroundAudioManager();
    console.log('背景音频管理器状态:', {
      src: backgroundAudioManager.src,
      paused: backgroundAudioManager.paused,
      currentTime: backgroundAudioManager.currentTime
    });
    
    if (backgroundAudioManager.src && backgroundAudioManager.src === this.data.audio) {
      this.setData({
        isPlaying: !backgroundAudioManager.paused,
        currentTime: backgroundAudioManager.currentTime || 0
      });
      console.log('从后台返回，同步播放状态:', !backgroundAudioManager.paused);
    }
    
    // 启用分享功能
    this.enableSharing();
  },

  // 启用分享功能
  enableSharing() {
    // 启用转发给朋友
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    
    // 单独启用分享到朋友圈
    if (wx.enableShareTimeline) {
      wx.enableShareTimeline();
    }
    
    console.log('分享功能已启用');
  },

  // 分享给好友
  onShareAppMessage() {
    return {
      title: `${this.data.title} - 课文朗读`,
      path: `/pages/detail/detail?title=${encodeURIComponent(this.data.title)}&content=${encodeURIComponent(this.data.content)}&author=${encodeURIComponent(this.data.author)}&lessonNumber=${encodeURIComponent(this.data.lessonNumber)}&audio=${encodeURIComponent(this.data.audio || '')}`,
      imageUrl: 'https://mmbiz.qpic.cn/mmbiz_png/4MBNKq9XibX6bJf5f5v8X2X6bJf5f5v8X2X6bJf5f5v8X2X6bJf5f5v8X2X6bJf5f5v8X2X6bJf5f5v8X2X/0?wx_fmt=png'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: `${this.data.title} - 课文朗读`,
      query: `title=${encodeURIComponent(this.data.title)}&content=${encodeURIComponent(this.data.content)}&author=${encodeURIComponent(this.data.author)}&lessonNumber=${encodeURIComponent(this.data.lessonNumber)}`,
      imageUrl: 'https://mmbiz.qpic.cn/mmbiz_png/4MBNKq9XibX6bJf5f5v8X2X6bJf5f5v8X2X6bJf5f5v8X2X6bJf5f5v8X2X6bJf5f5v8X2X6bJf5f5v8X2X/0?wx_fmt=png'
    };
  },

  // 播放音频
  playAudio() {
    console.log('=== playAudio 调用 ===');
    console.log('this.data.audio:', this.data.audio);
    console.log('!!this.data.audio:', !!this.data.audio);
    
    if (this.data.audio) {
      console.log('播放音频:', this.data.audio);
      
      // 检查是否为m3u8格式
      const isM3u8 = this.data.audio.includes('.m3u8');
      console.log('音频格式检测 - isM3u8:', isM3u8);
      
      if (isM3u8) {
        console.log('检测到HLS流媒体格式(.m3u8)，尝试多种播放方式');
        this.playM3u8Audio();
      } else {
        console.log('普通音频格式，使用常规播放方式');
        this.playRegularAudio();
      }
      
    } else {
      console.log('没有音频文件，显示提示');
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
    
    // 停止任何现有的音频播放
    this.stopAllPlayback();
    
    // 方法1: 尝试使用背景音频管理器
    const backgroundAudioManager = wx.getBackgroundAudioManager();
    backgroundAudioManager.title = this.data.title || '课文朗读';
    backgroundAudioManager.singer = this.data.author || '未知';
    backgroundAudioManager.src = this.data.audio;
    // 背景音频管理器默认会忽略静音开关，但我们可以确保音量足够大
    backgroundAudioManager.volume = 1.0;
    
    // 设置初始播放状态
    this.setData({
      isPlaying: true
    });
    
    wx.showToast({
      title: '尝试播放HLS音频',
      icon: 'none',
      duration: 2000
    });
    
    let playbackStarted = false;
    
    backgroundAudioManager.onPlay(() => {
      console.log('M3U8音频开始播放');
      playbackStarted = true;
      this.setData({
        isPlaying: true
      });
      wx.showToast({
        title: '播放成功',
        icon: 'success',
        duration: 1500
      });
    });
    
    backgroundAudioManager.onError((bgError) => {
      console.error('M3U8播放错误:', bgError);
      this.setData({
        isPlaying: false
      });
      
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
      showVideoPlayer: true,
      isPlaying: true
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
    this.setData({
      isPlaying: true
    });
    wx.showToast({
      title: 'HLS播放成功',
      icon: 'success',
      duration: 2000
    });
  },

  // video播放失败
  onVideoError(e: any) {
    console.error('Video组件播放失败:', e.detail);
    
    // 隐藏video组件并重置播放状态
    this.setData({
      showVideoPlayer: false,
      isPlaying: false
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
    console.log('=== playRegularAudio 开始 ===');
    console.log('音频URL:', this.data.audio);
    
    // 停止任何现有的音频播放
    this.stopAllPlayback();
    
    // 使用背景音频管理器播放
    console.log('使用背景音频管理器播放...');
    const backgroundAudioManager = wx.getBackgroundAudioManager();
    
    // 先设置事件监听器
    console.log('设置背景音频事件监听器...');
    
    backgroundAudioManager.onPlay(() => {
      console.log('背景音频开始播放');
      this.setData({
        isPlaying: true
      });
    });
    
    backgroundAudioManager.onPause(() => {
      console.log('背景音频暂停');
      this.setData({
        isPlaying: false
      });
    });
    
    backgroundAudioManager.onStop(() => {
      console.log('背景音频停止');
      this.setData({
        isPlaying: false
      });
    });
    
    backgroundAudioManager.onEnded(() => {
      console.log('背景音频播放结束');
      this.setData({
        isPlaying: false,
        progress: 0,
        currentTime: 0
      });
    });
    
    backgroundAudioManager.onError((error) => {
      console.error('背景音频播放错误:', error);
      this.setData({
        isPlaying: false
      });
    });
    
    // 配置音频信息 - 确保所有必要字段都设置
    backgroundAudioManager.title = this.data.title || '课文朗读';
    backgroundAudioManager.singer = this.data.author || '未知';
    backgroundAudioManager.src = this.data.audio;
    backgroundAudioManager.startTime = this.data.currentTime || 0;
    backgroundAudioManager.epname = '语文课文朗读'; // 专辑名称
    backgroundAudioManager.coverImgUrl = 'https://mmbiz.qpic.cn/mmbiz_png/4MBNKq9XibX6bJf5f5v8X2X6bJf5f5v8X2X6bJf5f5v8X2X6bJf5f5v8X2X6bJf5f5v8X2X6bJf5f5v8X2X/0?wx_fmt=png'; // 有效的封面图URL
    
    console.log('背景音频管理器配置完成:', {
      title: backgroundAudioManager.title,
      singer: backgroundAudioManager.singer,
      src: backgroundAudioManager.src,
      startTime: backgroundAudioManager.startTime,
      epname: backgroundAudioManager.epname,
      coverImgUrl: backgroundAudioManager.coverImgUrl
    });
    
    // 设置音频播放选项 - 忽略静音开关
    console.log('设置音频播放选项 - 忽略静音开关...');
    wx.setInnerAudioOption({
      obeyMuteSwitch: false
    });
    
    // 设置初始播放状态
    this.setData({
      isPlaying: true
    });
    
    // 立即开始播放 - 使用play()方法明确开始播放
    console.log('立即开始播放背景音频...');
    setTimeout(() => {
      backgroundAudioManager.play();
      console.log('已调用backgroundAudioManager.play()');
    }, 100);
    
    wx.showToast({
      title: '开始播放',
      icon: 'success',
      duration: 1500
    });
    
    console.log('playRegularAudio完成，等待音频开始播放...');
  },

  // 切换播放状态
  togglePlay() {
    console.log('切换播放状态，当前状态:', {
      audio: this.data.audio,
      isPlaying: this.data.isPlaying,
      currentTime: this.data.currentTime,
      duration: this.data.duration
    });
    
    if (!this.data.audio) return;
    
    // 处理背景音频管理器
    const backgroundAudioManager = wx.getBackgroundAudioManager();
    console.log('使用背景音频管理器，当前状态:', {
      src: backgroundAudioManager.src,
      paused: backgroundAudioManager.paused,
      currentTime: backgroundAudioManager.currentTime
    });
    
    if (this.data.isPlaying) {
      // 暂停播放
      console.log('暂停背景音频播放');
      backgroundAudioManager.pause();
    } else {
      // 如果背景音频管理器没有在播放，需要重新初始化
      if (backgroundAudioManager.src !== this.data.audio) {
        console.log('重新初始化背景音频播放');
        backgroundAudioManager.title = this.data.title || '课文朗读';
        backgroundAudioManager.singer = this.data.author || '未知';
        backgroundAudioManager.src = this.data.audio;
        backgroundAudioManager.startTime = this.data.currentTime || 0;
      }
      // 继续播放
      console.log('继续背景音频播放');
      backgroundAudioManager.play();
    }
  },

  // 返回按钮
  onBack() {
    // 停止所有音频播放
    this.stopAllPlayback();
    
    wx.navigateBack();
  },

  // 设置音频监听器
  setupAudioListeners() {
    const backgroundAudioManager = wx.getBackgroundAudioManager();
    
    // 监听播放开始
    backgroundAudioManager.onPlay(() => {
      this.setData({
        isPlaying: true
      });
      console.log('音频开始播放');
    });
    
    // 监听播放暂停
    backgroundAudioManager.onPause(() => {
      this.setData({
        isPlaying: false
      });
      console.log('音频暂停');
    });
    
    // 监听播放结束
    backgroundAudioManager.onEnded(() => {
      this.setData({
        isPlaying: false,
        progress: 0,
        currentTime: 0,
        duration: 0
      });
      console.log('音频播放结束');
    });
    
    // 监听时间更新
    backgroundAudioManager.onTimeUpdate(() => {
      const currentTime = backgroundAudioManager.currentTime;
      // 如果duration为0，尝试从backgroundAudioManager获取
      const effectiveDuration = this.data.duration > 0 ? this.data.duration : (backgroundAudioManager.duration || 0);
      const progress = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;
      
      console.log('背景音频时间更新 - currentTime:', currentTime, 'duration:', effectiveDuration, 'progress:', progress);
      
      this.setData({
        progress,
        currentTime,
        duration: effectiveDuration > 0 ? effectiveDuration : this.data.duration
      });
      
      // 保存播放状态
      this.savePlaybackState();
    });
    
    // 监听音频加载完成，获取总时长
    backgroundAudioManager.onCanplay(() => {
      const duration = backgroundAudioManager.duration;
      if (duration > 0 && this.data.duration === 0) {
        this.setData({
          duration
        });
        console.log('背景音频总时长:', duration);
      }
    });
    
    // 监听播放错误
    backgroundAudioManager.onError((error) => {
      console.error('背景音频播放错误:', error);
      this.setData({
        isPlaying: false
      });
    });
    
    // 如果背景音频管理器已经有音频源，尝试获取总时长
    if (backgroundAudioManager.src && backgroundAudioManager.duration > 0 && this.data.duration === 0) {
      this.setData({
        duration: backgroundAudioManager.duration
      });
      console.log('初始化时获取背景音频总时长:', backgroundAudioManager.duration);
    }
  },

  // 格式化时间显示 (mm:ss)
  formatTime(seconds: number): string {
    console.log('格式化时间:', seconds);
    
    if (!seconds || seconds <= 0) return '00:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
    const secsStr = secs < 10 ? `0${secs}` : `${secs}`;
    const result = `${minsStr}:${secsStr}`;
    console.log('格式化结果:', result);
    
    return result;
  },

  // 启动定时器更新进度
  startProgressUpdate() {
    console.log('启动进度更新定时器');
    
    // 先清除现有的定时器
    this.stopProgressUpdate();
    
    this.data.updateTimer = setInterval(() => {
      console.log('定时器执行 - isPlaying:', this.data.isPlaying, 'audioContext:', !!this.data.audioContext);
      
      if (this.data.isPlaying && this.data.audioContext) {
        const currentTime = this.data.audioContext.currentTime;
        const progress = this.data.duration > 0 ? (currentTime / this.data.duration) * 100 : 0;
        
        console.log('定时器更新 - currentTime:', currentTime, 'duration:', this.data.duration, 'progress:', progress);
        
        this.setData({
          progress,
          currentTime
        });
        
        // 保存播放状态
        this.savePlaybackState();
      } else {
        console.log('定时器条件不满足，跳过更新');
      }
    }, 1000); // 每秒更新一次
    
    console.log('定时器已启动:', this.data.updateTimer);
  },

  // 停止定时器
  stopProgressUpdate() {
    if (this.data.updateTimer) {
      console.log('停止进度更新定时器:', this.data.updateTimer);
      clearInterval(this.data.updateTimer);
      this.data.updateTimer = null;
    } else {
      console.log('没有活动的定时器需要停止');
    }
  },

  // 检查页面数据状态
  checkPageState() {
    console.log('=== 页面数据状态检查 ===');
    console.log('音频文件:', this.data.audio);
    console.log('播放状态:', this.data.isPlaying);
    console.log('当前时间:', this.data.currentTime);
    console.log('总时长:', this.data.duration);
    console.log('进度:', this.data.progress + '%');
    console.log('音频上下文:', this.data.audioContext);
    console.log('定时器:', this.data.updateTimer);
    console.log('========================');
  },

  // 保存播放状态
  savePlaybackState() {
    try {
      const playbackState = {
        audio: this.data.audio,
        progress: this.data.progress,
        currentTime: this.data.currentTime,
        duration: this.data.duration,
        isPlaying: this.data.isPlaying
      };
      
      wx.setStorageSync('detailPlaybackState', playbackState);
      console.log('详情页播放状态已保存');
    } catch (error) {
      console.error('保存详情页播放状态失败:', error);
    }
  },

  // 停止所有播放
  stopAllPlayback() {
    console.log('停止所有音频播放...');
    
    try {
      // 停止背景音频
      const backgroundAudioManager = wx.getBackgroundAudioManager();
      console.log('停止背景音频管理器...');
      backgroundAudioManager.stop();
      
      // 移除所有事件监听器
      backgroundAudioManager.onPlay(() => {});
      backgroundAudioManager.onPause(() => {});
      backgroundAudioManager.onStop(() => {});
      backgroundAudioManager.onEnded(() => {});
      backgroundAudioManager.onError(() => {});
      
      console.log('背景音频事件监听器已移除');
    } catch (error) {
      console.error('停止背景音频时出错:', error);
    }
    
    // 停止内部音频上下文
    if (this.data.audioContext) {
      console.log('停止内部音频上下文...');
      this.data.audioContext.stop();
      this.data.audioContext.destroy();
      this.data.audioContext = null;
    }
    
    // 隐藏video组件
    if (this.data.showVideoPlayer) {
      this.setData({
        showVideoPlayer: false
      });
    }
    
    // 重置播放状态
    this.setData({
      isPlaying: false,
      progress: 0,
      currentTime: 0,
      duration: 0
    });

    // 清除保存的播放状态
    wx.removeStorageSync('detailPlaybackState');
    
    // 停止定时器
    this.stopProgressUpdate();
    
    console.log('已停止所有音频播放并清除状态');
  }
});
// detail.ts
Page({
  data: {
    title: '',
    content: '',
    author: '',
    lessonNumber: '',
    audio: ''
  },

  onLoad(options: any) {
    console.log('=== 详情页 onLoad ===');

    // 从路径参数中获取课文信息
    const { title, content, author, lessonNumber, audio } = options;

    this.setData({
      title: decodeURIComponent(title || ''),
      content: decodeURIComponent(content || ''),
      author: decodeURIComponent(author || ''),
      lessonNumber: decodeURIComponent(lessonNumber || ''),
      audio: decodeURIComponent(audio || '')
    });

    // 启用分享功能
    this.enableSharing();

    // 设置页面标题
    wx.setNavigationBarTitle({
      title: this.data.title || '课文详情'
    });

    console.log('详情页不处理音频播放，保持首页播放状态');
  },

  // 页面卸载时不停止播放，保持首页播放状态
  onUnload() {
    console.log('详情页卸载，保持首页音频播放状态');
  },

  // 页面隐藏时（切入后台）保持播放
  onHide() {
    console.log('页面切入后台，保持音频播放状态');
  },

  // 页面显示时（从后台返回）
  onShow() {
    console.log('页面从后台返回');
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

  // 返回按钮
  onBack() {
    console.log('返回首页，保持音频播放状态');
    wx.navigateBack();
  }
});
// index.ts
console.log('=== index.ts 文件加载 ===');
// 获取应用实例
const app = getApp<IAppOption>()

// 文章数据类型定义
interface Article {
  lesson_number: string;
  title: string;
  author: string;
  reader: string;
  content: string;
  audio_url: string;
  detail_url: string;
  grade: string;
  semester: string;
  emoji: string;
}

interface DisplayArticle {
  title: string;
  fullTitle: string;
  color: string;
  darkColor: string;
  emoji: string;
  audio: string;
  content: string;
  lessonNumber: string;
  author: string;
  reader: string;
  detailUrl: string;
  grade: string;
  semester: string;
}



// 生成颜色的函数
function generateColor(index: number): { color: string, darkColor: string } {
  const colors = [
    { color: '#E8F5E8', darkColor: '#C8E6C9' }, // 淡绿
    { color: '#E3F2FD', darkColor: '#BBDEFB' }, // 淡蓝
    { color: '#F3E5F5', darkColor: '#E1BEE7' }, // 淡紫
    { color: '#FFF3E0', darkColor: '#FFE0B2' }, // 淡橙
    { color: '#E8EAF6', darkColor: '#C5CAE9' }, // 淡靛
    { color: '#F1F8E9', darkColor: '#DCEDC8' }, // 淡青绿
    { color: '#FFFDE7', darkColor: '#FFF9C4' }, // 淡黄
    { color: '#E0F7FA', darkColor: '#B2EBF2' }, // 淡青
    { color: '#F9FBE7', darkColor: '#F0F4C3' }, // 淡柠檬
    { color: '#EFEBE9', darkColor: '#D7CCC8' }, // 淡灰褐
    { color: '#ECEFF1', darkColor: '#CFD8DC' }, // 淡灰蓝
    { color: '#FAFAFA', darkColor: '#F5F5F5' }, // 淡白
    { color: '#E8F5E9', darkColor: '#C8E6C9' }, // 淡薄荷
    { color: '#E0F2F1', darkColor: '#B2DFDB' }, // 淡青绿2
    { color: '#FFF8E1', darkColor: '#FFECB3' }, // 淡香槟
    { color: '#F5F5F5', darkColor: '#EEEEEE' }, // 淡灰
    { color: '#EDE7F6', darkColor: '#D1C4E9' }, // 淡薰衣草
    { color: '#E8EAF6', darkColor: '#C5CAE9' }, // 淡靛蓝
    { color: '#FFEBEE', darkColor: '#FFCDD2' }, // 淡粉红
    { color: '#F3E5F5', darkColor: '#E1BEE7' }, // 淡紫罗兰
    { color: '#E8F5E8', darkColor: '#C8E6C9' }, // 淡草绿
    { color: '#FFF3E0', darkColor: '#FFE0B2' }, // 淡杏色
    { color: '#E0F7FA', darkColor: '#B2EBF2' }, // 淡天蓝
    { color: '#F1F8E9', darkColor: '#DCEDC8' }, // 淡苹果绿
    { color: '#FFFDE7', darkColor: '#FFF9C4' }, // 淡奶油
    { color: '#EFEBE9', darkColor: '#D7CCC8' }, // 淡米色
    { color: '#ECEFF1', darkColor: '#CFD8DC' }, // 淡银灰
    { color: '#FAFAFA', darkColor: '#F5F5F5' }, // 淡雪白
    { color: '#E0F2F1', darkColor: '#B2DFDB' }, // 淡水绿
    { color: '#FCE4EC', darkColor: '#F8BBD0' }, // 淡玫瑰粉
    { color: '#E8EAF6', darkColor: '#C5CAE9' }, // 淡紫灰
    { color: '#FFF9C4', darkColor: '#FFF59D' }, // 淡金丝雀
    { color: '#E1F5FE', darkColor: '#B3E5FC' }, // 淡冰蓝
    { color: '#F1F8E9', darkColor: '#DCEDC8' }, // 淡春绿
    { color: '#FFF3E0', darkColor: '#FFE0B2' }, // 淡桃色
    { color: '#E8F5E8', darkColor: '#C8E6C9' }, // 淡嫩绿
    { color: '#F3E5F5', darkColor: '#E1BEE7' }, // 淡丁香紫
    { color: '#FFFDE7', darkColor: '#FFF9C4' }, // 淡象牙
    { color: '#E0F7FA', darkColor: '#B2EBF2' }, // 淡湖蓝
    { color: '#F9FBE7', darkColor: '#F0F4C3' }  // 淡柠檬黄
  ]
  return colors[index % colors.length]
}

Component({
  data: {
    currentTab: 'chinese', // 当前选中的标签页
    grades: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
    semesters: ['上学期', '下学期'],
    gradeIndex: 0, // 默认一年级
    semesterIndex: 0, // 默认上学期
    articles: [] as DisplayArticle[],
    allArticles: [] as Article[], // 存储所有文章数据
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    currentTime: 0,
    duration: 0
  },

  lifetimes: {
    attached() {
      console.log('页面初始化，当前数据状态:', this.data);
      // 先加载用户偏好，再加载数据
      this.loadUserPreferences();
      // 延迟一下确保 setData 完成
      setTimeout(() => {
        console.log('延迟后的数据状态:', this.data);
        this.loadArticlesData();
        
        // 检查是否有上次播放的记录，如果有则恢复播放
        this.restorePlayback();
      }, 100);
      
      // 启用分享功能
      this.enableSharing();
    }
  },

  // 分享给好友
  onShareAppMessage() {
    return {
      title: '朗朗书声 - 中小学语文课文朗读',
      path: '/pages/index/index',
      imageUrl: 'https://mmbiz.qpic.cn/mmbiz_png/4MBNKq9XibX6bJf5f5v8X2X6bJf5f5v8X2X6bJf5f5v8X2X6bJf5f5v8X2X6bJf5f5v8X2X6bJf5f5v8X2X/0?wx_fmt=png'
    };
  },


  methods: {
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

    // 分享到朋友圈
    onShareTimeline() {
      return {
        title: '朗朗书声 - 中小学语文课文朗读',
        query: '',
        imageUrl: 'https://mmbiz.qpic.cn/mmbiz_png/4MBNKq9XibX6bJf5f5v8X2X6bJf5f5v8X2X6bJf5f5v8X2X6bJf5f5v8X2X6bJf5f5v8X2X6bJf5f5v8X2X/0?wx_fmt=png'
      };
    },

    // 切换标签页
    switchTab(e: any) {
      const tab = e.currentTarget.dataset.tab;
      this.setData({
        currentTab: tab
      });
    },

    // 年级选择变化
    onGradeChange(e: any) {
      const index = e.detail.value;
      console.log('年级选择变化:', index, '对应年级:', this.data.grades[index]);
      this.setData({
        gradeIndex: index
      });
      this.saveUserPreferences();
      this.filterArticles(); // 筛选对应年级的课文
    },

    // 学期选择变化
    onSemesterChange(e: any) {
      const index = e.detail.value;
      console.log('学期选择变化:', index, '对应学期:', this.data.semesters[index]);
      this.setData({
        semesterIndex: index
      });
      this.saveUserPreferences();
      this.filterArticles(); // 筛选对应学期的课文
    },

    // 加载文章数据
    loadArticlesData() {
      try {
        // 使用 require 加载 JS 模块数据
        const articlesData = require('../../utils/all_articles_data');
        console.log('使用导入的文章数据，总数:', articlesData.length);
        
        if (articlesData && articlesData.length > 0) {
          console.log('文章样例:', articlesData.slice(0, 3).map((a: Article) => ({ 
            title: a.title, 
            grade: a.grade, 
            semester: a.semester,
            emoji: a.emoji 
          })));
          
          this.setData({
            allArticles: articlesData
          }, () => {
            console.log('allArticles 设置完成，开始筛选');
            console.log('当前组件数据状态:', {
              gradeIndex: this.data.gradeIndex,
              semesterIndex: this.data.semesterIndex,
              allArticlesCount: this.data.allArticles.length
            });
            this.filterArticles();
          });
        } else {
          console.error('没有文章数据');
          this.setData({
            allArticles: [],
            articles: []
          });
        }
      } catch (error) {
        console.error('加载JSON文件失败:', error);
        this.setData({
          allArticles: [],
          articles: []
        });
      }
    },

    // 筛选文章
    filterArticles() {
      const { allArticles, gradeIndex, semesterIndex } = this.data;
      
      // 如果没有数据，直接返回
      if (!allArticles || allArticles.length === 0) {
        console.log('没有文章数据，跳过筛选');
        return;
      }
      
      // 确保使用数字进行计算
      const targetGrade = (Number(gradeIndex) + 1).toString(); // 1-6年级
      const targetSemester = (Number(semesterIndex) + 1).toString(); // 1-2学期
      
      // 调试：打印具体的比较值
      console.log('调试 - targetGrade:', `'${targetGrade}'`, 'targetSemester:', `'${targetSemester}'`);
      
      console.log('当前筛选条件:', {
        gradeIndex,
        semesterIndex,
        targetGrade,
        targetSemester,
        totalArticles: allArticles.length
      });

      // 先看看有哪些年级和学期的组合
      const gradesSemesters: Record<string, number> = {};
      allArticles.forEach((article: Article) => {
        const key = `${article.grade}-${article.semester}`;
        if (!gradesSemesters[key]) {
          gradesSemesters[key] = 0;
        }
        gradesSemesters[key]++;
      });
      console.log('数据中的年级-学期分布:', gradesSemesters);
      
      const filteredArticles = allArticles
        .filter((article: Article) => {
          // 使用数字比较而不是字符串比较
          const gradeMatch = parseInt(article.grade) === parseInt(targetGrade);
          const semesterMatch = parseInt(article.semester) === parseInt(targetSemester);
          const match = gradeMatch && semesterMatch;
          
              // 详细调试信息
          if (match) {
            console.log(`✓ 匹配文章: ${article.title}, 年级: ${article.grade}===${targetGrade}, 学期: ${article.semester}===${targetSemester}`);
          }
          return match;
        })
        .map((article: Article, index: number) => {
          const colorSet = generateColor(index);
          return {
            title: article.title.length > 8 ? article.title.substring(0, 8) + '...' : article.title,
            fullTitle: article.title,
            color: colorSet.color,
            darkColor: colorSet.darkColor,
            emoji: article.emoji || '📖', // 直接使用 JSON 中的 emoji
            audio: article.audio_url,
            content: article.content,
            lessonNumber: article.lesson_number,
            author: article.author,
            reader: article.reader,
            detailUrl: article.detail_url,
            grade: article.grade,
            semester: article.semester
          };
        });

      console.log('筛选后的文章数量:', filteredArticles.length);
      console.log('筛选后的文章列表:', filteredArticles.map(a => ({ title: a.fullTitle, lessonNumber: a.lessonNumber })));

      this.setData({
        articles: filteredArticles
      });
    },

    // 点击文章跳转详情页
    onArticleClick(e: any) {
      const index = e.currentTarget.dataset.index;
      const article = this.data.articles[index];
      
      console.log('跳转详情页 - 文章信息:', {
        title: article.fullTitle,
        hasAudio: !!article.audio,
        audio: article.audio,
        audioLength: article.audio ? article.audio.length : 0
      });
      
      // 停止外部播放
      this.stopExternalPlayback();
      
      wx.navigateTo({
        url: `/pages/detail/detail?title=${encodeURIComponent(article.fullTitle)}&content=${encodeURIComponent(article.content)}&author=${encodeURIComponent(article.author)}&lessonNumber=${encodeURIComponent(article.lessonNumber)}&audio=${encodeURIComponent(article.audio || '')}`
      });
    },

    // 播放音频
    playAudio(e: any) {
      const index = e.currentTarget.dataset.index;
      const article = this.data.articles[index];
      
      if (article.audio) {
        console.log('播放音频:', article.audio);
        
        // 设置全局播放列表和当前播放项
        const app = getApp<IAppOption>();
        app.globalData.playlist = this.data.articles;
        app.globalData.currentIndex = index;
        app.globalData.currentTrack = {
          title: article.fullTitle,
          author: article.author,
          audio: article.audio
        };
        
        // 初始化音频管理器
        this.initAudioManager();
        
        // 开始播放
        this.startPlayback();
        
        wx.showToast({
          title: `播放: ${article.title}`,
          icon: 'success',
          duration: 1500
        });
        
      } else {
        wx.showToast({
          title: '暂无音频',
          icon: 'none',
          duration: 2000
        });
      }
    },

    // 初始化音频管理器
    initAudioManager() {
      const app = getApp<IAppOption>();
      
      if (!app.globalData.audioManager) {
        app.globalData.audioManager = wx.createInnerAudioContext();
        
        // 设置音频播放选项 - 忽略静音开关
        wx.setInnerAudioOption({
          obeyMuteSwitch: false
        });
        
        // 设置音频播放参数
        app.globalData.audioManager.volume = 1.0; // 最大音量
        
        // 监听播放结束事件，实现连续播放
        app.globalData.audioManager.onEnded(() => {
          // 保存最终播放状态
          this.savePlaybackState();
          this.playNext();
        });
        
        // 监听播放错误
        app.globalData.audioManager.onError((error: any) => {
          console.error('音频播放错误:', error);
          wx.showToast({
            title: '播放失败',
            icon: 'none',
            duration: 2000
          });
        });
        
        // 监听播放开始
        app.globalData.audioManager.onPlay(() => {
          console.log('音频开始播放');
        });
        
        // 监听播放暂停
        app.globalData.audioManager.onPause(() => {
          console.log('音频暂停');
        });
        
        // 监听时间更新
        app.globalData.audioManager.onTimeUpdate(() => {
          const currentTime = app.globalData.audioManager.currentTime;
          const duration = app.globalData.audioManager.duration;
          const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
          this.setData({
            currentTime,
            duration,
            progress
          });
          
          // 更新音频播放器组件
          const audioPlayer = this.selectComponent('#audioPlayer');
          if (audioPlayer) {
            audioPlayer.updateTime(currentTime, duration);
            audioPlayer.updateProgress(progress);
          }
          
          // 定期保存播放状态
          this.savePlaybackState();
        });
      }
    },

    // 开始播放
    startPlayback() {
      const app = getApp<IAppOption>();
      const currentTrack = app.globalData.currentTrack;
      
      if (currentTrack && currentTrack.audio) {
        // 检查音频格式
        const isM3u8 = currentTrack.audio.includes('.m3u8');
        
        if (isM3u8) {
          // HLS格式，使用背景音频管理器
          this.playHlsAudio(currentTrack);
        } else {
          // 普通音频格式
          app.globalData.audioManager.src = currentTrack.audio;
          app.globalData.audioManager.autoplay = true;
          app.globalData.isPlaying = true;
          
          // 更新页面状态
          this.setData({
            currentTrack: app.globalData.currentTrack,
            isPlaying: true,
            progress: 0
          });
          
          // 显示播放条
          const audioPlayer = this.selectComponent('#audioPlayer');
          if (audioPlayer) {
            audioPlayer.show();
          }
        }
      }
    },

    // 播放HLS格式音频
    playHlsAudio(track: any) {
      const app = getApp<IAppOption>();
      
      // 使用背景音频管理器播放HLS
      const backgroundAudioManager = wx.getBackgroundAudioManager();
      backgroundAudioManager.title = track.title || '课文朗读';
      backgroundAudioManager.singer = track.author || '未知';
      backgroundAudioManager.src = track.audio;
      backgroundAudioManager.volume = 1.0;
      
      app.globalData.isPlaying = true;
      
      // 更新页面状态
      this.setData({
        currentTrack: track,
        isPlaying: true,
        progress: 0
      });
      
      // 显示播放条
      const audioPlayer = this.selectComponent('#audioPlayer');
      if (audioPlayer) {
        audioPlayer.show();
      }
      
      // 监听播放错误
      backgroundAudioManager.onError((error: any) => {
        console.error('HLS播放错误:', error);
        wx.showToast({
          title: 'HLS格式播放失败',
          icon: 'none',
          duration: 2000
        });
        
        app.globalData.isPlaying = false;
        this.setData({
          isPlaying: false
        });
      });
    },

    // 播放下一首
    playNext() {
      const app = getApp<IAppOption>();
      const { playlist, currentIndex } = app.globalData;
      
      if (playlist.length > 0 && currentIndex < playlist.length - 1) {
        const nextIndex = currentIndex + 1;
        const nextArticle = playlist[nextIndex];
        
        app.globalData.currentIndex = nextIndex;
        app.globalData.currentTrack = {
          title: nextArticle.fullTitle,
          author: nextArticle.author,
          audio: nextArticle.audio
        };
        
        // 更新页面状态
        this.setData({
          currentTrack: app.globalData.currentTrack,
          progress: 0
        });
        
        this.startPlayback();
        
        wx.showToast({
          title: `下一首: ${nextArticle.title}`,
          icon: 'none',
          duration: 1500
        });
      } else {
        // 播放列表结束
        app.globalData.isPlaying = false;
        this.setData({
          isPlaying: false
        });
        
        // 停止所有音频播放
        try {
          app.globalData.audioManager.stop();
          const backgroundAudioManager = wx.getBackgroundAudioManager();
          backgroundAudioManager.stop();
        } catch (error) {
          console.log('停止音频播放时出错:', error);
        }
        
        // 隐藏播放条
        const audioPlayer = this.selectComponent('#audioPlayer');
        if (audioPlayer) {
          audioPlayer.hide();
        }
      }
    },

    // 暂停/继续播放
    togglePlayback() {
      const app = getApp<IAppOption>();
      const currentTrack = app.globalData.currentTrack;
      
      if (!currentTrack || !currentTrack.audio) return;
      
      const isM3u8 = currentTrack.audio.includes('.m3u8');
      
      if (isM3u8) {
        // HLS格式使用背景音频管理器
        const backgroundAudioManager = wx.getBackgroundAudioManager();
        
        if (app.globalData.isPlaying) {
          backgroundAudioManager.pause();
          app.globalData.isPlaying = false;
        } else {
          backgroundAudioManager.play();
          app.globalData.isPlaying = true;
        }
      } else {
        // 普通音频格式 - 确保音频管理器已初始化
        if (!app.globalData.audioManager) {
          this.initAudioManager();
        }
        
        if (app.globalData.isPlaying) {
          app.globalData.audioManager.pause();
          app.globalData.isPlaying = false;
        } else {
          app.globalData.audioManager.play();
          app.globalData.isPlaying = true;
        }
      }
      
      // 更新页面状态
      this.setData({
        isPlaying: app.globalData.isPlaying
      });
    },

    // 播放条点击事件
    onTogglePlay() {
      this.togglePlayback();
    },

    // 更新播放进度
    updateProgress(progress: number) {
      this.setData({ progress });
    },

    // 停止外部播放
    stopExternalPlayback() {
      const app = getApp<IAppOption>();
      
      // 停止所有音频播放
      try {
        if (app.globalData.audioManager) {
          app.globalData.audioManager.stop();
          app.globalData.audioManager = null;
        }
        
        const backgroundAudioManager = wx.getBackgroundAudioManager();
        backgroundAudioManager.stop();
        
        app.globalData.isPlaying = false;
        this.setData({
          isPlaying: false
        });
        
        // 隐藏播放条
        const audioPlayer = this.selectComponent('#audioPlayer');
        if (audioPlayer) {
          audioPlayer.hide();
        }
        
        console.log('已停止外部播放');
      } catch (error) {
        console.error('停止外部播放时出错:', error);
      }
    },

    // 保存用户偏好到本地存储
    saveUserPreferences() {
      wx.setStorageSync('userPreferences', {
        gradeIndex: this.data.gradeIndex,
        semesterIndex: this.data.semesterIndex,
        currentTab: this.data.currentTab
      });
    },

    // 从本地存储加载用户偏好
    loadUserPreferences() {
      try {
        const preferences = wx.getStorageSync('userPreferences');
        console.log('加载的用户偏好:', preferences);
        
        
        if (preferences) {
          const newData = {
            gradeIndex: preferences.gradeIndex || 0,
            semesterIndex: preferences.semesterIndex || 0,
            currentTab: preferences.currentTab || 'chinese'
          };
          console.log('设置新的数据:', newData);
          this.setData(newData);
        } else {
          console.log('没有保存的用户偏好，使用默认值:', {
            gradeIndex: 0,
            semesterIndex: 0
          });
          // 确保设置默认值
          this.setData({
            gradeIndex: 0,
            semesterIndex: 0,
            currentTab: 'chinese'
          });
        }
      } catch (error) {
        console.error('加载用户偏好失败:', error);
        // 出错时使用默认值
        this.setData({
          gradeIndex: 0,
          semesterIndex: 0,
          currentTab: 'chinese'
        });
      }
    },

    // 恢复上次播放状态
    restorePlayback() {
      const app = getApp<IAppOption>();
      
      try {
        // 从本地存储加载播放状态
        const playbackState = wx.getStorageSync('playbackState');
        
        if (playbackState && playbackState.currentTrack && playbackState.currentTrack.audio) {
          console.log('恢复上次播放状态:', playbackState);
          
          // 恢复全局播放状态
          app.globalData.currentTrack = playbackState.currentTrack;
          app.globalData.currentIndex = playbackState.currentIndex;
          app.globalData.playlist = playbackState.playlist;
          app.globalData.isPlaying = false; // 先暂停状态，等待用户操作
          
          // 初始化音频管理器并设置音频源
          this.initAudioManager();
          if (app.globalData.audioManager && playbackState.currentTrack.audio) {
            app.globalData.audioManager.src = playbackState.currentTrack.audio;
            // 设置播放位置
            app.globalData.audioManager.startTime = playbackState.currentTime || 0;
          }
          
          // 更新页面状态，显示播放条
          this.setData({
            currentTrack: playbackState.currentTrack,
            isPlaying: false,
            progress: playbackState.progress || 0,
            currentTime: playbackState.currentTime || 0,
            duration: playbackState.duration || 0
          });
          
          // 显示播放条
          const audioPlayer = this.selectComponent('#audioPlayer');
          if (audioPlayer) {
            audioPlayer.show();
            audioPlayer.updateProgress(playbackState.progress || 0);
            audioPlayer.updateTime(playbackState.currentTime || 0, playbackState.duration || 0);
          }
          
          wx.showToast({
            title: '已恢复上次播放位置',
            icon: 'none',
            duration: 1500
          });
        } else {
          console.log('没有上次播放记录');
        }
      } catch (error) {
        console.error('恢复播放状态失败:', error);
      }
    },

    // 保存播放状态到本地存储
    savePlaybackState() {
      const app = getApp<IAppOption>();
      
      try {
        const playbackState = {
          currentTrack: app.globalData.currentTrack,
          currentIndex: app.globalData.currentIndex,
          playlist: app.globalData.playlist,
          progress: this.data.progress,
          currentTime: this.data.currentTime,
          duration: this.data.duration
        };
        
        wx.setStorageSync('playbackState', playbackState);
        console.log('播放状态已保存');
      } catch (error) {
        console.error('保存播放状态失败:', error);
      }
    }


  }
})

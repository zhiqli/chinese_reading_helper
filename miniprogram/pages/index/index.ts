// index.ts
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
}



// 生成颜色的函数
function generateColor(index: number): { color: string, darkColor: string } {
  const colors = [
    { color: '#4CAF50', darkColor: '#2E7D32' },
    { color: '#2196F3', darkColor: '#1565C0' },
    { color: '#FF9800', darkColor: '#F57C00' },
    { color: '#9C27B0', darkColor: '#7B1FA2' },
    { color: '#E91E63', darkColor: '#C2185B' },
    { color: '#607D8B', darkColor: '#455A64' },
    { color: '#795548', darkColor: '#3E2723' },
    { color: '#009688', darkColor: '#004D40' }
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
    allArticles: [] as Article[] // 存储所有文章数据
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
      }, 100);
    }
  },

  methods: {
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
      
      // 调试：打印所有文章的年级和学期
      console.log('所有文章的年级学期分布:');
      allArticles.forEach((article, index) => {
        console.log(`  ${index}: ${article.title} - 年级:${article.grade}, 学期:${article.semester}`);
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
            detailUrl: article.detail_url
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
        
        // 先尝试使用 innerAudioContext
        const audioContext = wx.createInnerAudioContext();
        audioContext.src = article.audio;
        audioContext.autoplay = true;
        
        wx.showToast({
          title: `播放: ${article.title}`,
          icon: 'success',
          duration: 1500
        });
        
        // 监听播放成功
        audioContext.onPlay(() => {
          console.log('音频开始播放');
        });
        
        // 监听播放错误，如果失败则尝试背景音频管理器
        audioContext.onError((error) => {
          console.error('innerAudio播放错误:', error);
          console.log('尝试使用背景音频管理器');
          
          // 尝试使用背景音频管理器
          const backgroundAudioManager = wx.getBackgroundAudioManager();
          backgroundAudioManager.title = article.fullTitle || '课文朗读';
          backgroundAudioManager.singer = article.author || '未知';
          backgroundAudioManager.src = article.audio;
          
          backgroundAudioManager.onError((bgError) => {
            console.error('背景音频播放错误:', bgError);
            wx.showToast({
              title: '播放失败，请检查网络',
              icon: 'none',
              duration: 2000
            });
          });
        });
        
        // 播放结束时销毁上下文
        audioContext.onEnded(() => {
          audioContext.destroy();
        });
        
      } else {
        wx.showToast({
          title: '暂无音频',
          icon: 'none',
          duration: 2000
        });
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

  }
})

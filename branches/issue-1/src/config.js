/* 站点全局配置 —— 部署后只需修改本文件 */
export const SITE_CONFIG = {
  siteName: 'ziyi',

  user: {
    name: 'ziyi',
    initials: 'Z',
    role: 'Developer · Creator',
    bio: '热爱创造与分享的开发者。写代码、玩音乐、记录生活里的灵感瞬间。',
    location: 'Beijing, China',
    email: 'hi@example.com',
    avatar: '',
    links: [
      { label: 'GitHub', url: 'https://github.com', icon: 'github' },
      { label: 'Bilibili', url: 'https://bilibili.com', icon: 'bilibili' },
      { label: 'Email', url: 'mailto:hi@example.com', icon: 'mail' }
    ]
  },

  defaultCity: '北京',

  searchEngines: [
    { id: 'google', name: 'Google', url: 'https://www.google.com/search?q={q}', color: '#4285F4', hint: 'Google 搜索' },
    { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q={q}', color: '#008373', hint: 'Bing 搜索' },
    { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd={q}', color: '#2932E1', hint: '百度一下' },
    { id: 'duckduckgo', name: 'Duck', url: 'https://duckduckgo.com/?q={q}', color: '#DE5833', hint: 'DuckDuckGo' },
    { id: 'github', name: 'GitHub', url: 'https://github.com/search?q={q}', color: '#8B5CF6', hint: '搜索开源项目' },
    { id: 'zhihu', name: '知乎', url: 'https://www.zhihu.com/search?type=content&q={q}', color: '#0084FF', hint: '知乎搜索' },
    { id: 'bilibili', name: 'B站', url: 'https://search.bilibili.com/all?keyword={q}', color: '#FB7299', hint: '哔哩哔哩' }
  ],

  defaults: {
    mode: 'dark',
    accent: 'violet',
    background: 'aurora',
    backgroundImage: '',
    bgSpeed: 1,
    lang: 'zh',
    city: ''
  },

  shortcuts: [
    { name: 'GitHub', url: 'https://github.com', icon: 'GH', color: '#24292f' },
    { name: 'Bilibili', url: 'https://bilibili.com', icon: 'B', color: '#FB7299' },
    { name: '知乎', url: 'https://zhihu.com', icon: '知', color: '#0084FF' },
    { name: '掘金', url: 'https://juejin.cn', icon: '掘', color: '#1E80FF' },
    { name: 'Gmail', url: 'https://mail.google.com', icon: 'M', color: '#EA4335' },
    { name: 'Notion', url: 'https://notion.so', icon: 'N', color: '#111111' }
  ],

  /* 账号系统引导（首次访问自动创建管理员；请立刻修改口令） */
  auth: {
    adminUser: 'ziyi',
    adminPass: 'ziyi123456'
  }
};

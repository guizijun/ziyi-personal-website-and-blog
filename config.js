/**
 * 站点全局配置 —— 部署到服务器后只需修改本文件
 */
window.SITE_CONFIG = {
  /* 站点名称（浏览器标题 / 导航） */
  siteName: 'ziyi',

  /* 个人信息 */
  user: {
    name: 'ziyi',
    initials: 'Z',
    role: 'Developer · Creator',
    bio: '热爱创造与分享的开发者。写代码、玩音乐、记录生活里的灵感瞬间。',
    location: 'Beijing, China',
    email: 'hi@example.com',
    avatar: '',            // 头像图片 URL，留空则显示渐变文字头像
    links: [
      { label: 'GitHub',   url: 'https://github.com', icon: 'github' },
      { label: 'Bilibili', url: 'https://bilibili.com', icon: 'bilibili' },
      { label: 'Email',    url: 'mailto:hi@example.com', icon: 'mail' }
    ]
  },

  /* 站点入口 */
  blogUrl: './blog/',
  adminUrl: './admin/',

  /* 天气默认城市（也可在设置面板中修改） */
  defaultCity: '北京',

  /* 搜索引擎 */
  searchEngines: [
    { id: 'google',    name: 'Google',  url: 'https://www.google.com/search?q={q}',        color: '#4285F4', hint: 'Google 搜索' },
    { id: 'bing',      name: 'Bing',    url: 'https://www.bing.com/search?q={q}',          color: '#008373', hint: 'Bing 搜索' },
    { id: 'baidu',     name: '百度',     url: 'https://www.baidu.com/s?wd={q}',             color: '#2932E1', hint: '百度一下' },
    { id: 'duckduckgo',name: 'Duck',    url: 'https://duckduckgo.com/?q={q}',              color: '#DE5833', hint: 'DuckDuckGo' },
    { id: 'github',    name: 'GitHub',  url: 'https://github.com/search?q={q}',            color: '#8B5CF6', hint: '搜索开源项目' },
    { id: 'zhihu',     name: '知乎',     url: 'https://www.zhihu.com/search?type=content&q={q}', color: '#0084FF', hint: '知乎搜索' },
    { id: 'bilibili',  name: 'B站',      url: 'https://search.bilibili.com/all?keyword={q}',color: '#FB7299', hint: '哔哩哔哩' }
  ],

  /* 默认偏好（首次访问生效，之后由设置面板覆盖） */
  defaults: {
    mode: 'dark',          // dark | light | auto
    accent: 'violet',      // 见 base.css 中的 --accent-* 变量
    background: 'aurora',  // aurora | stars | particles | gradient | image | none
    backgroundImage: '',
    bgSpeed: 1,
    lang: 'zh',            // zh | en
    city: ''               // 留空则用 defaultCity
  },

  /* 默认快捷方式 */
  shortcuts: [
    { name: 'GitHub',   url: 'https://github.com',              icon: 'GH', color: '#24292f' },
    { name: 'Bilibili', url: 'https://bilibili.com',            icon: 'B',  color: '#FB7299' },
    { name: '知乎',      url: 'https://zhihu.com',               icon: '知', color: '#0084FF' },
    { name: '掘金',      url: 'https://juejin.cn',               icon: '掘', color: '#1E80FF' },
    { name: 'Gmail',    url: 'https://mail.google.com',         icon: 'M',  color: '#EA4335' },
    { name: 'Notion',   url: 'https://notion.so',               icon: 'N',  color: '#111111' }
  ],

  /* 账号系统引导（仅首次访问时用于创建管理员，创建后请立刻修改口令）
     密码在浏览器内以 SHA-256 加盐哈希存储，不保存明文 */
  auth: {
    adminUser: 'ziyi',
    adminPass: 'ziyi123456'
  },

  /* 文章发布 API（可选）。
     留空 = 纯静态模式：发布站在浏览器本地保存草稿，并导出 posts.json / .md 文件，
     手动放入 blog/posts/ 即可。
     配置为后端地址后，发布站会尝试 POST/PUT 该接口。 */
  apiBase: ''
};

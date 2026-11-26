/* i18n 字典 */
export const I18N = {
  zh: {
    nav_home: '首页', nav_search: '搜索', nav_shortcuts: '快捷',
    tagline: '个人空间 · 记录与创造',
    about: '关于我', skills: '技能栈',
    visit_blog: '进入我的博客', open_admin: '文章发布',
    weather: '天气', search_ph: '输入关键词，按 Enter 搜索',
    shortcuts: '快捷方式', add_shortcut: '添加快捷方式', edit: '编辑', del: '删除',
    name: '名称', url: '链接地址', icon_text: '图标文字', color: '颜色',
    save: '保存', cancel: '取消', confirm_del: '确认删除这个快捷方式吗？',
    settings: '设置', theme_color: '主题色', mode: '模式',
    dark: '深色', light: '浅色', auto: '跟随系统',
    background: '动态背景', bg_speed: '背景速度', bg_image: '背景图片 URL',
    language: '语言', city: '天气城市', reset: '恢复默认',
    bg_aurora: '极光', bg_stars: '星河', bg_particles: '粒子', bg_gradient: '流体渐变',
    bg_image_opt: '自定义图片', bg_none: '纯色',
    locate: '定位', locating: '定位中…', my_location: '我的位置',
    geo_denied: '定位失败：请在浏览器中允许位置权限后重试',
    geo_unsupported: '当前浏览器不支持定位',
    loading_weather: '加载天气中…', weather_fail: '天气暂时无法获取（离线？）',
    search_posts: '搜索文章标题、标签、内容…',
    read_more: '阅读全文', back: '返回', no_posts: '没有找到匹配的文章',
    new_post: '写文章', title: '标题', slug: '链接标识',
    excerpt: '摘要', cover: '封面色', content_md: '正文 (Markdown)',
    preview: '预览', publish: '发布', export_json: '导出 posts.json',
    tips_text: '天气显示在左上角，点击「定位」获取你所在城市的天气，也可在「设置」中手动切换城市。搜索框左侧可切换 Google / Bing / 百度 / DuckDuckGo / GitHub / 知乎 / B站 等引擎。',
    recent_text: '欢迎来到我的小站！这里有全网搜索、实时天气，还有可自定义的快捷方式。点上方按钮进入博客，阅读我的文章。',
    now_text: '当前正在探索：Web 动效设计、个人知识库、AI 工具链。欢迎通过邮件或社交平台找我聊聊。'
  },
  en: {
    nav_home: 'Home', nav_search: 'Search', nav_shortcuts: 'Links',
    tagline: 'Personal space · create & share',
    about: 'About', skills: 'Skills',
    visit_blog: 'Visit my blog', open_admin: 'Publish',
    weather: 'Weather', search_ph: 'Type and press Enter',
    shortcuts: 'Shortcuts', add_shortcut: 'Add shortcut', edit: 'Edit', del: 'Delete',
    name: 'Name', url: 'URL', icon_text: 'Icon text', color: 'Color',
    save: 'Save', cancel: 'Cancel', confirm_del: 'Delete this shortcut?',
    settings: 'Settings', theme_color: 'Accent', mode: 'Mode',
    dark: 'Dark', light: 'Light', auto: 'Auto',
    background: 'Dynamic background', bg_speed: 'Speed', bg_image: 'Background image URL',
    language: 'Language', city: 'Weather city', reset: 'Reset',
    bg_aurora: 'Aurora', bg_stars: 'Stars', bg_particles: 'Particles', bg_gradient: 'Gradient',
    bg_image_opt: 'Custom image', bg_none: 'Solid',
    locate: 'Locate', locating: 'Locating…', my_location: 'My location',
    geo_denied: 'Location failed: allow location permission in your browser and retry',
    geo_unsupported: 'Geolocation is not supported in this browser',
    loading_weather: 'Loading weather…', weather_fail: 'Weather unavailable (offline?)',
    search_posts: 'Search titles, tags, content…',
    read_more: 'Read more', back: 'Back', no_posts: 'No matching posts',
    new_post: 'New post', title: 'Title', slug: 'Slug',
    excerpt: 'Excerpt', cover: 'Cover color', content_md: 'Content (Markdown)',
    preview: 'Preview', publish: 'Publish', export_json: 'Export posts.json',
    tips_text: 'Weather sits at the top-left. Hit "Locate" to get weather for your current city, or switch the city in Settings. Switch engines on the left of the search box.',
    recent_text: 'Welcome to my little corner of the web — web search, live weather and customizable shortcuts. Hit the button above to read my blog.',
    now_text: 'Currently exploring: web motion design, personal knowledge bases and AI toolchains.'
  }
};

let currentLang = 'zh';
export function setLang(lang) { currentLang = lang || 'zh'; }
export function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key]) || I18N.zh[key] || key;
}

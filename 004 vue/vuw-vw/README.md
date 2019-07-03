# vuw-vw

vue-cli3 里使用 vw、stylus

### vue-cli3 里使用 vw

安装依赖包

```
npm i -S postcss-aspect-ratio-mini postcss-px-to-viewport postcss-write-svg postcss-cssnext postcss-viewport-units cssnano
npm i -S postcss-import postcss-url
npm i -S cssnano-preset-advanced
```

新建 `postcss.config.js`

```javaScript
module.exports = {
  plugins: {
    "postcss-import": {},
    "postcss-url": {},
    "postcss-aspect-ratio-mini": {},
    "postcss-write-svg": {
      utf8: false
    },
    "postcss-cssnext": {},
    "postcss-px-to-viewport": {
      viewportWidth: 750, // (Number) The width of the viewport.
      viewportHeight: 1334, // (Number) The height of the viewport.
      unitPrecision: 3, // (Number) The decimal numbers to allow the REM units to grow to.
      viewportUnit: "vw", // (String) Expected units.
      selectorBlackList: [".ignore", ".hairlines"], // (Array) The selectors to ignore and leave as px.
      minPixelValue: 1, // (Number) Set the minimum pixel value to replace.
      mediaQuery: false // (Boolean) Allow px to be converted in media queries.
    },
    "postcss-viewport-units": {},
    cssnano: {
      preset: "advanced",
      autoprefixer: false,
      "postcss-zindex": false
    }
  }
};
```

### vue-cli3 里使用 stylus

安装 npm i -S stylus stylus-loader

修改 `vue.config.js`

```javaScript
const path = require('path')
moudule.exports = {
  css:{
    loaderOptions:{
      sass:{
        data: `@import "@/css/"`
      }
      stylus:{
        import: path.reslove(__dirname, './src/css')
      }
    }
  }
}
```

后记：`vue create` 的时候不要用默认的配置，否则会少很多配置文件，后期很难修改

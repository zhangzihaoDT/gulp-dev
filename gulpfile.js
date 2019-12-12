// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const { src, dest, watch, series, parallel } = require("gulp");

// 导入我们要使用的所有与Gulp相关的软件包
// SourceMap 帮助我们在控制台中转换成源码，从而进行 debug
const sourcemaps = require("gulp-sourcemaps");
//缩小JS
const uglify = require("gulp-uglify");
// postcss() 运行另外两个插件：
const postcss = require("gulp-postcss");
// 将供应商前缀添加到CSS
const autoprefixer = require("autoprefixer");
// 缩小CSS文件
const cssnano = require("cssnano");
// 图片压缩
const imagemin = require("gulp-imagemin");
// 压缩HTML文件
var htmlmin = require("gulp-htmlmin");
// 批量替换
var replace = require("gulp-replace");
// 浏览器同步
var browserSync = require("browser-sync").create();
// git上传
var deploy = require("gulp-gh-pages");

// File paths
const files = {
  cssPath: "src/css/**/*.css",
  imgPath: "src/img/**/*.{png,jpg,gif,svg}",
  jsPath: "src/js/**/*.js"
};

// JS task: concatenates and uglifies JS files to script.js
function jsTask() {
  return src([
    files.jsPath
    //,'!' + 'includes/js/jquery.min.js', // to exclude any specific files
  ])
    .pipe(uglify())
    .pipe(dest("dist/js"));
}

// Sass task: compiles the style.scss file into style.css
function cssTask() {
  return src(files.cssPath)
    .pipe(postcss([autoprefixer(), cssnano()])) // PostCSS plugins
    .pipe(sourcemaps.write(".")) // write sourcemaps file in current directory
    .pipe(dest("dist/css")) // put final CSS in dist folder
    .pipe(browserSync.stream()); //让css文件在不刷新的情况下依旧能够被注入更改;
}
// 图片压缩
function imgTask() {
  return src(files.imgPath)
    .pipe(imagemin())
    .pipe(dest("dist/img"));
}

// 缓存清除
var cbString = new Date().getTime();

function cacheBustTask() {
  return src("./src/index.html")
    .pipe(replace(/cb=\d+/g, "cb=" + cbString))
    .pipe(dest("src"));
}

// 压缩HTML文件
function htmlTask() {
  return src("./src/index.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest("dist"));
}
// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
function watchTask() {
  browserSync.init({
    server: {
      baseDir: "./dist",
      index: "/index.html"
    },
    port: 4000
  });
  watch([files.cssPath, files.jsPath], series(parallel(cssTask, jsTask)));
  watch("./*.html").on("change", browserSync.reload);
  watch("./js/**/*.js").on("change", browserSync.reload);
}

exports.build = series(parallel(cssTask, jsTask, imgTask), htmlTask);
exports.default = series(parallel(cssTask, jsTask), cacheBustTask, watchTask);
/**
 * Push build to gh-pages
 */
function deploy() {
  return src("./dist/**/*").pipe(deploy());
}

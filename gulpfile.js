/*****************************************************************************************/
/*  VB Gulp 4.0.2 Starter Kit 1.0.0 for OpenCart CMS (any version)                       */
/*  https://github.com/vladikslavus/vbstarterkit-opencart                                */
/*  by Vlad Beletsky, 2023                                                               */
/*****************************************************************************************/

/* change mode */
const devMode   = true,
      prodMode  = !devMode;

/* server settings */
const config = {
    proxy: 'vbstarterkit-opencart',
    notify: false
};

/* source paths, production paths and paths for files we need to watch */
const path = {
    build: {
        js: './www/catalog/view/javascript/',
        css: './www/catalog/view/theme/default/stylesheet/',
        fonts: './www/catalog/view/theme/default/stylesheet/fonts/',
    },
    src: {
        js: ['./src/js/common.js'], // js entry points, string when one, array when several
        style: './src/style/stylesheet.scss', // scss entry points, string when one, array when several
        fonts: './src/fonts/**/*.*',
    },
    watch: {
        js: './src/**/*.js',
        css: './src/style/**/*.scss',
        fonts: './srs/fonts/**/*.*',
        fileswatch: [`www/catalog/view/theme/**/*+(twig|php|tpl)`] // template files monitoring, extensions    [`www/catalog/view/theme/**/*.${fileswatch}`]
    }
};

/* define gulp and plugins */
const gulp = require('gulp'),  // Gulp
    browserSync = require('browser-sync'), // automatically reloads the browser while editing CSS, JS, etc.
    gulpif = require('gulp-if'), // a ternary gulp plugin
    plumber = require('gulp-plumber'), // error plugin prevents pipe breaking caused by errors from gulp plugins
    sourcemaps = require('gulp-sourcemaps'), // generate sourcemaps
    sass = require('gulp-sass'), // sass plugin (SASS to CSS)
    autoprefixer = require('gulp-autoprefixer'), // add vendor prefixes to CSS
    cleanCSS = require('gulp-clean-css'), // minify CSS
    cache = require('gulp-cache'), // a simple in-memory file cache plugin
    del = require('del'), // similar to rimraf, but with some improvements
    rename = require('gulp-rename'), // plugin to rename files easily
    newer = require('gulp-newer'), // pass through only those source files that are newer than corresponding destination files
    webpack = require('webpack'), // module bundler itself
    webpackStream = require('webpack-stream'), // run webpack as a stream to conveniently integrate with gulp
    TerserPlugin = require("terser-webpack-plugin"); // minify JS


/* tasks */

// server startup
function webserver() {
    browserSync(config);
}

// style build
function css_build () {
  return gulp.src(path.src.style) // pass the string or the array of values pointed above if we want to pass several ones
      // .pipe(cached('css_building'))
      .pipe(plumber()) // gulp plugins bug tracking
      .pipe(gulpif(devMode, sourcemaps.init())) // initialize source maps
      .pipe(sass()) // scss -> css
      .pipe(autoprefixer({ // add vendor prefixes to CSS
          overrideBrowserslist:  ['last 2 versions'], // last two versions recommended by plugin developers
          cascade: false
      }))
      // .pipe(gulp.dest(path.build.css)) // deploy temporary css
      .pipe(gulpif(devMode, gulp.dest(path.build.css))) // only for devMode
      .pipe(rename({ suffix: '.min' })) // add prefixes to the deployed file
      .pipe(cleanCSS({level: {1: {specialComments: 0}}})) // minify CSS and disable even special comments
      .pipe(gulpif(devMode, sourcemaps.write('./')))  // write source maps
      .pipe(gulp.dest(path.build.css)) // deploy final css
      .pipe(browserSync.reload({ stream: true })); // browser-sync reload
}

function js_build() {

    let webpackConf = {
        mode: `${(devMode === true) ? 'development' : 'production'}`, // current mode for webpack
        output: {
            filename: `[name].js`,  // the same name as the source
            sourceMapFilename: '[name].map'
        },
        module: {
            rules: [
                {
                    test: /\.(js)$/,    // get all js-files
                    exclude: /(node_modules)/, // exclude development modules folder
                    loader: 'babel-loader', // convert ES6 into a backwards compatible version of JS in older browsers
                    query: {
                        presets: ['@babel/env'] // use babel preset
                    }
                },
            ]
        },
        optimization: {
            minimize: true,
            minimizer: [new TerserPlugin()],
        },
    };

    // convert Gulp array into entry property for Webpack
    let fileName = null;
    let entryObj = {};
    path.src.js.map((filePath) => {
      fileName = filePath.split('/').pop().split('.').slice(0, -1).join('.');
      entryObj[fileName] = filePath;
    });

    // add converted entry property to Webpack    
    webpackConf.entry = entryObj;

    return gulp.src(path.src.js)
        .pipe(webpackStream(webpackConf)).on('error', function handleError() {
            this.emit('end')
        })
        // .pipe(gulp.dest(path.build.js))  // build js
        .pipe(gulpif(devMode, gulp.dest(path.build.js))) // only for devMode
        .pipe(rename({ suffix: '.min' })) // add suffix to the filename
        .pipe(gulp.dest(path.build.js)) // build final min js
        .pipe(browserSync.reload({ stream: true })); // browser-sync reload
}

// copy fonts
function fonts_build() {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
}

// we have to specify that the task is complete using (done)
function build(done) {
    return gulp.parallel(
            js_build,
            css_build,
            fonts_build
          )(done);
}

// start tasks when files are changed
function watch() {
    gulp.watch(path.watch.css, gulp.series(css_build));
    gulp.watch(path.watch.js, gulp.series(js_build));
    gulp.watch(path.watch.fonts, gulp.series(fonts_build));
    gulp.watch(path.watch.fileswatch).on('change', browserSync.reload);
}

// define tasks
exports.css_build = css_build;
exports.js_build = js_build;
exports.fonts_build = fonts_build;
exports.build = build;

// default task
exports.default = gulp.series(
    build,
    gulp.parallel(webserver, watch)
);
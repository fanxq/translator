var gulp = require('gulp');

gulp.task('default', function() {
    gulp.src([
        './src/background.js',
        './src/manifest.json',
        './src/images/icon16.png',
        './src/images/icon48.png',
        './src/images/icon128.png'
    ])
    .pipe(gulp.dest('out'));
});
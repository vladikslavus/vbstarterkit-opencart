## My web development environment for OpenCart CMS (any version)
This is my desktop starter kit for OpenCart front-end developing.
I use Webpack with Babel inside Gulp via webpack-stream plugin here.
Open `package.json` to read packages I use.

## OpenCart
All your OpenCart project code is in the `www` folder.

## Environment requirements
The following tools must be installed to create the environment:
- [Node.js](https://nodejs.org/en/)
- [Git](https://git-scm.com/)
- [Gulp-cli](https://gulpjs.com/docs/en/getting-started/quick-start/) (need to globally install only gulp-cli)

If you do not have these tools, you need to install them.

## Project dependencies installation
To install the project dependencies, enter the command at the command line:
- `npm install`

## How to use the environment
Normal mode: enter `gulp` at the command line.
Selective build: enter the task you need at the command line. For example, enter `gulp css_build` to build CSS or `gulp js_build` to build JS. Other available tasks can be found in gulpfile.js.
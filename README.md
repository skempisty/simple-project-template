       _____,,;;;`;              ;';;;,,_____
    ,~(  )  , )~~\|   HORSIES    |/~~( ,  (  )~;
    ' / / --`--,      CRAWLER       .--'-- \ \ `
     /  \    | '                    ` |    /  \

## Development

#### Clone website

1. Click the green clone or download button
2. Copy the clone path (use SSH not HTTPS)
3. Navigate to file system where you want horsies-crawler
4. `git clone <CLONE PATH> horsies-crawler`
5. `cd horsies-crawler`
6. Ready to go!

#### Install dependencies

Best way to install dependencies is through `Homebrew` - a dependency package manager.

Go to https://brew.sh/ for installation instructions

- NodeJs `brew install node`
- NPM `brew install npm`
- Python (2 or 3) `brew install python`

- Yarn `npm install -g yarn`

#### Run from terminal

1. `npm install`

Run npm install first. This installs node modules, initializes a
python venv connection, and installs python modules.

2. `source env/bin/activate`

This activates the python environment required to execute python scripts used by horsies crawler.

3. `npm run dev`

Starts development server (port 5000) and frontend app (port 3000).

Find frontend at:

`http://localhost:3000/`

## Testing (TBD)

`npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

## Production (TBD)

`npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Other junk

`npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

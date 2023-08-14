// from https://github.com/sindresorhus/is-heroku/tree/main MIT Licensed
// inlined to avoid import problems in cypress

export default () => 'HEROKU' in process.env || ('DYNO' in process.env && process.env.HOME === '/app')

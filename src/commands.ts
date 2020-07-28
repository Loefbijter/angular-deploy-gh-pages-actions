import {deployToGithub, execute, isFalsyVal, writeToConsole} from './helpers'
import fs from 'fs';

export async function runLint(shouldRunLint: string): Promise<string> {
  if (!isFalsyVal(shouldRunLint)) {
    writeToConsole('Running lint 💪')
    return await execute(
      'node_modules/.bin/ng lint',
      'successfully run lint',
      'could not run lint'
    )
  } else {
    return Promise.resolve('not running lint')
  }
}

export async function createBuild(params: {
  buildConfig?: string
  baseHref?: string
}): Promise<string> {
  const {baseHref} = params
  let {buildConfig} = params
  if (!buildConfig) {
    buildConfig = 'production'
  }
  let baseHrefString = ''
  if (baseHref && baseHref.length > 0) {
    baseHrefString = `--base-href=${baseHref}`
  }
  writeToConsole('Creating ng build 💪')
  return await execute(
    `node_modules/.bin/ng build --configuration=${buildConfig} ${baseHrefString}`.trim()
  )
}

export async function deployBuild(deployConfig: {
  accessToken: string
  buildFolder: string
  deployBranch: string
}): Promise<string> {
  const {accessToken, buildFolder, deployBranch} = deployConfig
  if (!accessToken) {
    throw Error(
      'Github Access token not provided. Please add it to your workflow yml'
    )
  }
  if (buildFolder === '') {
    throw Error(
      'The buildFolder can not be an empty string. Please either provide the relative path like "dist/my-project", or not use the input which defaults to the "dist" folder.'
    )
  }
  writeToConsole('Deploying build ..💪')
  try {
    await deployToGithub({
      accessToken,
      branch: deployBranch ? deployBranch : 'gh-pages',
      folder: buildFolder ? buildFolder : './dist',
      workspace: './'
    })
    writeToConsole('Deployed build successfully! 🎉🎉🎉')
    return 'successfully deployed'
  } catch (err) {
    writeToConsole('Failed to deploy build!❌')
    throw err
  }
}

export async function installDeps(): Promise<string> {
  writeToConsole('Installing dependencies 🏃')
  return await execute('npm install')
}

async function readFile(path: string, opts = 'utf8'): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, opts, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

async function writeFile(
  path: string,
  data: string,
  opts = 'utf8'
): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, opts, err => {
      if (err) reject(err)
      else resolve()
    })
  })
}

export async function copyFiles(from: string, to: string): Promise<void> {
  await writeFile(to, await readFile(from))
  writeToConsole(`Successfully copied ${from} to ${to}!`)
}

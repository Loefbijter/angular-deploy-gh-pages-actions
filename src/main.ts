import {getInput, setFailed} from '@actions/core'
import * as commands from './commands'
import {isFalsyVal, navigateToDirectory, writeToConsole} from './helpers'

async function run(): Promise<void> {
  try {
    let workspaceDir = ''
    const baseHref = getInput('base_href')
    const buildConfig = getInput('build_configuration')
    const shouldRunLint = getInput('run_lint')
    const accessToken = getInput('github_access_token')
    const buildFolder = getInput('angular_dist_build_folder')
    const angularProjectDir = getInput('angular_project_dir')
    const deployBranch = getInput('deploy_branch')
    const use404Fallback = getInput('use_404_fallback')

    // if the angular project directory is not the current directory
    if (angularProjectDir !== './' && angularProjectDir !== '') {
      workspaceDir = process.cwd()
      navigateToDirectory(angularProjectDir)
    }
    await commands.installDeps()
    await commands.runLint(shouldRunLint)
    await commands.createBuild({
      baseHref,
      buildConfig
    })

    // if (use404Fallback === 'true') {
    writeToConsole(use404Fallback)
    writeToConsole(typeof use404Fallback)
    await commands.copyFiles(
      `${process.cwd()}/${buildFolder}/index.html`,
      `${process.cwd()}/${buildFolder}/404.html`
    )
    // }

    /**
     * if we changed the workspace directory, we have to navigate back to initial workspace directory
     * The reason being for deploying to github pages, it works with the .git directory, so we have to be
     * at the root of the workspace
     */
    if (workspaceDir) {
      navigateToDirectory(workspaceDir)
    }

    await commands.deployBuild({
      accessToken,
      buildFolder,
      deployBranch
    })
  } catch (error) {
    const skipFailure = getInput('skip_failure')
    if (isFalsyVal(skipFailure)) {
      setFailed(error.message)
    }
  }
}

run()

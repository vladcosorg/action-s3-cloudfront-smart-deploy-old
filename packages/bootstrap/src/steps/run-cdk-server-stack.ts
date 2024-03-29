import chalk from 'chalk'

import type { Context } from '@/src'
import {
  createError,
  getStackOutputValue,
  getTaskContextValue,
  runStack,
  setGithubVar,
} from '@/src/util'

import type { ListrTask } from 'listr2'

export const runCdkServerStack: ListrTask<Context> = {
  async task(context, task) {
    const repo = getTaskContextValue('repo', context)
    task.title = `${chalk.bgGreen.bold(' AWS ')}: Running  ${chalk.green(
      'AWS CDK',
    )} server stack. ${chalk.red(
      'Please be patient, this may take some time!',
    )}`

    if (!repo) {
      throw createError('Repo not set')
    }

    await runStack('action-server', { repo }, task)

    await setGithubVar({
      varName: 'AWS_DISTRIBUTION',
      varValue: await getStackOutputValue(
        'distributionId',
        'action-server',
        task,
      ),
      repo,
      task,
    })

    await setGithubVar({
      varName: 'AWS_BUCKET',
      varValue: await getStackOutputValue('awsBucketId', 'action-server', task),
      repo,
      task,
    })
  },
  options: {
    persistentOutput: false,
  },
}

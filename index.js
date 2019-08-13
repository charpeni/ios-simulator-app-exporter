#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const program = require('commander');

const getDevices = require('./getAppsByDevice');
const { version } = require('./package.json');

program
  .version(version, '-v, --version', 'output the version number')
  .parse(process.argv);

function activeDevicesOnlyFilter(device) {
  return device.state === 3;
}

function checkRequirements(devices) {
  if (devices.length === 0) {
    console.log('🛑  There are no devices.');
    process.exit();
  }

  if (devices.every(device => device.apps.length === 0)) {
    console.log('🛑  There are no available apps.');
    process.exit();
  }
}

function prettifyRuntimeVersion(runtime) {
  return runtime
    .split('.')
    .pop()
    .split('-')
    .reduce((acc, value, index) => {
      if (index === 0) {
        return `${value} `;
      }
      if (index > 1) {
        return `${acc}.${value}`;
      }

      return acc + value;
    }, '');
}

async function selectAnApp(devices) {
  checkRequirements(devices);

  const { application } = await inquirer.prompt([
    {
      type: 'list',
      name: 'application',
      message: 'Select the application you would like to export',
      choices: devices.reduce((acc, device) => {
        if (device.apps.length === 0) {
          return acc;
        }

        return [
          ...acc,
          ...device.apps.map(app => ({
            name: `${device.name} (${prettifyRuntimeVersion(
              device.runtime
            )}) - ${app.CFBundleDisplayName || app.CFBundleName} [${
              app.CFBundleIdentifier
            } - ${app.CFBundleVersion}]`,
            value: {
              device,
              app,
            },
          })),
        ];
      }, []),
    },
  ]);

  console.log(`🥧   ${chalk.bold('Full path:')} ${application.app.file}`);
  console.log(
    `📁  ${chalk.bold('Directory:')} ${application.app.file
      .split('/')
      .slice(0, -1)
      .join('/')}`
  );

  return application;
}

async function main() {
  console.log('🔍  Scanning iOS simulators...');

  const devices = getDevices();
  let activeDevicesOnly = false;

  checkRequirements(devices);

  if (devices.some(activeDevicesOnlyFilter)) {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'activeDevicesOnly',
        message: 'Would you like to filter on active devices?',
        default: true,
      },
    ]);

    // eslint-disable-next-line prefer-destructuring
    activeDevicesOnly = answer.activeDevicesOnly;
  }

  return selectAnApp(
    activeDevicesOnly ? devices.filter(activeDevicesOnlyFilter) : devices
  );
}

main();

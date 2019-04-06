const fs = require('fs');
const { join } = require('path');
const { homedir } = require('os');
const plist = require('simple-plist');
const inquirer = require('inquirer');
const chalk = require('chalk');

const DEVICES_PATH = '/Library/Developer/CoreSimulator/Devices/';
const APPS_PATH = '/data/Containers/Bundle/Application';

function getDirectories(source) {
  if (!fs.existsSync(source)) {
    return [];
  }

  return fs
    .readdirSync(source)
    .map(name => join(source, name))
    .filter(file => fs.lstatSync(file).isDirectory());
}

function getDevices() {
  return getDirectories(homedir() + DEVICES_PATH).map(devicePath => {
    const device = plist.readFileSync(`${devicePath}/device.plist`);

    return {
      path: devicePath,
      ...device,
      apps: getDirectories(devicePath + APPS_PATH).reduce((acc, appPath) => {
        const apps = getDirectories(appPath)
          .filter(file => file.endsWith('.app'))
          .map(file => {
            if (fs.existsSync(`${file}/Info.plist`)) {
              let app;

              try {
                app = plist.readFileSync(`${file}/Info.plist`);
              } catch (error) {
                console.error(`Something is wrong with ${file}: ${error}`);
              }

              if (!app) {
                return undefined;
              }

              const {
                CFBundleDisplayName,
                CFBundleIdentifier,
                CFBundleShortVersionString,
                CFBundleVersion,
              } = app;

              return {
                file,
                CFBundleDisplayName,
                CFBundleIdentifier,
                CFBundleShortVersionString,
                CFBundleVersion,
              };
            }

            return undefined;
          })
          .filter(app => app);

        return [...acc, ...apps];
      }, []),
    };
  });
}

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
            )}) - ${app.CFBundleDisplayName} [${app.CFBundleIdentifier} - ${
              app.CFBundleVersion
            }]`,
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

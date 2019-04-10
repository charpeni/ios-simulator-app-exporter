const fs = require('fs');
const { join } = require('path');
const { homedir } = require('os');
const plist = require('simple-plist');

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

function getAppsByDevice(searchingPath = homedir() + DEVICES_PATH) {
  return getDirectories(searchingPath).map(devicePath => {
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
                CFBundleName,
                CFBundleIdentifier,
                CFBundleShortVersionString,
                CFBundleVersion,
              } = app;

              return {
                file,
                CFBundleDisplayName,
                CFBundleName,
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

module.exports = getAppsByDevice;

const getAppsByDevice = require('../getAppsByDevice');

it('should get devices correctly', () => {
  const appsByDevice = getAppsByDevice(`${__dirname}/Devices`);

  // We have to trim the absolute path as `homedir()` will be different for everyone.
  const trimPaths = appsByDevice.map(device => {
    if (device.apps.length > 0) {
      return {
        ...device,
        path: device.path.split('__tests__')[1],
        apps: device.apps.map(app => ({
          ...app,
          file: app.file.split('__tests__')[1],
        })),
      };
    }

    return {
      ...device,
      path: device.path.split('__tests__')[1],
    };
  });
  expect(trimPaths).toMatchSnapshot();
});

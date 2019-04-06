const getAppsByDevice = require('../getAppsByDevice');

it('should get devices correctly', () => {
  expect(getAppsByDevice(`${__dirname}/Devices`)).toMatchSnapshot();
});

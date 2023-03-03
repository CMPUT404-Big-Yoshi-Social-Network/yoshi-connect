/** @type {import('jest').Config} */
const config = {
    extensionsToTreatAsEsm: ['.jsx'],
    moduleNameMapper: {
      '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
    },
};
  
  export default config;
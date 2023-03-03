/** @type {import('jest').Config} */
const config = {
    extensionsToTreatAsEsm: ['.jsx'],
    transformIgnorePatterns: ["/node_modules/(?!(swagger-client|react-syntax-highlighter)/)"],
    moduleNameMapper: {
      '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
    },
};
  
  export default config;
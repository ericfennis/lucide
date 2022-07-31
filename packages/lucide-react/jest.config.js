module.exports = {
  verbose: true,
  roots: ['<rootDir>/src/', '<rootDir>/tests/'],
  moduleFileExtensions: ['js'],
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [`/node_modles`],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
};

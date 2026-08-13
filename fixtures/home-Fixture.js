// fixtures/pom-Fixture.js
const base = require('@playwright/test');
const MainHome = require('../pages/homepage');

exports.test = base.test.extend({
  homepage: async ({ page }, use) => {
    const homepage = new MainHome(page);
    await use(homepage);
  },
});

exports.expect = base.expect;
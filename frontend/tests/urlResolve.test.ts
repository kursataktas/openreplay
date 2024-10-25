import { resolveCSS, } from '../app/player/web/messages/rewriter/urlResolve';
import { test, describe, expect } from "@jest/globals";

const testStrs = [
  `@import "custom.css";`,
  `@import url("chrome://communicator/skin/");`,
  `@import '../app/custom.css';`,
  `@import "styles/common.css";`,
  `@import "/css/commonheader.css";`,
  `@import url('https://fonts.googleapis.com/css2family=Open+Sans:wght@300;400;500;700;900&dispay=swap" rel="stylesheet');`,
  `@import '../css/onboardcustom.css';
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;700;900&display=swap" rel="stylesheet');
#login-required {
  color: #fff
}`]
const checkStrs = [
  `@import "https://example.com/custom.css";`,
  `@import url("chrome://communicator/skin/");`,
  `@import 'https://example.com/app/custom.css';`,
  `@import "https://example.com/styles/common.css";`,
  `@import "https://example.com/css/commonheader.css";`,
  `@import url('https://fonts.googleapis.com/css2family=Open+Sans:wght@300;400;500;700;900&dispay=swap%22%20rel=%22stylesheet');`,
  `@import 'https://example.com/css/onboardcustom.css';
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;700;900&display=swap%22%20rel=%22stylesheet');
#login-required {
  color: #fff
};`
]

describe('resolveCSS utils', () => {
  test('should resolve CSS urls', () => {
    for (let i = 0; i < testStrs.length; i++) {
      expect(resolveCSS('https://example.com', testStrs[i])).toBe(checkStrs[i]);
    }
  });
})
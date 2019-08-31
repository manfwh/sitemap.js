/* eslint-env jest, jasmine */
import 'babel-polyfill';
import { xmlLint } from '../index'
const execFileSync = require('child_process').execFileSync
let hasXMLLint = true
try {
  execFileSync("which", ["xmlLint"]);
} catch {
  hasXMLLint = false
}

describe('xmllint', () => {
  it('returns a promise', async () => {
    if (hasXMLLint) {
      expect(xmlLint('./tests/cli-urls.json.xml').catch()).toBeInstanceOf(Promise)
    } else {
      console.warn('skipping xmlLint test, not installed')
      expect(true).toBe(true)
    }
  }, 10000)

  it('resolves when complete', async () => {
    expect.assertions(1)
    if (hasXMLLint) {
      try {
        const result = await xmlLint('./tests/cli-urls.json.xml')
        await expect(result).toBeFalsy()
      } catch (e) {
        console.log(e)
        expect(true).toBe(false)
      }
    } else {
      console.warn('skipping xmlLint test, not installed')
      expect(true).toBe(true)
    }
  }, 60000)

  it('rejects when invalid', async () => {
    expect.assertions(1)
    if (hasXMLLint) {
      await expect(xmlLint('./tests/cli-urls.json.bad.xml')).rejects.toBeTruthy()
    } else {
      console.warn('skipping xmlLint test, not installed')
      expect(true).toBe(true)
    }
  }, 60000)
})

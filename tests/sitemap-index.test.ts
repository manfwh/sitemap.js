import 'babel-polyfill';
import sm, { EnumChangefreq, EnumYesNo, EnumAllowDeny } from '../index'
import os from 'os'
import fs from 'fs'
/* eslint-env jest, jasmine */
function removeFilesArray  (files) {
  if (files && files.length) {
    files.forEach(function (file) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file)
      }
    })
  }
}

const xmlDef = '<?xml version="1.0" encoding="UTF-8"?>'
describe('sitemapIndex', () => {
  it('build sitemap index', () => {
    var expectedResult = xmlDef + '\n' +
    '<?xml-stylesheet type="text/xsl" href="https://test.com/style.xsl"?>\n' +
    '<sitemapindex xmlns="https://www.sitemaps.org/schemas/sitemap/0.9" xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="https://www.google.com/schemas/sitemap-image/1.1" xmlns:video="https://www.google.com/schemas/sitemap-video/1.1">\n' +
    '<sitemap>\n' +
    '<loc>https://test.com/s1.xml</loc>\n' +
    '</sitemap>\n' +
    '<sitemap>\n' +
    '<loc>https://test.com/s2.xml</loc>\n' +
    '</sitemap>\n' +
    '</sitemapindex>'

    var result = sm.buildSitemapIndex({
      urls: ['https://test.com/s1.xml', 'https://test.com/s2.xml'],
      xslUrl: 'https://test.com/style.xsl'
    })

    expect(result).toBe(expectedResult)
  })
  it('build sitemap index with custom xmlNS', () => {
    var expectedResult = xmlDef + '\n' +
    '<sitemapindex xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        '<sitemap>\n' +
            '<loc>https://test.com/s1.xml</loc>\n' +
        '</sitemap>\n' +
        '<sitemap>\n' +
            '<loc>https://test.com/s2.xml</loc>\n' +
        '</sitemap>\n' +
    '</sitemapindex>'

    var result = sm.buildSitemapIndex({
      urls: ['https://test.com/s1.xml', 'https://test.com/s2.xml'],
      xmlNs: 'xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"'
    })

    expect(result).toBe(expectedResult)
  })
  it('build sitemap index with lastmod', () => {
    var expectedResult = xmlDef + '\n' +
    '<sitemapindex xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        '<sitemap>\n' +
            '<loc>https://test.com/s1.xml</loc>\n' +
            '<lastmod>2018-11-26</lastmod>\n' +
        '</sitemap>\n' +
        '<sitemap>\n' +
            '<loc>https://test.com/s2.xml</loc>\n' +
            '<lastmod>2018-11-27</lastmod>\n' +
        '</sitemap>\n' +
    '</sitemapindex>'

    var result = sm.buildSitemapIndex({
      urls: [
        {
          url: 'https://test.com/s1.xml',
          lastmod: '2018-11-26'
        },
        {
          url: 'https://test.com/s2.xml',
          lastmod: '2018-11-27'
        }
      ],
      xmlNs: 'xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"'
    })

    expect(result).toBe(expectedResult)
  })
  it('simple sitemap index', async () => {
    const tmp = os.tmpdir()
    const url1 = 'http://ya.ru'
    const url2 = 'http://ya2.ru'
    const expectedFiles = [
      tmp + '/sm-test-0.xml',
      tmp + '/sm-test-1.xml',
      tmp + '/sm-test-index.xml'
    ]

    expect(
      function () {
        sm.createSitemapIndex({
          cacheTime: 600000,
          hostname: 'https://www.sitemap.org',
          sitemapName: 'sm-test',
          sitemapSize: 1,
          targetFolder: '/tmp2',
          urls: [url1, url2]
        })
      }
    ).toThrowError(/UndefinedTargetFolder/)

    // Cleanup before run test
    removeFilesArray(expectedFiles)

    const [err, result] = await new Promise(resolve => {
      sm.createSitemapIndex({
        cacheTime: 600000,
        hostname: 'https://www.sitemap.org',
        sitemapName: 'sm-test',
        sitemapSize: 1,
        targetFolder: tmp,
        urls: [url1, url2],
        callback: (...args) => { resolve(args) }
      })
    })

    expect(err).toBeFalsy()
    expect(result).toBe(true)
    expectedFiles.forEach(function (expectedFile) {
      expect(fs.existsSync(expectedFile)).toBe(true)
    })
  })
  it('sitemap without callback', () => {
    sm.createSitemapIndex({
      cacheTime: 600000,
      hostname: 'http://www.sitemap.org',
      sitemapName: 'sm-test',
      sitemapSize: 1,
      targetFolder: os.tmpdir(),
      urls: ['http://ya.ru', 'http://ya2.ru']
    })
  })
  it('sitemap with gzip files', async () => {
    const tmp = os.tmpdir()
    const url1 = 'http://ya.ru'
    const url2 = 'http://ya2.ru'
    const expectedFiles = [
      tmp + '/sm-test-0.xml.gz',
      tmp + '/sm-test-1.xml.gz',
      tmp + '/sm-test-index.xml'
    ]

    // Cleanup before run test
    removeFilesArray(expectedFiles)

    const [err, result] = await new Promise(resolve => {
      sm.createSitemapIndex({
        cacheTime: 600000,
        hostname: 'http://www.sitemap.org',
        sitemapName: 'sm-test',
        sitemapSize: 1,
        targetFolder: tmp,
        gzip: true,
        urls: [url1, url2],
        callback: (...args) => { resolve(args) }
      })
    })
    expect(err).toBeFalsy()
    expect(result).toBe(true)
    expectedFiles.forEach(function (expectedFile) {
      expect(fs.existsSync(expectedFile)).toBe(true)
    })
  })
})
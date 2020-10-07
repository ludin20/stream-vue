import defaultSettings from '@/settings'

const title = defaultSettings.title || 'Test Fake System'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}

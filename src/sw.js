// https://vite-pwa-org.netlify.app/workbox/inject-manifest.html#network-first-strategy
import { cacheNames, clientsClaim } from 'workbox-core'
import { registerRoute, setCatchHandler, setDefaultHandler } from 'workbox-routing'
import {
  NetworkFirst,
  NetworkOnly,
  Strategy
} from 'workbox-strategies'

const data = {
  race: false,
  debug: false,
  credentials: 'same-origin',
  networkTimeoutSeconds: 0,
  fallback: 'index.html'
}

const {
  race,
  debug,
  credentials,
  networkTimeoutSeconds,
  fallback, } = data

const cacheName = cacheNames.runtime

function buildStrategy() {
  if (race) {
    class CacheNetworkRace extends Strategy {
      _handle(request, handler) {
        const fetchAndCachePutDone = handler.fetchAndCachePut(request)
        const cacheMatchDone = handler.cacheMatch(request)

        return new Promise((resolve, reject) => {
          fetchAndCachePutDone.then(resolve).catch((e) => {
            if (debug)
              console.log(`Cannot fetch resource: ${request.url}`, e)
          })
          cacheMatchDone.then(response => response && resolve(response))

          // Reject if both network and cache error or find no response.
          Promise.allSettled([fetchAndCachePutDone, cacheMatchDone]).then((results) => {
            const [fetchAndCachePutResult, cacheMatchResult] = results
            if (fetchAndCachePutResult.status === 'rejected' && !cacheMatchResult.value)
              reject(fetchAndCachePutResult.reason)
          })
        })
      }
    }
    return new CacheNetworkRace()
  }
  else {
    if (networkTimeoutSeconds > 0)
      return new NetworkFirst({ cacheName, networkTimeoutSeconds })
    else
      return new NetworkFirst({ cacheName })
  }
}

const manifest = self.__WB_MANIFEST

const cacheEntries = []

const manifestURLs = manifest.map(
  (entry) => {
    const url = new URL(entry.url, self.location)
    cacheEntries.push(new Request(url.href, {
      credentials: credentials
    }))
    return url.href
  }
)

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(cacheEntries)
    })
  )
})

self.addEventListener('activate', (event) => {
  // - clean up outdated runtime cache
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      // clean up those who are not listed in manifestURLs
      cache.keys().then((keys) => {
        keys.forEach((request) => {
          debug && console.log(`Checking cache entry to be removed: ${request.url}`)
          if (!manifestURLs.includes(request.url)) {
            cache.delete(request).then((deleted) => {
              if (debug) {
                if (deleted)
                  console.log(`Precached data removed: ${request.url || request}`)
                else
                  console.log(`No precache found: ${request.url || request}`)
              }
            })
          }
        })
      })
    })
  )
})

registerRoute(
  ({ url }) => manifestURLs.includes(url.href),
  buildStrategy()
)

setDefaultHandler(new NetworkOnly())

// fallback to app-shell for document request
setCatchHandler(({ event }) => {
  switch (event.request.destination) {
    case 'document':
      return caches.match(fallback).then((r) => {
        return r ? Promise.resolve(r) : Promise.resolve(Response.error())
      })
    default:
      return Promise.resolve(Response.error())
  }
})

// this is necessary, since the new service worker will keep on skipWaiting state
// and then, caches will not be cleared since it is not activated
self.skipWaiting()
clientsClaim()


self.addEventListener('notificationclick', function (event) {
  // const clickedNotification = event.notification;
  // clickedNotification.close();

  const urlToOpen = new URL("/", self.location.origin).href;

  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  })
  .then((windowClients) => {
    let matchingClient = null;

    for (let i = 0; i < windowClients.length; i++) {
      const windowClient = windowClients[i];
      if (windowClient.url === urlToOpen) {
        matchingClient = windowClient;
        break;
      }
    }

    if (matchingClient) {
      return matchingClient.focus();
    } else {
      return clients.openWindow(urlToOpen);
    }
  });

  event.waitUntil(promiseChain);
});

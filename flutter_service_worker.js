'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/apil_full.jpg": "a3d726f9b7854fcc8a1ec5ef04997464",
"assets/AssetManifest.json": "d6145be8dd70b71841b7d50427d68f20",
"assets/assets/apil_full.jpg": "a3d726f9b7854fcc8a1ec5ef04997464",
"assets/assets/cover.png": "4cf1d65759555dd442e9ec8d43b67846",
"assets/assets/cover1.png": "4ecb2d38b42805339c4066b82f148178",
"assets/assets/cover2.png": "275f2f9d65892d9e6539d1e2bccd6a5c",
"assets/assets/cover3.png": "bfbbc90125bf66c927b6bc5461c3338f",
"assets/assets/cover4.png": "a25da0ab3b49e0d53e92fc020a9462a5",
"assets/assets/cover5.png": "623ded70532804b8beb48d1bc6fb33ec",
"assets/assets/git.png": "3480db5eabd3ef35cf349caa44c5171e",
"assets/assets/insta.png": "735dda68880a385ce8cc5be4f3c5fcd6",
"assets/assets/loading.png": "a6b97ecb540e6e097a8aa3961ffe84de",
"assets/assets/profile.png": "aad0a244207642fa5c872b8fffaaa567",
"assets/assets/twitter.png": "beab71ce4d4840f0d9192f2f628e1211",
"assets/cover.png": "4cf1d65759555dd442e9ec8d43b67846",
"assets/cover1.png": "4ecb2d38b42805339c4066b82f148178",
"assets/cover1_invert.png": "3722dbbac214428b77a5248b038eac36",
"assets/cover2.png": "275f2f9d65892d9e6539d1e2bccd6a5c",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "7e7a6cccddf6d7b20012a548461d5d81",
"assets/git.png": "3480db5eabd3ef35cf349caa44c5171e",
"assets/insta.png": "735dda68880a385ce8cc5be4f3c5fcd6",
"assets/loading.png": "a6b97ecb540e6e097a8aa3961ffe84de",
"assets/NOTICES": "e0850f9999792e1c13736bab6dbfd6ad",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/packages/fluttertoast/assets/toastify.css": "a85675050054f179444bc5ad70ffc635",
"assets/packages/fluttertoast/assets/toastify.js": "e7006a0a033d834ef9414d48db3be6fc",
"assets/profile.png": "aad0a244207642fa5c872b8fffaaa567",
"assets/twitter.png": "beab71ce4d4840f0d9192f2f628e1211",
"favicon.png": "aad0a244207642fa5c872b8fffaaa567",
"icons/Icon-192.png": "b9c8373c1516229abe17b0810a120a23",
"icons/Icon-512.png": "96bd5141522dc6e05ecc2affd9da0c48",
"icons/Icon-maskable-192.png": "96bd5141522dc6e05ecc2affd9da0c48",
"icons/Icon-maskable-512.png": "b9c8373c1516229abe17b0810a120a23",
"index.html": "1c5b956ca5188d7841957ab6f1ea0f8c",
"/": "1c5b956ca5188d7841957ab6f1ea0f8c",
"main.dart.js": "c23f286368b4ffcaf39a8a62cb182d82",
"manifest.json": "6ff4bfa2a0d8562c3ac1827c2b4638cf",
"version.json": "2af15ef855e3a2f5b0d90648f8e61dcc"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}

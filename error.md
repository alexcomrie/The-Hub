The Netlify deploy errored, with the following guidance provided:

### Diagnosis
The build is failing due to the error `ReferenceError: localStorage is not defined` at [line 86](#L86) and subsequent similar errors in the build logs.

### Solution
The error `ReferenceError: localStorage is not defined` indicates that the code is trying to access the `localStorage` object, which is not available during the build process in a Node.js environment. To fix this issue, you need to ensure that the code related to `localStorage` is only executed in the browser environment.

You can use conditional checks to determine if `localStorage` is available before accessing it:
```javascript
if (typeof localStorage !== 'undefined') {
  // Access localStorage here
}
```

Make sure to verify that the file causing this error, such as `client/src/services/business-service.ts`, includes such conditional checks or moves the `localStorage` related code to be browser-specific.

If you are having trouble with the build settings or the Node.js environment, you can refer to the Netlify documentation on [changing Node versions](https://docs.netlify.com/configure-builds/manage-dependencies/#node-js-and-javascript) for assistance.


The relevant error logs are:

Line 76: [2m../dist/client/[22m[2massets/[22m[36mSEOHead-C62ZYZE7.js     [39m[1m[2m  1.58 kB[22m[1m[22m[2m │ map:   2.83 kB[
Line 77: [2m../dist/client/[22m[36mcategories.js                  [39m[1m[2m  1.67 kB[22m[1m[22m[2m │ map:   2.38 kB[22m
Line 78: [2m../dist/client/[22m[36mbusinesses.js                  [39m[1m[2m  2.11 kB[22m[1m[22m[2m │ map:   3.51 kB[22m
Line 79: [2m../dist/client/[22m[36mproducts.js                    [39m[1m[2m  2.14 kB[22m[1m[22m[2m │ map:   3.26 kB[22m
Line 80: [2m../dist/client/[22m[2massets/[22m[36mseo-DHtOlROE.js         [39m[1m[2m  4.44 kB[22m[1m[22m[2m │ map:   8.57 kB[
Line 81: [2m../dist/client/[22m[36mapp.js                         [39m[1m[2m149.66 kB[22m[1m[22m[2m │ map: 250.46 kB[22m
Line 82: [32m✓ built in 1.02s[39m
Line 83: > rest-express@1.1.0 generate-sitemap
Line 84: > tsx server/generate-sitemap.ts
Line 85: Starting sitemap generation...
Line 86: Error loading from localStorage: ReferenceError: localStorage is not defined
Line 87:     at loadBusinessesFromLocal [90m(/opt/build/repo/[39mclient/src/services/business-service.ts:129:20[90m)[39m
Line 88:     at Object.loadBusinesses [90m(/opt/build/repo/[39mclient/src/services/business-service.ts:309:30[90m)[39m
Line 89:     at generateSitemap [90m(/opt/build/repo/[39mserver/sitemap.ts:35:46[90m)[39m
Line 90:     at writeSitemap [90m(/opt/build/repo/[39mserver/sitemap.ts:88:27[90m)[39m
Line 91:     at main [90m(/opt/build/repo/[39mserver/generate-sitemap.ts:10:11[90m)[39m
Line 92:     at <anonymous> [90m(/opt/build/repo/[39mserver/generate-sitemap.ts:19:1[90m)[39m
Line 93: [90m    at ModuleJob.run (node:internal/modules/esm/module_job:343:25)[39m
Line 94: [90m    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:647:26)[39m
Line 95: [90m    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5)[39m
Line 96: Fetching businesses from: https://docs.google.com/spreadsheets/d/e/2PACX-1vSG8wvM6L5rj3iDGLULLISk-eqNLJYLiweZL7ECWSS2eKiNFC7UQY4
Line 97: Error saving to localStorage: ReferenceError: localStorage is not defined
Line 98:     at saveBusinessesToLocal [90m(/opt/build/repo/[39mclient/src/services/business-service.ts:142:5[90m)[39m
Line 99:     at fetchBusinessesFromNetwork [90m(/opt/build/repo/[39mclient/src/services/business-service.ts:294:11[90m)[39m
Line 100: [90m    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)[39m
Line 101:     at async Object.loadBusinesses [90m(/opt/build/repo/[39mclient/src/services/business-service.ts:319:12[90m)[39m
Line 102:     at async generateSitemap [90m(/opt/build/repo/[39mserver/sitemap.ts:35:24[90m)[39m
Line 103:     at async writeSitemap [90m(/opt/build/repo/[39mserver/sitemap.ts:88:21[90m)[39m
Line 104:     at async main [90m(/opt/build/repo/[39mserver/generate-sitemap.ts:10:5[90m)[39m
Line 105: Checking local storage with cache key: products_aHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vc3ByZWFkc2hlZXRzL2QvZS8yUEFDWC0xdlM3bVdEdmhONXFF
Line 106: Error loading products from localStorage: ReferenceError: localStorage is not defined
Line 107:     at loadProductsFromLocal [90m(/opt/build/repo/[39mclient/src/services/business-service.ts:331:20[90m)[39m
Line 108:     at Object.loadProducts [90m(/opt/build/repo/[39mclient/src/services/business-service.ts:415:28[90m)[39m
Line 109:     at generateSitemap [90m(/opt/build/repo/[39mserver/sitemap.ts:59:53[90m)[39m
Line 110: [90m    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)[39m
Line 111:     at async writeSitemap [90m(/opt/build/repo/[39mserver/sitemap.ts:88:21[90m)[39m
Line 112:     at async main [90m(/opt/build/repo/[39mserver/generate-sitemap.ts:10:5[90m)[39m
Line 113: Fetching products from: https://docs.google.com/spreadsheets/d/e/2PACX-1vS7mWDvhN5qEC2XTKt3sEXWi2lPNLCRT0zNFEUGd1xjMqNkPyiXE8OIc
Line 114: CSV text length: [33m3406[39m
Line 115: First 200 characters of CSV: Name,Category,Price/Size,description,status,Image Url,,
Line 116: rose,Flowers,$800,item description,in stock,https://drive.google.com/file/d/1fraVu4G1Dz-BPl_LdcC_vR7V5OOzBRxH/view?usp=sharing,h
Line 910:   mainImage: [32m''[39m,
Line 911:   additionalImage1: [32m''[39m,
Line 912:   additionalImage2: [32m''[39m
Line 913: }
Line 914: Processed image URLs: { imageUrl: [32m''[39m, additionalImageUrls: [] }
Line 915: Row 52 processed: { name: [32m'Cherry Mature'[39m, imageUrl: [32m''[39m, additionalImageUrls: [] }
Line 916: Parsed products: {
Line 917:   categories: [ [32m'Flowers'[39m, [32m'Fruit Trees'[39m, [32m'Herbs'[39m, [32m'Others'[39m, [32m'Other'[39m ],
Line 918:   totalProducts: [33m52[39m
Line 919: }
Line 920: Error saving products to localStorage: ReferenceError: localStorage is not defined
Line 921:     at saveProductsToLocal [90m(/opt/build/repo/[39mclient/src/services/business-service.ts:360:5[90m)[39m
Line 922:     at fetchProductsFromNetwork [90m(/opt/build/repo/[39mclient/src/services/business-service.ts:396:11[90m)[39m
Line 923: [90m    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)[39m
Line 924:     at async Object.loadProducts [90m(/opt/build/repo/[39mclient/src/services/business-service.ts:425:12[90m)[39m
Line 925:     at async generateSitemap [90m(/opt/build/repo/[39mserver/sitemap.ts:59:31[90m)[39m
Line 926:     at async writeSitemap [90m(/opt/build/repo/[39mserver/sitemap.ts:88:21[90m)[39m
Line 927:     at async main [90m(/opt/build/repo/[39mserver/generate-sitemap.ts:10:5[90m)[39m
Line 928: Checking local storage with cache key: products_aHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vc3ByZWFkc2hlZXRzL2QvZS8yUEFDWC0xdlIzbU9mSlhubV84
Line 929: Error loading products from localStorage: ReferenceError: localStorage is not defined
Line 930:     at loadProductsFromLocal [90m(/opt/build/repo/[39mclient/src/services/business-service.ts:331:20[90m)[39m
Line 931:     at Object.loadProducts [90m(/opt/build/repo/[39mclient/src/services/business-service.ts:415:28[90m)[39m
Line 932:     at generateSitemap [90m(/opt/build/repo/[39mserver/sitemap.ts:59:53[90m)[39m
Line 933: [90m    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)[39m
Line 934:     at async writeSitemap [90m(/opt/build/repo/[39mserver/sitemap.ts:88:21[90m)[39m
Line 935:     at async main [90m(/opt/build/repo/[39mserver/generate-sitemap.ts:10:5[90m)[39m
Line 936: Fetching products from: https://docs.google.com/spreadsheets/d/e/2PACX-1vR3mOfJXnm_8KIGvC4lUEHlwIzJTnRpoxuJpPmENT_lYJ2oP-qZ3yvGz
Line 937: CSV text length: [33m4197[39m
Line 938: First 200 characters of CSV: Name,Category,Price/Size,description,status,Image Url,,
Line 939: Melon Body Oil 1oz,Body Oil,1200,"Benefits
*Assist with skin health
Line 1327:   categories: [
Line 1328:     [32m'Body Oil'[39m,
Line 1329:     [32m'Oil'[39m,
Line 1330:     [32m'Hairgrowth Oil'[39m,
Line 1331:     [32m'Soap'[39m,
Line 1332:     [32m'scrub'[39m,
Line 1333:     [32m'Vaginal Products'[39m
Line 1334:   ],
Line 1335:   totalProducts: [33m10[39m
Line 1336: }
Line 1337: Error saving products to localStorage: ReferenceError: localStorage is not defined
Line 1338:     at saveProductsToLocal [90m(/opt/build/repo/[39mclient/src/services/business-service.ts:360:5[90m)[39m
Line 1339:     at fetchProductsFromNetwork [90m(/opt/build/repo/[39mclient/src/services/business-service.ts:396:11[90m)[39m
Line 1340: [90m    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)[39m
Line 1341:     at async Object.loadProducts [90m(/opt/build/repo/[39mclient/src/services/business-service.ts:425:12[90m)[39m
Line 1342:     at async generateSitemap [90m(/opt/build/repo/[39mserver/sitemap.ts:59:31[90m)[39m
Line 1343:     at async writeSitemap [90m(/opt/build/repo/[39mserver/sitemap.ts:88:21[90m)[39m
Line 1344:     at async main [90m(/opt/build/repo/[39mserver/generate-sitemap.ts:10:5[90m)[39m
Line 1345: Checking local storage with cache key: products_aHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vc3ByZWFkc2hlZXRzL2QvZS8yUEFDWC0xdlF5bmNPX00yWHhp
Line 1346: Error loading products from localStorage: ReferenceError: localStorage is not defined
Line 1347:     at loadProductsFromLocal [90m(/opt/build/repo/[39mclient/src/services/business-service.ts:331:20[90m)[39m
Line 1348:     at Object.loadProducts [90m(/opt/build/repo/[39mclient/src/services/business-service.ts:415:28[90m)[39m
Line 1349:     at generateSitemap [90m(/opt/build/repo/[39mserver/sitemap.ts:59:53[90m)[39m
Line 1350: [90m    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)[39m
Line 1351:     at async writeSitemap [90m(/opt/build/repo/[39mserver/sitemap.ts:88:21[90m)[39m
Line 1352:     at async main [90m(/opt/build/repo/[39mserver/generate-sitemap.ts:10:5[90m)[39m
Line 1353: Fetching products from: https://docs.google.com/spreadsheets/d/e/2PACX-1vQyncO_M2Xxi9qQwng-oKjj4YXzsz27TWjuUS8Mb3UJ_zooVsi8af9PG
Line 1354: CSV text length: [33m10561[39m
Line 1355: First 200 characters of CSV: Name,Category,Price/Size,description,status,Image Url,,
Line 1356: Real Coconut Oil (Coldpressed) 750ML,Oils,,Real Coconut Oil,out of stock,https://drive.google.com/file/d/19MIjfgC7EcdnFGTEunNTF-
Line 1982: Generated direct URL: https://lh3.googleusercontent.com/d/1PV0acD-v2QABmQ39ROoEluUNoQ_tYk3J
Line 1983: Processing URL: https://drive.google.com/file/d/1PV0acD-v2QABmQ39ROoEluUNoQ_tYk3J/view?usp=drive_link
Line 1984: Found file ID (Format 1): 1PV0acD-v2QABmQ39ROoEluUNoQ_tYk3J
Line 1985: Generated direct URL: https://lh3.googleusercontent.com/d/1PV0acD-v2QABmQ39ROoEluUNoQ_tYk3J
Line 1986: Processing URL: https://drive.google.com/file/d/1PV0acD-v2QABmQ39ROoEluUNoQ_tYk3J/view?usp=drive_link
Line 1987: Found file ID (Format 1): 1PV0acD-v2QABmQ39ROoEluUNoQ_tYk3J
Line 1988: Generated direct URL: https://lh3.googleusercontent.com/d/1PV0acD-v2QABmQ39ROoEluUNoQ_tYk3J
Line 1989: Processed image URLs: {
Line 1990:   imageUrl: [32m'https://lh3.googleusercontent.com/d/1PV0acD-v2QABmQ39ROoEluUNoQ_tYk3J'[39m,
Line 1991:   additionalImageUrls: [
Line 1992: Failed during stage 'building site': Build script returned non-zero exit code: 2
Line 1993:     [32m'https://lh3.googleusercontent.com/d/1PV0acD-v2QABmQ39ROoEluUNoQ_tYk3J'[39m,
Line 1994:     [32m'https://lh3.googleusercontent.com/d/1PV0acD-v2QABmQ39ROoEluUNoQ_tYk3J'[39m
Line 1995:   ]
Line 1996: }
Line 1997: Row 19 processed: {
Line 1998:   name: [32m'Castor Oil (ColdPressed) 250ML'[39m,
Line 1999:   imageUrl: [32m'https://lh3.googleusercontent.com/d/1PV0acD-v2QABmQ39ROoEluUNoQ_tYk3J'[39m,
Line 2000:   additionalImageUrls: [
Line 2001:     [32m'https://lh3.googleusercontent.com/d/1PV0acD-v2QABmQ39ROoEluUNoQ_tYk3J'[39m,
Line 2002:     [32m'https://lh3.googleusercontent.com/d/1PV0acD-v2QABmQ39ROoEluUNoQ_tYk3J'[39m
Line 2441:   imageUrl: [32m'https://lh3.googleusercontent.com/d/1ppBGPnk3TTJmTEReK24e0s_bULn-Ki8x'[39m,
Line 2442:   additionalImageUrls: [
Line 2443:     [32m'https://lh3.googleusercontent.com/d/1ppBGPnk3TTJmTEReK24e0s_bULn-Ki8x'[39m,
Line 2444:     [32m'https://lh3.googleusercontent.com/d/1ppBGPnk3TTJmTEReK24e0s_bULn-Ki8x'[39m
Line 2445:   ]
Line 2446: }
Line 2447: Parsed products: {
Line 2448:   categories: [ [32m'Oils'[39m, [32m'Oil Paste'[39m, [32m'Honey'[39m, [32m'Molasses'[39m, [32m'Jerk Sauce'[39m ],
Line 2449:   totalProducts: [33m32[39m
Line 2450: }
Line 2451: Error saving products to localStorage: ReferenceError: localStorage is not defined
Line 2452:     at saveProductsToLocal [90m(/opt/build/repo/[39mclient/src/services/business-service.ts:360:5[90m)[39m
Line 2453:     at fetchProductsFromNetwork [90m(/opt/build/repo/[39mclient/src/services/business-service.ts:396:11[90m)[39m
Line 2454: [90m    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)[39m
Line 2455:     at async Object.loadProducts [90m(/opt/build/repo/[39mclient/src/services/business-service.ts:425:12[90m)[39m
Line 2456:     at async generateSitemap [90m(/opt/build/repo/[39mserver/sitemap.ts:59:31[90m)[39m
Line 2457:     at async writeSitemap [90m(/opt/build/repo/[39mserver/sitemap.ts:88:21[90m)[39m
Line 2458:     at async main [90m(/opt/build/repo/[39mserver/generate-sitemap.ts:10:5[90m)[39m
Line 2459: Error writing sitemap: ReferenceError: __dirname is not defined
Line 2460:     at writeSitemap [90m(/opt/build/repo/[39mserver/sitemap.ts:89:37[90m)[39m
Line 2461: [90m    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)[39m
Line 2462:     at async main [90m(/opt/build/repo/[39mserver/generate-sitemap.ts:10:5[90m)[39m
Line 2463: Sitemap generation failed: ReferenceError: __dirname is not defined
Line 2464:     at writeSitemap [90m(/opt/build/repo/[39mserver/sitemap.ts:89:37[90m)[39m
Line 2465: [90m    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)[39m
Line 2466:     at async main [90m(/opt/build/repo/[39mserver/generate-sitemap.ts:10:5[90m)[39m
Line 2467: [91m[1m​[22m[39m
Line 2468: [91m[1m"build.command" failed                                        [22m[39m
Line 2469: [91m[1m────────────────────────────────────────────────────────────────[22m[39m
Line 2470: ​
Line 2471:   [31m[1mError message[22m[39m
Line 2472:   Command failed with exit code 1: npm run build && npm run generate-sitemap
Line 2473: ​
Line 2474:   [31m[1mError location[22m[39m
Line 2475:   In build.command from netlify.toml:
Line 2476:   npm run build && npm run generate-sitemap
Line 2477: ​
Line 2478:   [31m[1mResolved config[22m[39m
Line 2479:   build:
Line 2480:     command: npm run build && npm run generate-sitemap
Line 2481:     commandOrigin: config
Line 2482:     publish: /opt/build/repo/dist
Line 2483:     publishOrigin: config
Line 2484:   headers:
Line 2485:     - for: /*
      values:
        Content-Security-Policy: "default-src 'self'; script-src 'self' 'unsafe-inline'
          'u
Line 2486: Build failed due to a user error: Build script returned non-zero exit code: 2
Line 2487: Failing build: Failed to build site
Line 2488: Finished processing build request in 17.951s
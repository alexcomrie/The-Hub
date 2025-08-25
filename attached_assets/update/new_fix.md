Troubleshooting Netlify 404 for a Vite + React Site

Step 1: Verify Build Settings & Output. Ensure Netlify is actually building your app and publishing the correct folder. In your Netlify settings (or netlify.toml), set the build command to npm run build (assuming your package.json has "build": "vite build") and set the publish directory to dist – Vite’s default output folder
v4.vitejs.dev
answers.netlify.com
. For example in netlify.toml you might have:

[build]
  command = "npm run build"
  publish = "dist"


Netlify will then run the Vite build and deploy the files in dist. A common pitfall is omitting the build command or misnaming the publish folder. As one Netlify support thread notes, setting the command to npm run build and publish to dist “should solve” the 404 issue when no site is building
answers.netlify.com
. (Make sure your dist folder actually appears after a local npm run build – Vite defaults to placing built files there
v4.vitejs.dev
.)

Step 2: Add SPA Redirects. React apps with client‐side routing need a fallback rule so that all routes serve index.html. Otherwise, navigating or refreshing any path other than / yields a Netlify 404. There are two common solutions:

Using _redirects file: Create a file named _redirects in your public/ folder (Vite will copy this to dist). Put exactly one line:

/*    /index.html   200


This tells Netlify to serve index.html for any URL path. (Vite will bundle this into your site so Netlify sees it at deploy time.) For example, Hrishikesh Kokate points out that you should create public/_redirects with the content /* /index.html 200
stackoverflow.com
.

Using netlify.toml redirects: Alternatively, you can define redirects in netlify.toml. In the repo root, add:

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200


This has the same effect: any path falls back to index.html. (Martijn Pieters confirms that a netlify.toml with [[redirects]] from="/*" to="/index.html" status=200 is the recommended fix
stackoverflow.com
.)

These rules catch all routes and prevent Netlify’s 404 page on refresh or deep links. (If you were using a HashRouter instead of BrowserRouter, you wouldn’t need this – but most React apps use client routing and need a redirect.)

Step 3: Check Vite’s base (public path). Vite’s base option (in vite.config.js/ts) controls the public URL path for assets. By default it is '/'. If you have set base to a sub-path (for example for GitHub Pages) it can break your Netlify deploy. For a Netlify site at root (e.g. yoursite.netlify.app), remove or reset any custom base so it is /. In one case, a user had base: "/Portfolio/" and Netlify did not generate a Portfolio folder in dist, causing a blank page – the fix was simply “Set your base to the default of /”
answers.netlify.com
. Similarly, another report shows removing a base entry (like '/videoteka/') fixed a Vite 404 on Netlify
answers.netlify.com
. In short, ensure vite.config.js does not hardcode a wrong base path. For a root deployment, you can omit base or set it to "/".

Step 4: Example netlify.toml. Putting it all together, your netlify.toml might look like this:

[build]
  command = "npm run build"
  publish = "dist"

# Rewrite all routes to index.html for React Router (SPA)
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200


This tells Netlify how to build and deploy the site, and ensures any client-side route loads index.html instead of a 404. If you prefer _redirects, you can omit the [[redirects]] block and use the file as described above.

Additional Tips: If your project is in a subfolder (e.g. a monorepo), make sure to set Netlify’s “Base directory” (in the UI or netlify.toml [build] base) to point at the folder containing package.json and your code. Also check that your package.json has a proper "build" script (e.g. "vite build") so Netlify can run it. With these fixes – correct build command, publish folder, SPA redirects, and proper Vite base – the site should deploy without the Netlify 404 error
answers.netlify.com
stackoverflow.com
.

References: Netlify’s docs and community show that missing build settings or redirects are the usual culprits for a 404 on Vite+React apps
answers.netlify.com
stackoverflow.com
stackoverflow.com
. The Vite guide also notes dist as the default output (deploy this folder)
v4.vitejs.dev
. These steps ensure Netlify serves your React single-page app correctly.

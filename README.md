# Telemetry

Telemetry is a Remix and React-based blogging platform I built because I wanted parts of Medium and Substack and Ghost all in one, without the fluff. Telemetry:
1. Allows you to read and write Stories without distractions. Views are the only metrics we track!
2. Allows you to invite co-authors and actually write with them collaboratively, not just feature them on the by-line.
   - I'm not actively maintaining this, but the goal here was to explore how an AI agent might join a collaborative session with you to help you write and proofread.
3. Allows you to manage Sessions from multiple devices, see some basic audit-logs, and sign out from devices you don't recognize.
   - Login can be via magic-links and username/password.
   - Another experiment that lives locally on my system is 2FA and passkeys.
4. Read like you're in a library, and write like you're sharing a moment with friends...
   - Each "Story" page is treated like a room, where visitors can drop in (from another story) and leave (to read another story), and you always know _how many others are here, reading this story with you_ at any time.

This repo is the code for the app + the YAML for the infra bits so that I can set up a DigitalOcean VPC to host Telemetry.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`

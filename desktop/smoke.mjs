/**
 * Smoke test for a built desktop bundle.
 *
 * Starts the bundled demo API and the standalone Next server exactly as the
 * Electron shell does, then checks the three things a demo must get right:
 * the public catalogue renders Persian listings, the workspace is reachable
 * with a session, and the contract PDF downloads.
 *
 *   node desktop/smoke.mjs                 # uses desktop/app and desktop/build
 *   node desktop/smoke.mjs --root <dir>    # uses a packaged resources/app dir
 */
import { spawn } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const argument = process.argv.indexOf("--root")
const root = argument > -1 ? path.resolve(process.argv[argument + 1]) : here

// These must match the ports baked into the build by `prepare.mjs`: the API
// base URL is inlined into the Next bundle at build time.
const WEB_PORT = Number(process.env.SMOKE_WEB_PORT ?? 41730)
const API_PORT = Number(process.env.SMOKE_API_PORT ?? 41731)
const BASE = `http://127.0.0.1:${WEB_PORT}`

const children = []
const failures = []

function start(script, env) {
  const child = spawn(process.execPath, [script], {
    cwd: path.dirname(script),
    env: { ...process.env, NODE_ENV: "production", ...env },
    stdio: ["ignore", "pipe", "pipe"],
  })

  child.stdout.on("data", () => {})
  child.stderr.on("data", (chunk) => process.stderr.write(chunk))
  children.push(child)
  return child
}

async function get(pathname, headers = {}) {
  const deadline = Date.now() + 30000

  for (;;) {
    try {
      // Any HTTP answer means the server is up; a 5xx is a result to assert on,
      // not something to wait out.
      return await fetch(`${BASE}${pathname}`, { headers, redirect: "manual" })
    } catch {
      // server not up yet
    }

    if (Date.now() > deadline) throw new Error(`timeout waiting for ${pathname}`)
    await new Promise((resolve) => setTimeout(resolve, 400))
  }
}

function check(name, condition, detail = "") {
  if (condition) {
    console.log(`  ok   ${name}`)
  } else {
    failures.push(`${name} ${detail}`.trim())
    console.log(`  FAIL ${name} ${detail}`.trim())
  }
}

async function main() {
  console.log(`[smoke] root: ${root}`)

  start(path.join(root, "build", "demo-api.cjs"), {
    PREVIEW_GATEWAY_PORT: String(API_PORT),
    PREVIEW_GATEWAY_HOST: "127.0.0.1",
  })

  start(path.join(root, "app", "apps", "web", "server.js"), {
    PORT: String(WEB_PORT),
    HOSTNAME: "127.0.0.1",
  })

  const home = await get("/")
  const homeHtml = await home.text()
  check("home renders", home.status === 200 && homeHtml.includes("AdminHub21"))

  const market = await get("/marketplace")
  const marketHtml = await market.text()
  check("catalogue renders", market.status === 200)
  check("Persian listings", marketHtml.includes("رشد اینستاگرام"))

  const signedOut = await get("/app/wallet")
  check(
    "workspace redirects anonymous visitors",
    signedOut.status === 307 || signedOut.status === 302 || signedOut.status === 303,
    `got ${signedOut.status}`,
  )

  const wallet = await get("/app/wallet", { Cookie: "ah_token=demo-token" })
  const walletHtml = await wallet.text()
  check("wallet renders for a session", wallet.status === 200)
  check("wallet shows a balance", walletHtml.includes("موجودی کل"))

  const contracts = await get("/app/contracts", { Cookie: "ah_token=demo-token" })
  check("contracts render", contracts.status === 200)

  const pdf = await get("/app/contracts/1/pdf", { Cookie: "ah_token=demo-token" })
  const pdfBody = Buffer.from(await pdf.arrayBuffer())
  check(
    "contract PDF downloads",
    pdf.status === 200 && pdfBody.subarray(0, 5).toString() === "%PDF-",
  )
}

main()
  .catch((error) => {
    failures.push(String(error))
    console.error("[smoke] error:", error)
  })
  .finally(() => {
    for (const child of children) child.kill()
    if (failures.length) {
      console.error(`\n[smoke] ${failures.length} failure(s)`)
      process.exit(1)
    }
    console.log("\n[smoke] passed")
    process.exit(0)
  })

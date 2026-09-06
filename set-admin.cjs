const { initializeApp, cert, deleteApp } = require("firebase-admin/app")
const { getAuth } = require("firebase-admin/auth")

const serviceAccount = require("./serviceAccountKey.json")

const uid = process.argv[2]

if (!uid) {
  console.error("")
  console.error("❌ Admin UID is required.")
  console.error("")
  console.error("Usage:")
  console.error("node set-admin.cjs YOUR_UID")
  console.error("")
  process.exit(1)
}

async function setAdminRole() {
  let app

  try {
    app = initializeApp({
      credential: cert(serviceAccount),
    })

    const auth = getAuth(app)

    // Verify that the Firebase user actually exists
    const user = await auth.getUser(uid)

    console.log("")
    console.log("Firebase user found:")
    console.log(`Email: ${user.email || "No email"}`)
    console.log(`UID: ${user.uid}`)
    console.log("")

    // Assign admin custom claim
    await auth.setCustomUserClaims(uid, {
      role: "admin",
    })

    console.log("✅ Admin role successfully assigned.")
    console.log("")
    console.log(`UID: ${uid}`)
    console.log('Role: "admin"')
    console.log("")
    console.log(
      "Now open /admin and log in again with this account."
    )
    console.log("")
  } catch (error) {
    console.error("")
    console.error("❌ Failed to assign admin role.")
    console.error("")
    console.error(error)
    console.error("")
    process.exitCode = 1
  } finally {
    if (app) {
      await deleteApp(app)
    }
  }
}

setAdminRole()
"use server"

import { signOut } from "@/auth"
import appConfig from "@/configs/app.config"
import { adminApiPost } from "@/lib/adminApi"
import { getAdminAuthContext } from "@/lib/adminSession"

const handleSignOut = async () => {
  const context = await getAdminAuthContext()

  if (context) {
    await adminApiPost("/admin/auth/logout", {}, context.accessToken)
  }

  await signOut({ redirectTo: appConfig.unAuthenticatedEntryPath })
}

export default handleSignOut

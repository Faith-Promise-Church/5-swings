import { cookies } from "next/headers";

import { AdminScreen } from "@/components/app/admin-screen";
import { ADMIN_COOKIE_NAME } from "@/lib/constants";
import { hasValidAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const cookieValue = cookies().get(ADMIN_COOKIE_NAME)?.value;

  return <AdminScreen initialAuthenticated={hasValidAdminSession(cookieValue)} />;
}

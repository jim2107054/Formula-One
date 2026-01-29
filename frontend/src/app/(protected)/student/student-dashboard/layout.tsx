import StudentSidebar from "@/components/shared/student-sidebar";
import RoleProtectedLayout from "@/components/layout/RoleProtectedLayout";
import RouteLoading from "@/components/common/RouteLoading";
import { IntlProvider } from "@/providers/IntlProvider";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProtectedLayout role={0}>
      <IntlProvider>
        <div className="flex min-h-screen bg-gray-50">
          <StudentSidebar />
          <main className="flex-1 lg:ml-0 min-h-screen">
            <div className="max-w-7xl mx-auto p-6 lg:p-8">
              <RouteLoading>{children}</RouteLoading>
            </div>
          </main>
        </div>
      </IntlProvider>
    </RoleProtectedLayout>
  );
}

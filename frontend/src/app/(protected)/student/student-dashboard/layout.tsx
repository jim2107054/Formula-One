import Navbar from "@/components/shared/navbar";
import StudentNav from "@/components/shared/student-nav";
import RoleProtectedLayout from "@/components/layout/RoleProtectedLayout";
import RouteLoading from "@/components/common/RouteLoading";
import { IntlProvider } from "@/providers/IntlProvider";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProtectedLayout role={0}>
      <IntlProvider>
        <Theme>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <StudentNav />
            <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">
              <RouteLoading>{children}</RouteLoading>
            </div>
          </div>
        </Theme>
      </IntlProvider>
    </RoleProtectedLayout>
  );
}

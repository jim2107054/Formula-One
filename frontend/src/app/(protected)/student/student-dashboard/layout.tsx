import Navbar from "@/components/shared/navbar";
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
        <div className="max-w-[1440px]  md:max-xl:px-16 mx-auto tight-text-2">
          <Navbar />
          <div className="max-md:px-5">
            {" "}
            <RouteLoading>{children}</RouteLoading>
          </div>
        </div>
      </IntlProvider>
    </RoleProtectedLayout>
  );
}

import { Container } from "@radix-ui/themes";
import EnrollForm from "../_components/EnrollForm";
import FormHeader from "../../_components/form/form-header";

export default function CreateEnroll() {
  return (
    <Container size="3">
      <FormHeader
        title="Create Enrollment"
        subtitle="Add a new enrollment with the students details and module information"
      />
      <EnrollForm
        initialValues={{
          status: "pending",
          lifetime_access: false,
        }}
      />
    </Container>
  );
}

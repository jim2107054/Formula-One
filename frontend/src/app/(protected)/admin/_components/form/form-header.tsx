import { Flex, Text } from "@radix-ui/themes";
import AdminBreadcrumb, { RefLike } from "../admin-breadcrumb";
import Back from "@/components/common/go-back";

interface FormHeaderProps {
  title: string;
  subtitle?: string;

  // Back button props
  backHref?: string;
  backText?: string;

  // Breadcrumb props
  course?: RefLike | null;
  section?: RefLike | null;
  lesson?: RefLike | null;
  item?: RefLike | null;
  activeLevel?: "course" | "section" | "lesson" | "item";
}

export default function FormHeader({
  title,
  subtitle,

  backHref,
  backText,

  // breadcrumb
  course,
  section,
  lesson,
  item,
  activeLevel,
}: FormHeaderProps) {
  return (
    <Flex direction="column" gap="3" mb="4">
      {/* Title + back */}
      <Flex
        justify="between"
        align="center"
        pl="4"
        className="border-l-4 border-accent"
      >
        <Flex direction="column">
          <Text size="5" weight="bold">
            {title}
          </Text>
          {subtitle && (
            <Text size="2" color="gray">
              {subtitle}
            </Text>
          )}
        </Flex>
        <Back href={backHref} text={backText} />
      </Flex>

      {/* Breadcrumb row */}
      {(course || section || lesson || item) && (
        <AdminBreadcrumb
          course={course}
          section={section}
          lesson={lesson}
          item={item}
          activeLevel={activeLevel}
        />
      )}
    </Flex>
  );
}

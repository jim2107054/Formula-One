import Link from "next/link";
import { Flex, Text } from "@radix-ui/themes";
import { Button } from "./button";
import AdminBreadcrumb, { RefLike } from "./admin-breadcrumb";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionHref?: string;
  actionText?: string;
  actionIcon?: React.ReactNode;
  course?: RefLike | null;
  section?: RefLike | null;
  lesson?: RefLike | null;
  item?: RefLike | null;
  activeLevel?: "course" | "section" | "lesson" | "item";
}

export default function PageHeader({
  title,
  subtitle,
  actionHref,
  actionText,
  actionIcon,
  course,
  section,
  lesson,
  item,
  activeLevel,
}: PageHeaderProps) {
  return (
    <Flex direction="column" gap="3" mb="4">
      {/* Title */}
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
        {/* Action Button */}
        {actionHref && actionText && (
          <Link href={actionHref}>
            <Button>
              {actionIcon}
              {actionText}
            </Button>
          </Link>
        )}
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

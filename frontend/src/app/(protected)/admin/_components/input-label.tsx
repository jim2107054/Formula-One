import { ReactNode } from "react";
import { Flex, Text } from "@radix-ui/themes";
import InstructionTooltip from "./tooltip";

export const InputLabel = ({
  children,
  required = false,
  tooltip,
  justify = "between",
}: {
  children: React.ReactNode;
  required?: boolean;
  tooltip?: ReactNode;
  justify?: "start" | "between";
}) => (
  <Flex align="center" justify={justify} gap="2" mb="2">
    <Text size="2" weight="bold">
      {children}{" "}
      {required && (
        <Text as="span" color="red">
          *
        </Text>
      )}
    </Text>
    {tooltip && <InstructionTooltip content={tooltip} />}
  </Flex>
);

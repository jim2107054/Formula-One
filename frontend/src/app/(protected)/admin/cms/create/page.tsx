"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  Checkbox,
  Container,
  Flex,
  Select,
  Text,
} from "@radix-ui/themes";

import {
  CreateCmsRequest,
  FaqItem,
  UpcomingModuleItem,
  UsefulLinkItem,
} from "@/zustand/types/cms";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useCreateCms } from "@/hooks/queries/useCmsQueries";
import FaqForm from "../_components/FaqForm";
import UpcomingModuleForm from "../_components/UpcomingModuleForm";
import UsefulLinksForm from "../_components/UsefulLinksForm";
import FormHeader from "../../_components/form/form-header";
import { InputLabel } from "../../_components/input-label";
import FormAction from "../../_components/form/form-action";
import { useForm } from "react-hook-form";

const CMS_KEY_OPTIONS = [
  { value: "faq", label: "FAQ" },
  { value: "useful-link", label: "Useful Links" },
  { value: "upcoming-module", label: "Upcoming Modules" },
  { value: "custom", label: "Custom" },
];

export default function CreateCmsPage() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [customKey, setCustomKey] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [usefulLinks, setUsefulLinks] = useState<UsefulLinkItem[]>([]);
  const [upcomingModules, setUpcomingModules] = useState<UpcomingModuleItem[]>(
    []
  );

  const {
    formState: { isDirty },
  } = useForm();

  const createCms = useCreateCms({
    onSuccess: () => {
      router.push("/admin/cms");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalKey = key === "custom" ? customKey : key;

    if (!finalKey.trim()) {
      return;
    }

    let data: FaqItem[] | UsefulLinkItem[] | UpcomingModuleItem[];

    if (key === "faq") {
      data = faqItems;
    } else if (key === "useful-link") {
      data = usefulLinks;
    } else if (key === "upcoming-module") {
      data = upcomingModules;
    } else {
      data = [];
    }

    const payload: CreateCmsRequest = {
      key: finalKey,
      is_public: isPublic,
      data,
    };

    createCms.mutate(payload);
  };

  const selectedKeyOption = key || "";

  return (
    <Container size="3">
      <FormHeader
        title="Create CMS Content"
        subtitle="Add a new content for content organization"
      />

      <form onSubmit={handleSubmit}>
        <Card>
          <Flex direction="column" gap="4" p="4">
            <Box>
              <InputLabel
                justify="start"
                tooltip="Select the type of CMS content"
              >
                CMS Type
              </InputLabel>
              <Select.Root value={selectedKeyOption} onValueChange={setKey}>
                <Select.Trigger
                  placeholder="Select CMS Type"
                  className="!cursor-pointer"
                />
                <Select.Content>
                  {CMS_KEY_OPTIONS.map((option) => (
                    <Select.Item
                      key={option.value}
                      value={option.value}
                      className="!cursor-pointer hover:!bg-accent"
                    >
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>

            {key === "custom" && (
              <Box>
                <Text as="label" size="2" weight="bold" mb="2">
                  Custom Key <span style={{ color: "var(--red-9)" }}>*</span>
                </Text>
                <input
                  type="text"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="Enter custom key (e.g., about-us, contact-info)"
                  required
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid var(--gray-6)",
                    borderRadius: "4px",
                    outline: "none",
                    fontSize: "14px",
                  }}
                />
                <Text size="1" color="gray" mt="1">
                  Use lowercase with hyphens (e.g., privacy-policy)
                </Text>
              </Box>
            )}

            <Box>
              <Flex align="center" gap="2">
                <Checkbox
                  checked={isPublic}
                  onCheckedChange={(checked) => setIsPublic(checked === true)}
                  color="cyan"
                />
                <Text as="label" size="2">
                  Make this content public
                </Text>
              </Flex>
            </Box>

            {key === "faq" && (
              <Box mt="4">
                <FaqForm items={faqItems} onChange={setFaqItems} />
              </Box>
            )}

            {key === "useful-link" && (
              <Box mt="4">
                <UsefulLinksForm
                  items={usefulLinks}
                  onChange={setUsefulLinks}
                />
              </Box>
            )}

            {key === "upcoming-module" && (
              <Box mt="4">
                <UpcomingModuleForm
                  items={upcomingModules}
                  onChange={setUpcomingModules}
                />
              </Box>
            )}

            {key === "custom" && (
              <Box
                p="6"
                style={{
                  border: "2px dashed var(--gray-6)",
                  borderRadius: "8px",
                  textAlign: "center",
                  backgroundColor: "var(--gray-2)",
                }}
              >
                <Text color="gray">
                  Custom data structure. You can edit the JSON data after
                  creation.
                </Text>
              </Box>
            )}
          </Flex>
        </Card>

        <FormAction
          saveLabel={createCms.isPending ? "Creating..." : "Create CMS Content"}
          loading={createCms.isPending}
          hasUnsavedChanges={isDirty}
          disabled={
            createCms.isPending ||
            !key ||
            (key === "custom" && !customKey.trim())
          }
        />
      </form>

      {createCms.isPending && <LoadingSpinner />}
    </Container>
  );
}

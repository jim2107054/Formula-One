"use client";

import {
  Box,
  Card,
  Container,
  Flex,
  RadioGroup,
  Separator,
  Text,
} from "@radix-ui/themes";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "../../_components/button";
import FaqForm from "../_components/FaqForm";
import UpcomingModuleForm from "../_components/UpcomingModuleForm";
import UsefulLinksForm from "../_components/UsefulLinksForm";
import FormHeader from "../../_components/form/form-header";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useCms, useUpdateCms } from "@/hooks/queries/useCmsQueries";
import {
  FaqItem,
  UpcomingModuleItem,
  UpdateCmsRequest,
  UsefulLinkItem,
} from "@/zustand/types/cms";
import FormAction from "../../_components/form/form-action";
import { useForm } from "react-hook-form";

export default function EditCmsPage() {
  const router = useRouter();
  const params = useParams();
  const cmsId = params.cmsId as string;

  const { data: cmsData, isLoading } = useCms(cmsId);
  const cms = cmsData?.data;

  const [key, setKey] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [usefulLinks, setUsefulLinks] = useState<UsefulLinkItem[]>([]);
  const [upcomingModules, setUpcomingModules] = useState<UpcomingModuleItem[]>(
    []
  );
  const {
    formState: { isDirty },
  } = useForm();

  const updateCms = useUpdateCms();

  useEffect(() => {
    if (cms) {
      setKey(cms.key);
      setIsPublic(cms.is_public);

      if (cms.key === "faq" && Array.isArray(cms.data)) {
        setFaqItems(cms.data as FaqItem[]);
      } else if (cms.key === "useful-link" && Array.isArray(cms.data)) {
        setUsefulLinks(cms.data as UsefulLinkItem[]);
      } else if (cms.key === "upcoming-module" && Array.isArray(cms.data)) {
        setUpcomingModules(cms.data as UpcomingModuleItem[]);
      }
    }
  }, [cms]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cms) return;

    let data:
      | FaqItem[]
      | UsefulLinkItem[]
      | UpcomingModuleItem[]
      | Record<string, unknown>;

    if (key === "faq") {
      data = faqItems;
    } else if (key === "useful-link") {
      data = usefulLinks;
    } else if (key === "upcoming-module") {
      data = upcomingModules;
    } else {
      data = cms.data;
    }

    const payload: UpdateCmsRequest = {
      is_public: isPublic,
      data,
    };

    // updateCms.mutate({ id: cms.key, data: payload });
    updateCms.mutate(
      { id: cmsId, data: payload },
      {
        onSuccess: () => {
          router.back();
        },
      }
    );
  };

  if (isLoading) return <LoadingSpinner />;

  if (!cms) {
    return (
      <Container size="3">
        <Box p="6" style={{ textAlign: "center" }}>
          <Text color="red" mb="4">
            CMS content not found
          </Text>
          <Button onClick={() => router.push("/admin/cms")}>Back to CMS</Button>
        </Box>
      </Container>
    );
  }

  const getSaveLabel = (key: string, isPending: boolean) => {
    if (isPending) {
      return "Saving...";
    }

    switch (key) {
      case "faq":
        return "Save FAQs";
      case "useful-link":
        return "Save Useful Links";
      case "upcoming-module":
        return "Save Upcoming Modules";
      default:
        return "Update CMS Content";
    }
  };

  return (
    <Container size="3">
      <FormHeader
        title="Edit CMS Content"
        subtitle="Modify the existing CMS content with new details"
      />

      <form onSubmit={handleSubmit}>
        <Card>
          <Flex direction="column" gap="4" p="4">
            <Box>
              <Text size="6" weight="bold" mb="2" className="uppercase">
                # {key}
              </Text>
            </Box>
            <Box>
              <RadioGroup.Root
                value={isPublic ? "published" : "unpublished"}
                onValueChange={(value) => setIsPublic(value === "published")}
                size="2"
                variant="surface"
                color="cyan"
              >
                <Flex direction="row" gap="4" wrap="wrap">
                  <Text as="label" size="2" className="!cursor-pointer">
                    <Flex gap="2" align="center">
                      <RadioGroup.Item value="published" />
                      Publish
                    </Flex>
                  </Text>

                  <Text as="label" size="2" className="!cursor-pointer">
                    <Flex gap="2" align="center">
                      <RadioGroup.Item value="unpublished" />
                      Unpublish
                    </Flex>
                  </Text>
                </Flex>
              </RadioGroup.Root>
            </Box>

            <Separator style={{ width: "100%" }} />

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

            {key !== "faq" &&
              key !== "useful-link" &&
              key !== "upcoming-module" && (
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
                    Custom data structure. Direct editing not supported yet.
                  </Text>
                </Box>
              )}
          </Flex>
        </Card>

        <FormAction
          saveLabel={getSaveLabel(key, updateCms.isPending)}
          loading={updateCms.isPending}
          hasUnsavedChanges={isDirty}
        />
      </form>

      {updateCms.isPending && <LoadingSpinner />}
    </Container>
  );
}

"use client";

import { Box, Card, Flex, Grid, Heading, Text, Button, TextField } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { FaBook, FaFlask, FaSearch, FaRobot, FaComments, FaFileAlt, FaCode, FaArrowRight } from "react-icons/fa";
import api from "@/util/api";
import Link from "next/link";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";

interface Content {
  _id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  topic: string;
}

export default function StudentDashboard() {
  const [theoryContent, setTheoryContent] = useState<Content[]>([]);
  const [labContent, setLabContent] = useState<Content[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [theoryRes, labRes] = await Promise.all([
          api.get("/api/content?category=theory&limit=6"),
          api.get("/api/content?category=lab&limit=6"),
        ]);
        setTheoryContent(theoryRes.data.data || []);
        setLabContent(labRes.data.data || []);
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/student/student-dashboard/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const quickActions = [
    {
      title: "Browse Theory",
      description: "Lecture slides, notes, and references",
      icon: FaBook,
      href: "/student/student-dashboard/theory",
      color: "blue",
    },
    {
      title: "Explore Lab",
      description: "Code examples and exercises",
      icon: FaFlask,
      href: "/student/student-dashboard/lab",
      color: "green",
    },
    {
      title: "AI Assistant",
      description: "Get help with your studies",
      icon: FaRobot,
      href: "/student/student-dashboard/chat",
      color: "purple",
    },
    {
      title: "Search Materials",
      description: "Find specific content",
      icon: FaSearch,
      href: "/student/student-dashboard/search",
      color: "orange",
    },
  ];

  return (
    <Theme>
      <Box className="p-6">
        {/* Welcome Section */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-[var(--Accent-default)] to-[var(--Accent-dark-1)] text-white">
          <Heading size="8" className="mb-2">Welcome to Your Learning Platform</Heading>
          <Text className="mb-6 opacity-90">
            Access course materials, get AI-powered help, and enhance your learning experience.
          </Text>
          
          {/* Search Bar */}
          <Flex gap="3" className="max-w-xl">
            <TextField.Root
              size="3"
              placeholder="Search course materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button size="3" variant="soft" onClick={handleSearch} className="!cursor-pointer !bg-white !text-[var(--Accent-default)]">
              <FaSearch /> Search
            </Button>
          </Flex>
        </Card>

        {/* Quick Actions */}
        <Heading size="5" className="mb-4">Quick Access</Heading>
        <Grid columns={{ initial: "1", sm: "2", lg: "4" }} gap="4" className="mb-8">
          {quickActions.map((action, index) => (
            <Link href={action.href} key={index}>
              <Card className="p-4 h-full hover:shadow-lg transition-all cursor-pointer group">
                <Flex direction="column" gap="3">
                  <Box className={`p-3 rounded-lg w-fit bg-${action.color}-100`}>
                    <action.icon className={`text-${action.color}-600 text-xl`} />
                  </Box>
                  <Box>
                    <Flex align="center" gap="2">
                      <Heading size="3">{action.title}</Heading>
                      <FaArrowRight className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </Flex>
                    <Text className="text-gray-600 text-sm">{action.description}</Text>
                  </Box>
                </Flex>
              </Card>
            </Link>
          ))}
        </Grid>

        {/* Recent Content */}
        <Flex gap="6" direction={{ initial: "column", lg: "row" }}>
          {/* Theory Section */}
          <Box className="flex-1">
            <Flex justify="between" align="center" className="mb-4">
              <Heading size="4">
                <FaBook className="inline mr-2 text-blue-600" />
                Theory Materials
              </Heading>
              <Link href="/student/student-dashboard/theory">
                <Button variant="ghost" size="1" className="!cursor-pointer">
                  View All <FaArrowRight />
                </Button>
              </Link>
            </Flex>
            
            {loading ? (
              <Text>Loading...</Text>
            ) : theoryContent.length === 0 ? (
              <Card className="p-6 text-center">
                <Text className="text-gray-500">No theory content available yet.</Text>
              </Card>
            ) : (
              <Flex direction="column" gap="3">
                {theoryContent.map((content) => (
                  <Card key={content._id} className="p-4 hover:shadow-md transition-shadow">
                    <Flex gap="3" align="start">
                      <Box className="p-2 rounded bg-blue-50">
                        <FaFileAlt className="text-blue-600" />
                      </Box>
                      <Box>
                        <Text className="font-medium">{content.title}</Text>
                        <Text className="text-gray-500 text-sm line-clamp-1">
                          {content.description || content.topic || "No description"}
                        </Text>
                      </Box>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            )}
          </Box>

          {/* Lab Section */}
          <Box className="flex-1">
            <Flex justify="between" align="center" className="mb-4">
              <Heading size="4">
                <FaFlask className="inline mr-2 text-green-600" />
                Lab Materials
              </Heading>
              <Link href="/student/student-dashboard/lab">
                <Button variant="ghost" size="1" className="!cursor-pointer">
                  View All <FaArrowRight />
                </Button>
              </Link>
            </Flex>
            
            {loading ? (
              <Text>Loading...</Text>
            ) : labContent.length === 0 ? (
              <Card className="p-6 text-center">
                <Text className="text-gray-500">No lab content available yet.</Text>
              </Card>
            ) : (
              <Flex direction="column" gap="3">
                {labContent.map((content) => (
                  <Card key={content._id} className="p-4 hover:shadow-md transition-shadow">
                    <Flex gap="3" align="start">
                      <Box className="p-2 rounded bg-green-50">
                        <FaCode className="text-green-600" />
                      </Box>
                      <Box>
                        <Text className="font-medium">{content.title}</Text>
                        <Text className="text-gray-500 text-sm line-clamp-1">
                          {content.description || content.topic || "No description"}
                        </Text>
                      </Box>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            )}
          </Box>
        </Flex>

        {/* AI Chat CTA */}
        <Card className="mt-8 p-6 bg-purple-50">
          <Flex align="center" gap="4" wrap="wrap">
            <Box className="p-4 rounded-full bg-purple-100">
              <FaComments className="text-purple-600 text-2xl" />
            </Box>
            <Box className="flex-1">
              <Heading size="4">Need Help?</Heading>
              <Text className="text-gray-600">
                Chat with our AI assistant to get explanations, summaries, or generate study materials.
              </Text>
            </Box>
            <Link href="/student/student-dashboard/chat">
              <Button size="3" className="!cursor-pointer !bg-purple-600">
                <FaRobot /> Start Chat
              </Button>
            </Link>
          </Flex>
        </Card>
      </Box>
    </Theme>
  );
}

              <Link href={"/student/student-dashboard/upcoming-workshops"}>
                <Button>
                  {intl.formatMessage({ id: "button.exploreWorkshops" })}
                </Button>
              </Link>
              <Button variant="light">
                {intl.formatMessage({ id: "button.getSupport" })}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <>
        <style>{swiperStyles}</style>
        <div className="max-w-[1200px] mx-auto  space-y-10">
          <section className="block xl:hidden">
            <ResumeCard property1="default" enrolls={allModules} />
          </section>
          <div className="grid grid-cols-1 xl:grid-cols-5 xl:gap-6 mt-10 mb-20 ">
            {/* Left column: main content */}
            <main className="lg:col-span-3 order-2 xl:order-1 ">
              <section className="xl:block hidden">
                <ResumeCard property1="default" enrolls={allModules} />
              </section>

              <ModuleSection allModules={allModules} />
            </main>

            {/* Right column: sidebar */}
            <aside className=" max-xl:grid md:max-xl:grid-cols-1 max-xl:mb-6 xl:col-span-2 xl:space-y-6 xl:order-2 order-1 w-full max-xl:gap-8">
              {/* <ZoomCard
            time="09:00 - 18:00"
            title="Zoom introductory lecture"
            subtitle="Certified Neurofeedback Therapist"
            meetingType="Zoom Meeting"
            buttonText="Start Now"
            onStartClick={handleStartMeeting}
            className="max-xl:h-auto "
          /> */}

              <div className="flex  md:justify-between max-md:w-fit xl:mt-11">
                <h2 className="text-xl font-bold text-[var(--Primary)]">
                  {intl.formatMessage({
                    id: "upcomingWorkshops.recentWorkshops",
                  })}
                </h2>
                <Link
                  className="max-md:hidden block"
                  onClick={() => setViewWorkshops(true)}
                  href={"/student/student-dashboard/upcoming-workshops"}
                >
                  <Button endIcon={viewWorkshops && <Spinner />}>
                    {intl.formatMessage({
                      id: "upcomingWorkshops.viewAllWorkshops",
                    })}
                  </Button>
                </Link>
              </div>
              {isLoadingUpcomingModules ? (
                <LoadingSpinner />
              ) : errorUpcomingModules ? (
                <p className="text-red-500">
                  {intl.formatMessage({
                    id: "upcomingWorkshops.errorLoading",
                  })}
                </p>
              ) : (
                <div className="max-md:w-[90%]">
                  <div className="xl:block hidden">
                    <div className="grid gap-4 mt-6">
                      {upcomingModules &&
                        upcomingModules.slice(0, 4).map((module) => (
                          <Link
                            href={module.bookingUrl}
                            key={module.id}
                            target="_blank"
                            className="p-6 group rounded-lg border border-[var(--Primary)] hover:border-[var(--Accent-light)] transition-all duration-300 ease-in-out grid gap-6"
                          >
                            <div className="flex items-center gap-2">
                              <FlagSelector name={module.language} />
                              <p>{module.language}</p>
                            </div>
                            <h2 className="font-semibold leading-[150%] tracking-[-0.02em] group-hover:text-[var(--Accent-default)] duration-300 transition-all ease-in-out">
                              {module.title}
                            </h2>
                          </Link>
                        ))}
                    </div>
                  </div>
                  {/* slider */}
                  <div className="xl:hidden block max-w-screen overflow-x-hidden items-start relative">
                    <Swiper
                      loop={true}
                      autoplay={{ delay: 2000, disableOnInteraction: false }}
                      pagination={{ clickable: true }}
                      modules={[Pagination, Autoplay]}
                      slidesPerView={1}
                      spaceBetween={16}
                      breakpoints={{
                        480: { slidesPerView: 1, spaceBetween: 16 },
                        640: { slidesPerView: 1, spaceBetween: 20 },
                        768: { slidesPerView: 1, spaceBetween: 24 },
                        1024: { slidesPerView: 1, spaceBetween: 24 },
                      }}
                      className="custom-swiper"
                    >
                      {upcomingModules &&
                        upcomingModules.slice(0, 4).map((module) => (
                          <SwiperSlide key={module.id}>
                            <Link
                              href={module.bookingUrl}
                              target="_blank"
                              className="p-6 group rounded-lg border border-[var(--Primary)] hover:border-[var(--Accent-light)] transition-all duration-300 ease-in-out grid gap-6 "
                            >
                              <div className="flex items-center gap-2">
                                <FlagSelector name={module.language} />
                                <p>{module.language}</p>
                              </div>
                              <h2 className="font-semibold leading-[150%] tracking-[-0.02em] group-hover:text-[var(--Accent-default)] duration-300 transition-all ease-in-out">
                                {module.title}
                              </h2>
                            </Link>
                          </SwiperSlide>
                        ))}
                    </Swiper>
                  </div>
                </div>
              )}

              <Link
                href={`/student/student-dashboard/upcoming-workshops`}
                onClick={() => setGotToUpcomingModules(!gotToUpcomingModules)}
                className={`p-6 ${
                  gotToUpcomingModules
                    ? "bg-[var(--Accent-light)]"
                    : "bg-[var(--Primary-light)]"
                } border border-[var(--Primary-light)] hover:border-[var(--Accent-default)]  transition-all duration-300 ease-in-out rounded-[9px] flex items-center space-x-4 cursor-pointer max-md:w-[90%]`}
              >
                <div className="bg-[var(--Accent-default)] p-4 rounded-full w-fit">
                  {gotToUpcomingModules ? (
                    <Spinner className="!size-[50px]" />
                  ) : (
                    <Icon name="graduation" className="size-[58px]" />
                  )}
                </div>
                <div className="flex flex-col  space-y-2.5">
                  <h2 className="text-2xl font-bold text-[var(--Accent-default)]">
                    {intl.formatMessage({ id: "dashboard.workshops" })}
                  </h2>
                  <h2 className="text-[var(--Primary-dark)] text-xl ">
                    {intl.formatMessage({ id: "dashboard.workshops.visit" })}
                  </h2>
                </div>
              </Link>
              {/* <div>
            <h3 className="primary-title">Upcoming Workshops</h3>
            <div className="flex flex-col gap-4 mt-6">
              <Frame
                backSrc="/images/image-15.png"
                frontSrc="/images/gradient-layer.png"
                title="What is Neurofeedback and how it works?"
              />
              <Frame
                backSrc="/images/image-16.png"
                frontSrc="/images/gradient-layer.png"
                title="Advancing Neurofeedback Practice"
              />
            </div>
          </div> */}
            </aside>
          </div>
        </div>
      </>
    );
  }
}

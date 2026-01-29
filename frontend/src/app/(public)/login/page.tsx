import LoginForm from "@/app/(public)/login/_components/LoginForm";
import LoginImageSection from "@/components/ui/login-image-section/LoginImageSection";

export default function Login() {
  return (
    <div className="flex max-w-7xl md:m-auto min-h-screen">
      <div className="flex md:items-center w-full md:justify-center xl:w-auto space-x-[100px]  mx-[52px] md:my-10">
        <LoginImageSection
          imageSrc="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop"
          className="hidden xl:block"
        />

        <LoginForm
          mainTitle="Welcome to EduAI Learning Platform"
          subtitle="An AI-powered supplementary learning platform that enhances university courses by organizing content, enabling intelligent retrieval, generating validated learning materials, and providing a conversational interface for seamless interaction."
          buttonText="Login"
          mailLabel="Email"
          passwordLabel="Password"
        />
      </div>
    </div>
  );
}

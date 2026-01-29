import RegisterForm from "@/app/(public)/register/_components/RegisterForm";
import LoginImageSection from "@/components/ui/login-image-section/LoginImageSection";

export default function Register() {
  return (
    <div className="flex max-w-7xl md:m-auto min-h-screen">
      <div className="flex md:items-center w-full md:justify-center xl:w-auto space-x-[100px] mx-[52px] md:my-10">
        <LoginImageSection
          imageSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
          className="hidden xl:block"
        />

        <RegisterForm
          mainTitle="Create Your Account"
          subtitle="Join EduAI Learning Platform and start your journey with AI-powered learning. Access course materials, intelligent search, and AI-generated content."
          buttonText="Create Account"
        />
      </div>
    </div>
  );
}

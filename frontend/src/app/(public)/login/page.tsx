import LoginForm from "@/app/(public)/login/_components/LoginForm";
import LoginImageSection from "@/components/ui/login-image-section/LoginImageSection";

export default function Login() {
  return (
    <div className="flex max-w-7xl md:m-auto min-h-screen">
      <div className="flex md:items-center w-full md:justify-center xl:w-auto space-x-[100px]  mx-[52px] md:my-10">
        <LoginImageSection
          imageSrc="/images/image-15-full.png"
          className="hidden xl:block"
        />

        <LoginForm
          mainTitle="AI-Powered Learning Platform"
          subtitle="University course learning platform with intelligent search, AI-generated materials, and a conversational interface. Access your Theory and Lab content, get instant help, and enhance your learning experience."
          buttonText="Login"
          mailLabel="Email"
          passwordLabel="Password"
        />
      </div>
    </div>
  );
}

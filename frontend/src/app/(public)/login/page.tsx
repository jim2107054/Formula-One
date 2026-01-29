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
          mainTitle="Welcome to the Neurofeedback Academy"
          subtitle="The Institute for EEG Neurofeedback, IFEN, was founded in 2008 and is one of the leading educational centers for Neurofeedback in Germany and Europe. Its research and development department IFEN-Neuroscience develops useful tools and feedback applications for practitioners and researchers worldwide."
          buttonText="Login"
          mailLabel="Email"
          passwordLabel="Password"
        />
      </div>
    </div>
  );
}

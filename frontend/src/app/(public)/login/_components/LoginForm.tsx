"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useCallback, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { Button, Icon } from "@/components/ui";
import Spinner from "@/components/ui/spinner/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  className?: string;
  mainTitle?: string;
  subtitle?: string;
  mailLabel?: string;
  passwordLabel?: string;
  buttonText?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  className,
  mainTitle = "Welcome to the Neurofeedback Academy",
  subtitle,
  mailLabel = "Email",
  passwordLabel = "Password",
  buttonText = "Login",
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading, userRole, isAuthenticated, clearError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && userRole !== undefined) {
      const redirectDelay = setTimeout(() => {
        switch (userRole) {
          case 2: // admin
            router.replace("/admin/user");
            break;
          case 1: // instructor
            router.replace("/admin/module");
            break;
          case 0: // student
            router.replace("/student/student-dashboard");
            break;
          default:
            router.replace("/");
        }
      }, 1500);

      return () => clearTimeout(redirectDelay);
    }
  }, [isAuthenticated, userRole, router]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    try {
      await login({ email, password });
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col md:justify-center items-center mx-auto xl:scale-100 max-md:pt-20 md:scale-125",
        className
      )}
    >
      <Image src={"/images/logo.png"} width={77} height={28} alt="IFEN Logo" />

      <h1 className="text-center text-black text-xl md:text-2xl font-semibold mt-8 md:mb-[29px]">
        {mainTitle}
      </h1>

      {subtitle && (
        <p className="w-full max-w-[509px] text-sm text-[var(--Primary-dark)] text-center hidden md:block">
          {subtitle}
        </p>
      )}

      <form
        onSubmit={handleLogin}
        className="w-full max-w-[284px] md:max-w-[477px] mt-8 md:mt-[42px]"
      >
        <div>
          <label
            htmlFor="email"
            className="block text-[var(--Primary-dark)] text-xs md:text-base mb-3"
          >
            {mailLabel}
          </label>
          <input
            type="email"
            id="email"
            required
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full h-[34px] md:h-[57px] outline-4 outline-[var(--Primary-light)] p-3 pe-12 hover:outline-[var(--Primary)] focus:outline-[var(--Accent-light)] transition-all duration-300 ease-in-out cursor-pointer focus:cursor-text rounded-[5px] md:rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="password"
            className="block text-[var(--Primary-dark)] text-xs md:text-base mb-3"
          >
            {passwordLabel}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              required
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full h-[34px] md:h-[57px] outline-4 outline-[var(--Primary-light)] p-3 pe-12 hover:outline-[var(--Primary)] focus:outline-[var(--Accent-light)] transition-all duration-300 ease-in-out cursor-pointer focus:cursor-text rounded-[5px] md:rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer disabled:cursor-not-allowed"
              onClick={handleTogglePassword}
              disabled={loading}
            >
              {showPassword ? (
                <FaEye className="text-[var(--Primary)]" />
              ) : (
                <FaEyeSlash className="text-[var(--Primary)]" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-[42px]"
          endIcon={!loading && <Icon name="arrow-circle-right-3" />}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              Loading <Spinner />
            </div>
          ) : (
            buttonText
          )}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;

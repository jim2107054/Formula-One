"use client";

import { Button } from "@/components/ui";
import Spinner from "@/components/ui/spinner/Spinner";
import { useUpdateUser } from "@/hooks/queries/useUserQueries";
import { useAuth } from "@/hooks/useAuth";

import { useState } from "react";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { useIntl } from "react-intl";

export default function ChangePasswordPage() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const { user } = useAuth();
  const useUserUpdate = useUpdateUser();

  const intl = useIntl();

  const handleUpdatePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error("New password and confirmation password do not match.");
      return;
    } else if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    } else if (newPassword.length > 20) {
      toast.error("Password must be no more than 20 characters long.");
      return;
    } else {
      if (user) {
        useUserUpdate.mutate({
          id: user._id,
          data: {
            password: newPassword,
          },
        });
        setNewPassword("");
        setConfirmNewPassword("");
      }
    }
  };

  return (
    <main className="min-h-screen max-w-[1200px] mx-auto">
      <button
        onClick={() => {
          window.history.back();
        }}
        className="flex justify-center items-center space-x-2.5 rounded-lg border border-[var(--Primary-light)] py-2 ps-4 pe-6 font-semibold text-[var(--Primary-dark)] hover:bg-[var(--Primary-light)] hover:text-[var(--Accent-default)] transition-all duration-300 ease-in-out cursor-pointer w-fit shrink-0"
      >
        <IoIosArrowBack />
        <p>{intl.formatMessage({ id: "button.back" })}</p>
      </button>
      <div className="max-w-[510px] border border-[var(--Primary)] rounded-2xl  mx-auto mt-10">
        <div className="text-[var(--Accent-default)] text-[28px] font-semibold p-5 text-center border-b border-[var(--Primary)]">
          {intl.formatMessage({ id: "changePassword.title" })}
        </div>
        <form onSubmit={handleUpdatePassword} className="px-8 py-4 grid gap-4">
          <div>
            <label
              htmlFor="new-password"
              className="block text-[var(--Primary-dark)] text-xs md:text-base mb-3"
            >
              {intl.formatMessage({
                id: "changePassword.placeholder.newPassword",
              })}
            </label>

            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                required
                name="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-[34px] md:h-[57px] outline-2 outline-[var(--Primary-light)] p-3 pe-12 hover:outline-[var(--Primary)] focus:outline-[var(--Accent-light)] transition-all duration-300 ease-in-out cursor-pointer focus:cursor-text rounded-[5px] md:rounded-lg"
              />
              <span
                className="absolute top-1/2 right-3 transform -translate-y-1/2 -tra cursor-pointer"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <FaEye className="text-[var(--Primary)]" />
                ) : (
                  <FaEyeSlash className="text-[var(--Primary)]" />
                )}
              </span>
            </div>
          </div>
          <div>
            <label
              htmlFor="confirm-new-password"
              className="block text-[var(--Primary-dark)] text-xs md:text-base mb-3"
            >
              {intl.formatMessage({
                id: "changePassword.placeholder.confirmNewPassword",
              })}
            </label>

            <div className="relative">
              <input
                type={showConfirmNewPassword ? "text" : "password"}
                required
                name="confirm-new-password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full h-[34px] md:h-[57px] outline-2 outline-[var(--Primary-light)] p-3 pe-12 hover:outline-[var(--Primary)] focus:outline-[var(--Accent-light)] transition-all duration-300 ease-in-out cursor-pointer focus:cursor-text rounded-[5px] md:rounded-lg"
              />
              <span
                className="absolute top-1/2 right-3 transform -translate-y-1/2 -tra cursor-pointer"
                onClick={() =>
                  setShowConfirmNewPassword(!showConfirmNewPassword)
                }
              >
                {showConfirmNewPassword ? (
                  <FaEye className="text-[var(--Primary)]" />
                ) : (
                  <FaEyeSlash className="text-[var(--Primary)]" />
                )}
              </span>
            </div>
            {newPassword !== confirmNewPassword &&
              confirmNewPassword !== "" && (
                <span className="text-red-500 text-xs">
                  The confirmation password does not match the new password.
                </span>
              )}
          </div>

          <Button
            type="submit"
            className="w-full "
            endIcon={useUserUpdate.isPending && <Spinner />}
          >
            {intl.formatMessage({ id: "changePassword.title" })}
          </Button>
        </form>
      </div>
    </main>
  );
}

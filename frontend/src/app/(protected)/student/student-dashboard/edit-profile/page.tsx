"use client";

import { Button } from "@/components/ui";
import Spinner from "@/components/ui/spinner/Spinner";
import { useUpdateUser } from "@/hooks/queries/useUserQueries";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { FaCheckToSlot } from "react-icons/fa6";
import { FiUpload } from "react-icons/fi";
import { IoIosArrowBack } from "react-icons/io";
import { useIntl } from "react-intl";

export default function EditProfilePage() {
  const intl = useIntl();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [fileUploaded, setFileUploaded] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const updateUserData = useUpdateUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const formData = new FormData();
      formData.append("name", name);
      if (profileImage) {
        formData.append("profile", profileImage);
      }

      updateUserData.mutate({
        id: user._id,
        data: formData,
      });
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
      <div className="max-w-[510px] border border-[var(--Primary)] rounded-2xl  mx-auto mt-10 mb-20">
        <div className="text-[var(--Accent-default)] text-[28px] font-semibold p-5 text-center border-b border-[var(--Primary)]">
          {intl.formatMessage({ id: "editProfile.title" })}
        </div>
        <form onSubmit={handleSubmit} className="px-8 py-4 grid gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-[var(--Primary-dark)] text-xs md:text-base mb-3"
            >
              {intl.formatMessage({
                id: "editProfile.lable.name",
              })}
            </label>

            <div className="relative">
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-[34px] md:h-[57px] outline-2 outline-[var(--Primary-light)] p-3 pe-12 hover:outline-[var(--Primary)] focus:outline-[var(--Accent-light)] transition-all duration-300 ease-in-out cursor-pointer focus:cursor-text rounded-[5px] md:rounded-lg"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-[var(--Primary-dark)] text-xs md:text-base mb-3"
            >
              {intl.formatMessage({
                id: "editProfile.lable.email",
              })}
            </label>

            <div className="relative">
              <div className="w-full h-[34px] md:h-[57px] bg-[var(--Primary-light)] text-[var(--Primary)] rounded-[5px] md:rounded-lg flex items-center ps-3">
                <span>{user?.email}</span>
              </div>
            </div>
          </div>
          <div>
            <label
              htmlFor="uploadImage"
              className="block text-[var(--Primary-dark)] text-xs md:text-base mb-3"
            >
              {intl.formatMessage({
                id: "editProfile.lable.image",
              })}
            </label>

            <div className="relative w-full max-w-[448px] h-[217px]">
              <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center rounded-lg px-6 py-4 pointer-events-none">
                {fileUploaded ? (
                  <div className="m-auto grid gap-4">
                    <FaCheckToSlot className="size-16 md:size-24 text-[var(--Accent-default)] mx-auto" />
                  </div>
                ) : (
                  <div className="m-auto grid gap-4">
                    <FiUpload className="size-16 md:size-24 text-[var(--Primary)] mx-auto" />
                    <p className="text-[var(--Primary)] text-center text-sm md:text-base">
                      {intl.formatMessage({
                        id: "editProfile.imagePlaceholder",
                      })}
                    </p>
                  </div>
                )}
              </div>
              <input
                accept="image/*"
                className="w-full cursor-pointer z-10 h-full border border-[var(--Primary)] rounded-lg text-white opacity-0 absolute top-0 left-0"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setProfileImage(file);
                    setFileUploaded(true);
                  }
                }}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={updateUserData.isPending}
            endIcon={updateUserData.isPending && <Spinner />}
          >
            {intl.formatMessage({ id: "editProfile.button.changeProfile" })}
          </Button>
        </form>
      </div>
    </main>
  );
}

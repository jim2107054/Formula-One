"use client";

import { useState } from "react";
import {
  FaUpload,
  FaBook,
  FaFlask,
  FaFilePdf,
  FaFileAlt,
  FaCode,
  FaTimes,
  FaCheckCircle,
  FaCloudUploadAlt,
  FaTags,
} from "react-icons/fa";
import { BiSolidSlideshow } from "react-icons/bi";

export default function UploadContentPage() {
  const [contentType, setContentType] = useState<"theory" | "lab">("theory");
  const [materialType, setMaterialType] = useState<string>("slide");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [week, setWeek] = useState("1");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const materialTypes = contentType === "theory" 
    ? [
        { id: "slide", label: "Lecture Slides", icon: BiSolidSlideshow },
        { id: "pdf", label: "PDF Document", icon: FaFilePdf },
        { id: "notes", label: "Notes", icon: FaFileAlt },
        { id: "reference", label: "Reference", icon: FaBook },
      ]
    : [
        { id: "code", label: "Code Files", icon: FaCode },
        { id: "exercise", label: "Exercise", icon: FaFileAlt },
      ];

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("topic", topic);
      formData.append("week", week);
      formData.append("type", materialType);
      formData.append("contentType", contentType);
      tags.forEach(tag => formData.append("tags", tag));
      files.forEach(file => formData.append("files", file));

      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api";
      const endpoint = contentType === "theory" ? "theory" : "lab";
      
      const response = await fetch(`${BACKEND_URL}/content/${endpoint}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      setUploadSuccess(true);

      // Reset after success
      setTimeout(() => {
        setUploadSuccess(false);
        setTitle("");
        setDescription("");
        setTopic("");
        setTags([]);
        setFiles([]);
      }, 3000);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload content. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--Primary)] to-[var(--Accent-default)] rounded-lg flex items-center justify-center">
            <FaUpload className="text-white" />
          </div>
          Upload New Content
        </h1>
        <p className="text-gray-600 mt-1">
          Add new learning materials to the course
        </p>
      </div>

      {uploadSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <FaCheckCircle className="text-green-500 w-6 h-6" />
          <div>
            <p className="font-medium text-green-800">Content uploaded successfully!</p>
            <p className="text-sm text-green-600">Your content is now available for students.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Type Selection */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4">Content Category</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setContentType("theory");
                setMaterialType("slide");
              }}
              className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                contentType === "theory"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaBook className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Theory Materials</p>
                <p className="text-sm text-gray-500">Slides, PDFs, Notes</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setContentType("lab");
                setMaterialType("code");
              }}
              className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                contentType === "lab"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaFlask className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Lab Materials</p>
                <p className="text-sm text-gray-500">Code, Exercises</p>
              </div>
            </button>
          </div>
        </div>

        {/* Material Type */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4">Material Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {materialTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setMaterialType(type.id)}
                  className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    materialType === type.id
                      ? "border-[var(--Primary)] bg-[var(--Primary-light)]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-semibold">Content Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter content title"
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--Primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a brief description"
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--Primary)] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic *</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Machine Learning"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--Primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Week</label>
              <select
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--Primary)]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                  <option key={w} value={w}>
                    Week {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaTags className="inline w-4 h-4 mr-1" />
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--Primary)]"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[var(--Primary-light)] text-[var(--Primary)] rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)}>
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4">Upload Files</h2>
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[var(--Primary)] transition-colors cursor-pointer"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <FaCloudUploadAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-sm text-gray-400">
              Supported: PDF, PPT, PPTX, DOC, DOCX, PY, JS, TS, JAVA, etc.
            </p>
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FaFileAlt className="text-gray-400" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-400">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFiles(files.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            disabled={uploading || !title || !topic}
            className="px-6 py-3 bg-[var(--Primary)] text-white rounded-lg hover:bg-[var(--Primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <FaUpload />
                Publish Content
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

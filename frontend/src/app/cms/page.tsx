"use client";

import { useState, useEffect } from "react";
import cmsService, { Content } from "@/services/cms.service";
import Link from "next/link";

export default function CmsPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"theory" | "lab">("theory");
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState<
    "slides" | "pdf" | "code" | "notes"
  >("notes");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const data = await cmsService.getAllContent();
      setContents(data);
    } catch (error) {
      console.error("Failed to load content", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setUploading(true);
    try {
      let filePath = "";
      let fileName = "";

      if (file) {
        const uploadResult = await cmsService.uploadFile(file);
        filePath = uploadResult.filePath;
        fileName = uploadResult.fileName;
      }

      await cmsService.createContent({
        title,
        description,
        category,
        metadata: {
          topic,
          week: 1,
          tags: [],
          contentType,
        },
        filePath,
        fileName,
      });

      // Reset
      setTitle("");
      setDescription("");
      setFile(null);
      loadContent();
    } catch (error) {
      console.error("Failed to create content", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await cmsService.deleteContent(id);
      loadContent();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <Link
              href="/"
              className="text-neutral-400 hover:text-white mb-2 block"
            >
              ← Back
            </Link>
            <h1 className="text-3xl font-bold">Content Management</h1>
          </div>
          <div className="bg-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
            Admin Mode
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 h-fit">
            <h2 className="text-xl font-semibold mb-4">Upload New Material</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  Title
                </label>
                <input
                  className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">
                    Category
                  </label>
                  <select
                    className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as "theory" | "lab")}
                  >
                    <option value="theory">Theory</option>
                    <option value="lab">Lab</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">
                    Type
                  </label>
                  <select
                    className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white"
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as "slides" | "pdf" | "code" | "notes")}
                  >
                    <option value="notes">Notes</option>
                    <option value="slides">Slides</option>
                    <option value="pdf">PDF</option>
                    <option value="code">Code</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  Topic
                </label>
                <input
                  className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  File
                </label>
                <input
                  type="file"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white text-sm"
                  onChange={(e) =>
                    setFile(e.target.files ? e.target.files[0] : null)
                  }
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Create Content"}
              </button>
            </form>
          </div>

          {/* Content List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Existing Materials</h2>
            {loading ? (
              <div className="text-neutral-500 animate-pulse">
                Loading content...
              </div>
            ) : contents.length === 0 ? (
              <div className="text-neutral-500 bg-neutral-900 p-8 rounded-xl text-center">
                No content uploaded yet.
              </div>
            ) : (
              contents.map((item) => (
                <div
                  key={item.id}
                  className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex justify-between items-start"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${item.category === "theory" ? "bg-purple-900 text-purple-200" : "bg-green-900 text-green-200"}`}
                      >
                        {item.category}
                      </span>
                      <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded">
                        {item.metadata.contentType}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-neutral-400 text-sm mb-2">
                      {item.description}
                    </p>
                    <div className="text-xs text-neutral-500">
                      Topic: {item.metadata.topic} • Added:{" "}
                      {new Date(item.createdAt).toLocaleDateString()}
                      {item.fileName && (
                        <span className="block mt-1 text-blue-400">
                          📎 {item.fileName}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:bg-red-900/20 p-2 rounded"
                  >
                    🗑
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

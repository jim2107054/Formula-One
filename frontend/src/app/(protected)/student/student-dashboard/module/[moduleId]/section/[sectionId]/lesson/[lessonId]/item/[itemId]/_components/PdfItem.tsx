"use client";

import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { usePathname } from "next/navigation";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

export default function PdfItem({ url = "" }: { url?: string }) {
  const pathname = usePathname();

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [],
    renderToolbar: (Toolbar) => (
      <Toolbar>
        {(slots) => (
          <div className="rpv-default-layout__toolbar-custom flex  md:justify-between items-center w-fit  md:w-full">
            <div className="flex items-center md:px-8">
              <slots.GoToPreviousPage />
              <slots.CurrentPageInput />
              <slots.NumberOfPages />
              <slots.GoToNextPage />
            </div>
            <div className="flex items-center  md:px-8">
              <slots.ZoomOut />
              <slots.CurrentScale />
              <slots.ZoomIn />
            </div>
            <div className="flex items-center  md:px-8">
              <slots.Print />
              <slots.EnterFullScreen />
              <slots.Download />
            </div>
          </div>
        )}
      </Toolbar>
    ),
  });

  return (
    <div className="mt-10">
      {pathname.includes("certificate") ? (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
          <div style={{ height: "750px" }}>
            <Viewer fileUrl={url} />
          </div>
        </Worker>
      ) : (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
          <div style={{ height: "750px" }}>
            <Viewer fileUrl={url} plugins={[defaultLayoutPluginInstance]} />
          </div>
        </Worker>
      )}
    </div>
  );
}

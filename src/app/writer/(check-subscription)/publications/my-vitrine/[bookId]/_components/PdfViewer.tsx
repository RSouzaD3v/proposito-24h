"use client";

export default function PdfViewer({ url }: { url: string }) {
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <iframe
        src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
        className="w-full h-full border-0"
        style={{
          display: "block",
          overflow: "hidden",
        }}
      />
    </div>
  );
}

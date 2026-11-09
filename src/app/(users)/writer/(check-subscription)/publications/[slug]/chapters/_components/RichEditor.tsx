"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Image from "@tiptap/extension-image";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import { common, createLowlight } from "lowlight";
const lowlight = createLowlight(common);

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Quote, List, ListOrdered, Link as LinkIcon, Type, Highlighter,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Image as ImageIcon, Minus, Undo2, Redo2, Eraser
} from "lucide-react";
import { uploadImage } from "@/lib/uploadImage";

type Props = { value?: string; onChange: (html: string) => void; toolbarClassName?: string };

const FONT_SIZES = [14, 16, 18, 20, 24, 28, 32]; // px
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/** Botão de toolbar: evita submit do <form> e mantém foco no editor */
function TB(props: React.ComponentProps<typeof Button>) {
  const { onMouseDown, type, ...rest } = props;
  return (
    <Button
      type={type ?? "button"}
      onMouseDown={(e) => {
        // evita perder o foco do editor e previne submit
        e.preventDefault();
        onMouseDown?.(e);
      }}
      {...rest}
    />
  );
}

export default function RichEditor({ value, onChange, toolbarClassName = "top-0" }: Props) {
  const imageInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Highlight,
      Superscript,
      Subscript,
      TextStyle, // usaremos updateAttributes('textStyle', { fontSize })
      Placeholder.configure({ placeholder: "Escreva o conteúdo do capítulo..." }),
      Link.configure({
        autolink: true,
        openOnClick: true,
        linkOnPaste: true,
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image,
      HorizontalRule,
      CodeBlockLowlight.configure({
        lowlight,
        enableTabIndentation: true,
        defaultLanguage: "plaintext",
      }),
      Typography,
    ],
    content: value || "",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "tiptap prose prose-neutral max-w-none min-h-[260px] focus:outline-none " +
          "dark:prose-invert prose-a:underline prose-strong:font-semibold " +
          "prose-img:rounded-lg prose-hr:my-6",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== undefined && value !== current) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const insertImage = useCallback(async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const src = await uploadImage(file, "chapter-images");
      editor?.chain().focus().setImage({ src, alt: "" }).run();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "O envio da imagem falhou.");
    } finally {
      setUploading(false);
      if (imageInput.current) imageInput.current.value = "";
    }
  }, [editor]);

  const setLink = useCallback(() => {
    const prev = (editor?.getAttributes("link").href as string | undefined) ?? "https://";
    const url = window.prompt("URL do link:", prev);
    if (url === null) return;
    if (url === "") { editor?.chain().focus().unsetLink().run(); return; }
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const applyFontSizeSmart = (px: number | "") => {
    if (!editor) return;
    const chain = editor.chain().focus();
    const { empty, $from } = editor.state.selection;
    if (empty) {
      const start = $from.start($from.depth);
      const end = $from.end($from.depth);
      chain.setTextSelection({ from: start, to: end });
    }
    if (px === "") {
      chain.updateAttributes("textStyle", { fontSize: null as any }).removeEmptyTextStyle().run();
    } else {
      chain.updateAttributes("textStyle", { fontSize: `${px}px` }).run();
    }
  };

  const stepFontSize = (delta: number) => {
    if (!editor) return;
    const currentStr = (editor.getAttributes("textStyle")?.fontSize as string | undefined) ?? "";
    const currentPx = parseInt(currentStr, 10) || 16;
    const next = clamp(currentPx + delta, 12, 48);
    applyFontSizeSmart(next);
  };

  if (!editor) return null;

  const isActive = (name: string, attrs?: any) => editor.isActive(name as any, attrs);
  const isActiveAlign = (a: "left" | "center" | "right" | "justify") => editor.isActive({ textAlign: a });
  const currentSizeStr = (editor.getAttributes("textStyle")?.fontSize as string | undefined) ?? "";
  const currentSizePx = currentSizeStr ? String(parseInt(currentSizeStr, 10)) : "";

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className={`sticky z-10 mb-2 rounded-lg border bg-white p-2 shadow-sm flex flex-wrap gap-1 not-prose ${toolbarClassName}`}>
        <TB variant={isActive("bold") ? "default" : "outline"} size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()} title="Negrito (Ctrl/Cmd+B)">
          <Bold className="size-4" />
        </TB>
        <TB variant={isActive("italic") ? "default" : "outline"} size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()} title="Itálico (Ctrl/Cmd+I)">
          <Italic className="size-4" />
        </TB>
        <TB variant={isActive("underline") ? "default" : "outline"} size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()} title="Sublinhar">
          <UnderlineIcon className="size-4" />
        </TB>
        <TB variant={isActive("strike") ? "default" : "outline"} size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()} title="Tachar">
          <Strikethrough className="size-4" />
        </TB>
        <TB variant={isActive("highlight") ? "default" : "outline"} size="sm"
          onClick={() => editor.chain().focus().toggleHighlight().run()} title="Realçar">
          <Highlighter className="size-4" />
        </TB>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <TB variant={isActive("heading", { level: 2 }) ? "default" : "outline"} size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Título (H2)">
          <Type className="size-4 mr-1" /> H2
        </TB>
        <TB variant={isActive("heading", { level: 3 }) ? "default" : "outline"} size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Subtítulo (H3)">
          <Type className="size-4 mr-1" /> H3
        </TB>

        <TB variant={isActive("bulletList") ? "default" : "outline"} size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()} title="Lista com pontos">
          <List className="size-4" />
        </TB>
        <TB variant={isActive("orderedList") ? "default" : "outline"} size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Lista numerada">
          <ListOrdered className="size-4" />
        </TB>
        <TB variant={isActive("blockquote") ? "default" : "outline"} size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Citação (bloco)">
          <Quote className="size-4" />
        </TB>

        <TB variant={isActive("link") ? "default" : "outline"} size="sm" onClick={setLink} title="Inserir link">
          <LinkIcon className="size-4" />
        </TB>
        <TB variant="outline" size="sm" disabled={uploading} onClick={() => imageInput.current?.click()} title="Inserir imagem">
          <ImageIcon className="size-4" />
        </TB>
        <input
          ref={imageInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => insertImage(event.target.files?.[0])}
        />

        <Separator orientation="vertical" className="mx-1 h-6" />
        <TB variant={isActiveAlign("left") ? "default" : "outline"} size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Alinhar à esquerda">
          <AlignLeft className="size-4" />
        </TB>
        <TB variant={isActiveAlign("center") ? "default" : "outline"} size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Centralizar">
          <AlignCenter className="size-4" />
        </TB>
        <TB variant={isActiveAlign("right") ? "default" : "outline"} size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Alinhar à direita">
          <AlignRight className="size-4" />
        </TB>
        <TB variant={isActiveAlign("justify") ? "default" : "outline"} size="sm"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()} title="Justificar">
          <AlignJustify className="size-4" />
        </TB>

        <Separator orientation="vertical" className="mx-1 h-6" />
        <TB variant="outline" size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Separador">
          <Minus className="size-4" />
        </TB>

        <Separator orientation="vertical" className="mx-1 h-6" />
        <TB variant="outline" size="sm" onClick={() => editor.chain().focus().undo().run()} title="Desfazer (Ctrl/Cmd+Z)">
          <Undo2 className="size-4" />
        </TB>
        <TB variant="outline" size="sm" onClick={() => editor.chain().focus().redo().run()} title="Refazer (Ctrl/Cmd+Shift+Z)">
          <Redo2 className="size-4" />
        </TB>
        <TB
          variant="outline"
          size="sm"
          title="Limpar formatação"
          onClick={() =>
            editor.chain().focus()
              .unsetAllMarks()
              .updateAttributes("textStyle", { fontSize: null as any })
              .removeEmptyTextStyle()
              .run()
          }
        >
          <Eraser className="size-4" />
        </TB>

        <Separator orientation="vertical" className="mx-1 h-6" />
        {/* <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Tamanho</label>
          <select
            className="h-8 rounded-md border px-2 text-sm"
            value={currentSizePx}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) applyFontSizeSmart("");
              else applyFontSizeSmart(parseInt(v, 10));
            }}
            onMouseDown={(e) => e.preventDefault()} // evita blur no editor
          >
            <option value="">Padrão</option>
            {FONT_SIZES.map((s) => (
              <option key={s} value={String(s)}>{s}px</option>
            ))}
          </select>
          <TB variant="outline" size="sm" onClick={() => stepFontSize(-2)} title="Diminuir (A-)">A-</TB>
          <TB variant="outline" size="sm" onClick={() => stepFontSize(+2)} title="Aumentar (A+)">A+</TB>
        </div> */}
      </div>

      {uploading && <p role="status" className="mb-2 text-sm text-[var(--liquid-muted)]">Enviando imagem...</p>}
      {uploadError && <p role="alert" className="mb-2 text-sm text-red-700">{uploadError}</p>}

      <div className="rounded-lg border bg-[#fffdf9] p-5 shadow-sm md:p-8" style={{ fontFamily: 'Georgia, "Iowan Old Style", "Times New Roman", serif' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

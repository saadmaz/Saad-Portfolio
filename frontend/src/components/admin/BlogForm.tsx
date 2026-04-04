import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Save,
  Trash2,
  Image as ImageIcon,
  Tag as TagIcon,
  Send,
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Minus,
  Link as LinkIcon,
  Undo,
  Redo,
  Type,
} from 'lucide-react';
import { BlogService } from '@/services/blog-service';
import { toast } from "sonner";
import ImageUpload from './ImageUpload';
import { cn } from "@/shared/lib/utils";

// ── Schema ────────────────────────────────────────────────────────
const blogSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  slug: z.string().min(5, 'Slug must be at least 5 characters'),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters'),
  category: z.string().min(2, 'Category is required'),
  author: z.string().min(2, 'Author is required'),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  tags: z.array(z.string()).optional().default([]),
  published: z.boolean().default(false),
});

type BlogFormValues = z.infer<typeof blogSchema>;

// ── Slug helper ───────────────────────────────────────────────────
const toSlug = (s: string) =>
  s.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');

// ── Toolbar button ────────────────────────────────────────────────
const ToolbarBtn = ({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={cn(
      "p-1.5 rounded-lg transition-all flex items-center justify-center",
      active
        ? "bg-accent text-black"
        : "text-white/50 hover:text-white hover:bg-white/10"
    )}
  >
    {children}
  </button>
);

// ── Main component ────────────────────────────────────────────────
const BlogForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentError, setContentError] = useState('');
  const isEditMode = !!id && id !== 'new';

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: { author: 'Saad Mazhar', published: false, tags: [], category: 'Tech' },
  });

  const titleValue = watch('title');
  const slugValue = watch('slug');

  // ── TipTap editor ──────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: { HTMLAttributes: { class: 'list-disc pl-5' } },
        orderedList: { HTMLAttributes: { class: 'list-decimal pl-5' } },
        code: { HTMLAttributes: { class: 'bg-white/10 rounded px-1 py-0.5 font-mono text-sm text-accent' } },
        codeBlock: { HTMLAttributes: { class: 'bg-black/40 rounded-xl p-4 font-mono text-sm border border-white/10 my-2' } },
        blockquote: { HTMLAttributes: { class: 'border-l-4 border-accent/40 pl-4 italic text-white/60 my-3' } },
        horizontalRule: { HTMLAttributes: { class: 'border-white/10 my-4' } },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-accent underline underline-offset-4 hover:text-accent/80', target: '_blank' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-xl max-w-full my-4 border border-white/10' },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your post here. Use the toolbar above for formatting…',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm max-w-none min-h-[360px] focus:outline-none px-5 py-4 text-white/85 leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      if (text.length >= 50) setContentError('');
    },
  });

  // ── Auto-slug from title (new posts only) ─────────────────────
  useEffect(() => {
    if (!isEditMode && titleValue && !slugValue) {
      setValue('slug', toSlug(titleValue));
    }
  }, [titleValue, isEditMode]);

  // ── Load post for edit mode ────────────────────────────────────
  const loadPost = useCallback(async () => {
    try {
      setIsLoading(true);
      const post = await BlogService.getById(id!);
      if (post) {
        reset({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          category: post.category,
          author: post.author,
          image: post.image || '',
          tags: post.tags || [],
          published: post.published,
        });
        // Load HTML content into editor
        if (editor && post.content) {
          editor.commands.setContent(post.content);
        }
      }
    } catch {
      toast.error('Failed to load blog post');
    } finally {
      setIsLoading(false);
    }
  }, [id, reset, editor]);

  useEffect(() => {
    if (isEditMode && editor) {
      loadPost();
    }
  }, [isEditMode, editor]);

  // ── Submit ────────────────────────────────────────────────────
  const onSubmit = async (data: BlogFormValues, publish?: boolean) => {
    const html = editor?.getHTML() ?? '';
    const text = editor?.getText() ?? '';

    if (text.length < 50) {
      setContentError('Content must be at least 50 characters');
      return;
    }
    setContentError('');

    try {
      setIsLoading(true);
      const payload = {
        ...data,
        content: html,
        published: publish !== undefined ? publish : data.published,
      };
      if (isEditMode) {
        await BlogService.update(id!, payload);
        toast.success('Post updated');
      } else {
        await BlogService.create({ ...payload, date: new Date().toISOString() });
        toast.success('Post created');
      }
      navigate('/admin/blogs');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await BlogService.delete(id!);
      toast.success('Post deleted');
      navigate('/admin/blogs');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  // ── Link handler ──────────────────────────────────────────────
  const handleSetLink = () => {
    const url = window.prompt('Enter URL:');
    if (!url) return;
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Page header */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl hover:bg-white/10 w-9 h-9 flex-shrink-0"
          onClick={() => navigate('/admin/blogs')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            {isEditMode ? 'Edit Post' : 'New Post'}
          </h1>
          <p className="text-white/35 text-xs mt-0.5">
            {isEditMode ? 'Update your blog post content and metadata.' : 'Write something worth reading.'}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSubmit((d) => onSubmit(d, false))}
            disabled={isLoading}
            className="border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-white/70 rounded-xl font-bold text-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" /> Save Draft
          </Button>
          <Button
            onClick={handleSubmit((d) => onSubmit(d, true))}
            disabled={isLoading}
            className="bg-accent hover:bg-accent/90 text-black font-black rounded-xl shadow-[0_0_20px_rgba(45,212,191,0.2)] text-xs"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            {isEditMode ? 'Update & Publish' : 'Publish'}
          </Button>
          {isEditMode && (
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500/60 hover:bg-red-500/10 hover:text-red-500 rounded-xl w-9 h-9"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Main editor column ── */}
        <div className="lg:col-span-3 space-y-5">
          {/* Title + slug */}
          <Card className="bg-white/[0.03] border-white/[0.07]">
            <CardContent className="p-5 space-y-4">
              <div>
                <input
                  {...register('title')}
                  placeholder="Post title…"
                  className="w-full bg-transparent border-none text-2xl font-extrabold text-white placeholder:text-white/20 focus:outline-none leading-tight"
                />
                {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06]">
                <Type className="w-3 h-3 text-white/25 flex-shrink-0" />
                <span className="text-[10px] text-white/25 font-medium uppercase tracking-widest">Slug</span>
                <Input
                  {...register('slug')}
                  placeholder="auto-generated-from-title"
                  className="h-7 text-xs bg-white/5 border-white/10 text-white/60 font-mono max-w-xs rounded-lg focus:ring-accent/30"
                />
                {errors.slug && <p className="text-xs text-red-400">{errors.slug.message}</p>}
              </div>

              <div>
                <textarea
                  {...register('excerpt')}
                  placeholder="A compelling excerpt to hook readers…"
                  rows={2}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm italic text-white/60 placeholder:text-white/20 resize-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 outline-none transition-all"
                />
                {errors.excerpt && <p className="text-xs text-red-400">{errors.excerpt.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Rich text editor */}
          <Card className="bg-white/[0.03] border-white/[0.07] overflow-hidden">
            <CardHeader className="border-b border-white/[0.06] p-0">
              {/* Toolbar */}
              {editor && (
                <div className="flex flex-wrap items-center gap-0.5 p-2.5">
                  <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
                    <Bold className="w-3.5 h-3.5" />
                  </ToolbarBtn>
                  <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
                    <Italic className="w-3.5 h-3.5" />
                  </ToolbarBtn>

                  <div className="w-px h-5 bg-white/10 mx-1" />

                  <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
                    <Heading2 className="w-3.5 h-3.5" />
                  </ToolbarBtn>
                  <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
                    <Heading3 className="w-3.5 h-3.5" />
                  </ToolbarBtn>

                  <div className="w-px h-5 bg-white/10 mx-1" />

                  <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
                    <List className="w-3.5 h-3.5" />
                  </ToolbarBtn>
                  <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List">
                    <ListOrdered className="w-3.5 h-3.5" />
                  </ToolbarBtn>

                  <div className="w-px h-5 bg-white/10 mx-1" />

                  <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code">
                    <Code className="w-3.5 h-3.5" />
                  </ToolbarBtn>
                  <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block">
                    <span className="text-[10px] font-black font-mono leading-none px-0.5">{'{ }'}</span>
                  </ToolbarBtn>

                  <div className="w-px h-5 bg-white/10 mx-1" />

                  <ToolbarBtn onClick={handleSetLink} active={editor.isActive('link')} title="Add Link">
                    <LinkIcon className="w-3.5 h-3.5" />
                  </ToolbarBtn>
                  <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Horizontal Rule">
                    <Minus className="w-3.5 h-3.5" />
                  </ToolbarBtn>

                  <div className="w-px h-5 bg-white/10 mx-1 ml-auto" />

                  <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo">
                    <Undo className="w-3.5 h-3.5" />
                  </ToolbarBtn>
                  <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo">
                    <Redo className="w-3.5 h-3.5" />
                  </ToolbarBtn>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <EditorContent editor={editor} className="[&_.ProseMirror]:outline-none" />
              {contentError && (
                <p className="text-xs text-red-400 px-5 pb-3">{contentError}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5">
          <Card className="bg-white/[0.03] border-white/[0.07]">
            <CardHeader className="pb-0 pt-4 px-4 border-b border-white/[0.06]">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 pb-3">
                <ImageIcon className="w-3.5 h-3.5 text-accent" /> Cover Image
              </h3>
            </CardHeader>
            <CardContent className="p-4">
              <ImageUpload
                value={watch('image')}
                onChange={(url) => setValue('image', url)}
                label="Cover Image"
              />
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03] border-white/[0.07]">
            <CardHeader className="pb-0 pt-4 px-4 border-b border-white/[0.06]">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 pb-3">
                <TagIcon className="w-3.5 h-3.5 text-accent" /> Metadata
              </h3>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-white/30 tracking-widest">Category</label>
                <Input
                  {...register('category')}
                  className="bg-white/[0.04] border-white/10 h-9 text-sm text-white rounded-xl focus:ring-accent/30"
                />
                {errors.category && <p className="text-xs text-red-400">{errors.category.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-white/30 tracking-widest">Author</label>
                <Input
                  {...register('author')}
                  className="bg-white/[0.04] border-white/10 h-9 text-sm text-white rounded-xl focus:ring-accent/30"
                />
                {errors.author && <p className="text-xs text-red-400">{errors.author.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Char count hint */}
          <p className="text-[10px] text-white/20 text-center font-medium">
            Tip: Content must be at least 50 characters.
          </p>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => !isLoading && setDeleteDialogOpen(open)}>
        <AlertDialogContent className="bg-[#111] border-white/10 text-white rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-black">Delete Post?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50 text-sm">
              This blog post will be permanently deleted and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={isLoading}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl font-bold"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isLoading}
              onClick={onDelete}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl font-black border-0 shadow-lg shadow-red-500/20"
            >
              {isLoading ? 'Deleting…' : 'Delete Post'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BlogForm;

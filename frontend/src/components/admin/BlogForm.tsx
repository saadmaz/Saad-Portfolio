import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Image as ImageIcon, 
  FileText,
  Type,
  Tag as TagIcon,
  Eye,
  Send
} from 'lucide-react';
import { BlogService } from '@/services/blog-service';
import { BlogPost } from '@/types';
import { toast } from "sonner";
import ImageUpload from './ImageUpload';

const blogSchema = z.object({
  title: z.string().min(5, 'Title is too short'),
  slug: z.string().min(5, 'Slug is too short'),
  excerpt: z.string().min(10, 'Excerpt is too short'),
  content: z.string().min(50, 'Content is too short'),
  category: z.string().min(2, 'Category is required'),
  author: z.string().min(2, 'Author is required'),
  image: z.string().url('Invalid URL').optional().or(z.literal('')),
  tags: z.array(z.string()).optional().default([]),
  published: z.boolean().default(false),
});

type BlogFormValues = z.infer<typeof blogSchema>;

const BlogForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!id && id !== 'new';

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      author: 'Saad Mazhar',
      published: false,
      tags: [],
      category: 'Tech'
    }
  });

  useEffect(() => {
    if (isEditMode) {
      loadPost();
    }
  }, [id]);

  const loadPost = async () => {
    try {
      setIsLoading(true);
      const post = await BlogService.getById(id!);
      if (post) {
        reset({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          author: post.author,
          image: post.image || '',
          tags: post.tags || [],
          published: post.published,
        });
      }
    } catch (error) {
      toast.error('Failed to load blog post');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: BlogFormValues) => {
    try {
      setIsLoading(true);
      if (isEditMode) {
        await BlogService.update(id!, data);
        toast.success('Post updated');
      } else {
        await BlogService.create({
            ...data,
            date: new Date().toISOString()
        });
        toast.success('Post created');
      }
      navigate('/admin/blogs');
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm('Delete this masterpiece?')) return;
    try {
      setIsLoading(true);
      await BlogService.delete(id!);
      toast.success('Post deleted');
      navigate('/admin/blogs');
    } catch (error: any) {
      toast.error(error.message || 'Delete failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-white/10"
          onClick={() => navigate('/admin/blogs')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? 'Edit Post' : 'New Story'}
          </h1>
          <p className="text-muted-foreground italic">
            "Your words have the power to inspire."
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button 
                variant="outline"
                onClick={handleSubmit((d) => onSubmit({...d, published: false}))}
                className="border-white/10 hover:bg-white/5"
                disabled={isLoading}
            >
                Save Draft
            </Button>
            <Button 
                onClick={handleSubmit((d) => onSubmit({...d, published: true}))} 
                className="bg-accent hover:bg-accent/90 text-black font-bold px-8"
                disabled={isLoading}
            >
                <Send className="w-4 h-4 mr-2" />
                {isEditMode ? 'Update' : 'Publish'}
            </Button>
            {isEditMode && (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:bg-red-500/10"
                    onClick={onDelete}
                    disabled={isLoading}
                >
                    <Trash2 className="w-5 h-5" />
                </Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Input 
                  {...register('title')}
                  placeholder="The Ultimate Title..." 
                  className="bg-transparent border-none text-3xl font-bold focus-visible:ring-0 placeholder:opacity-50 h-auto p-0"
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
              </div>

              <div className="flex items-center gap-4 py-2 border-y border-white/5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Type className="w-3 h-3" />
                    <span>Slug: {watch('slug') || '...'}</span>
                </div>
                {!isEditMode && (
                    <Input 
                        {...register('slug')}
                        placeholder="slug-goes-here" 
                        className="h-7 text-xs bg-white/5 border-white/10 w-48"
                    />
                )}
              </div>

              <Textarea 
                {...register('excerpt')}
                placeholder="A compelling excerpt to hook readers..." 
                className="bg-white/5 border-white/10 italic text-muted-foreground resize-none"
              />
              {errors.excerpt && <p className="text-xs text-red-500">{errors.excerpt.message}</p>}

              <Textarea 
                {...register('content')}
                placeholder="Start writing your amazing story (Markdown supported)..." 
                className="bg-white/5 border-white/10 min-h-[500px] font-mono text-sm"
              />
              {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3 border-b border-white/5">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-accent" />
                    Cover Asset
                </h3>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <ImageUpload 
                value={watch('image')} 
                onChange={(url) => setValue('image', url)} 
                label="Cover Image"
              />
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3 border-b border-white/5">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    <TagIcon className="w-4 h-4 text-accent" />
                    Metadata
                </h3>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-mono">Category</label>
                <Input {...register('category')} className="bg-white/5 border-white/10 h-8 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-mono">Author</label>
                <Input {...register('author')} className="bg-white/5 border-white/10 h-8 text-sm" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BlogForm;

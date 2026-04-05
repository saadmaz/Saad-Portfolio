import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  FileText,
  Calendar,
  User as UserIcon,
  ChevronDown,
  Globe,
  EyeOff,
} from 'lucide-react';
import { BlogService } from '@/services/blog-service';
import { BlogPost } from '@/types';
import { toast } from "sonner";
import { format } from 'date-fns';
import { cn } from "@/shared/lib/utils";

type SortKey = 'newest' | 'oldest' | 'az';
type FilterKey = 'all' | 'published' | 'draft';

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterKey>('all');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null; title: string }>({
    open: false, id: null, title: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    try {
      const data = await BlogService.getAll();
      setBlogs(data);
    } catch {
      toast.error('Failed to load blog posts');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = [...blogs];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b =>
        (b.title?.toLowerCase().includes(q)) ||
        (b.excerpt?.toLowerCase().includes(q))
      );
    }

    if (filterStatus === 'published') result = result.filter(b => b.published);
    if (filterStatus === 'draft') result = result.filter(b => !b.published);

    if (sortKey === 'newest') result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    else if (sortKey === 'oldest') result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    else if (sortKey === 'az') result.sort((a, b) => a.title.localeCompare(b.title));

    return result;
  }, [blogs, searchQuery, filterStatus, sortKey]);

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.id) return;
    setIsDeleting(true);
    try {
      await BlogService.delete(deleteDialog.id);
      setBlogs(prev => prev.filter(b => b.id !== deleteDialog.id));
      toast.success(`"${deleteDialog.title}" deleted`);
    } catch {
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, id: null, title: '' });
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    const newState = !post.published;
    setTogglingId(post.id);
    try {
      await BlogService.update(post.id, { published: newState });
      setBlogs(prev => prev.map(b => b.id === post.id ? { ...b, published: newState } : b));
      toast.success(newState ? `"${post.title}" published` : `"${post.title}" moved to drafts`);
    } catch {
      toast.error('Failed to update post status');
    } finally {
      setTogglingId(null);
    }
  };

  const filterPills: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Drafts' },
  ];

  const sortLabels: Record<SortKey, string> = {
    newest: 'Newest First',
    oldest: 'Oldest First',
    az: 'A → Z',
  };

  const publishedCount = blogs.filter(b => b.published).length;
  const draftCount = blogs.filter(b => !b.published).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Blog Posts</h1>
          <p className="text-white/40 text-sm mt-1">
            <span className="text-emerald-400 font-bold">{publishedCount} published</span>
            <span className="mx-2 text-white/20">·</span>
            <span className="text-amber-400 font-bold">{draftCount} draft{draftCount !== 1 ? 's' : ''}</span>
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin/blogs/new')}
          className="bg-accent hover:bg-accent/90 text-black font-black shadow-[0_0_20px_rgba(45,212,191,0.2)] rounded-xl transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" /> Write New Post
        </Button>
      </div>

      {/* Search + Filter row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search posts by title or excerpt..."
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:ring-2 focus:ring-accent/30 focus:border-accent/40 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/10 rounded-xl p-1">
          {filterPills.map(pill => (
            <button
              key={pill.key}
              onClick={() => setFilterStatus(pill.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all",
                filterStatus === pill.key
                  ? "bg-accent text-black shadow-sm"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-white/10 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl text-white/50 text-xs font-black uppercase tracking-widest gap-2 h-[42px]">
              {sortLabels[sortKey]} <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#111] border-white/10 text-white rounded-xl shadow-2xl p-1 min-w-[160px]">
            {(Object.keys(sortLabels) as SortKey[]).map(k => (
              <DropdownMenuItem
                key={k}
                onClick={() => setSortKey(k)}
                className={cn(
                  "rounded-lg m-0.5 py-2 text-xs font-bold cursor-pointer",
                  sortKey === k ? "bg-accent/10 text-accent" : "hover:bg-white/5"
                )}
              >
                {sortLabels[k]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Count */}
      {!isLoading && (
        <p className="text-[11px] text-white/25 font-bold uppercase tracking-widest">
          {filtered.length} post{filtered.length !== 1 ? 's' : ''} shown
        </p>
      )}

      {/* List */}
      <div className="grid gap-3">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-24 w-full bg-white/[0.04] border border-white/5 rounded-2xl animate-pulse" />
          ))
        ) : filtered.length > 0 ? (
          filtered.map((post) => (
            <Card key={post.id} className="bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/15 transition-all group overflow-hidden rounded-2xl">
              <CardContent className="p-0">
                <div className="flex items-center p-4 gap-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex-shrink-0 shadow-xl">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-accent/10">
                        <FileText className="w-6 h-6 text-accent/60" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-white truncate group-hover:text-accent transition-colors">{post.title}</h3>
                      {/* Publish status badge */}
                      <button
                        onClick={() => handleTogglePublish(post)}
                        disabled={togglingId === post.id}
                        title={post.published ? 'Click to unpublish' : 'Click to publish'}
                        className={cn(
                          "flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex-shrink-0 transition-all hover:scale-105 active:scale-95",
                          togglingId === post.id ? "opacity-50 cursor-not-allowed" :
                            post.published
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                        )}
                      >
                        {post.published
                          ? <><Globe className="w-2.5 h-2.5" /> Published</>
                          : <><EyeOff className="w-2.5 h-2.5" /> Draft</>
                        }
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-white/30 mb-1.5 font-medium">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-accent/50" />{format(new Date(post.date), 'MMM d, yyyy')}</span>
                      <span className="flex items-center gap-1"><UserIcon className="w-3 h-3 text-accent/50" />{post.author}</span>
                    </div>
                    <p className="text-xs text-white/30 line-clamp-1 max-w-lg">{post.excerpt}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl hover:bg-white/10 text-white/30 hover:text-white transition-all"
                      title="Preview"
                      onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/10 active:scale-90">
                          <MoreVertical className="w-4 h-4 text-white/30" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#111] border-white/10 text-white rounded-xl shadow-2xl p-1">
                        <DropdownMenuItem
                          className="hover:bg-accent/10 hover:text-accent cursor-pointer rounded-lg m-0.5 py-2 text-xs font-bold"
                          onClick={() => navigate(`/admin/blogs/${post.id}`)}
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit Post
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="hover:bg-white/5 cursor-pointer rounded-lg m-0.5 py-2 text-xs font-bold text-white/60"
                          onClick={() => handleTogglePublish(post)}
                        >
                          {post.published
                            ? <><EyeOff className="w-3.5 h-3.5 mr-2" /> Move to Drafts</>
                            : <><Globe className="w-3.5 h-3.5 mr-2" /> Publish Post</>
                          }
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="hover:bg-red-500/15 hover:text-red-400 cursor-pointer text-red-500/70 rounded-lg m-0.5 py-2 text-xs font-bold"
                          onClick={() => setDeleteDialog({ open: true, id: post.id, title: post.title })}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Post
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-16 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-white/20" />
            </div>
            <h3 className="text-base font-bold text-white/60 mb-1">No posts found</h3>
            <p className="text-sm text-white/30">
              {searchQuery || filterStatus !== 'all' ? 'Try adjusting your search or filters.' : 'Write your first blog post to get started.'}
            </p>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !isDeleting && setDeleteDialog(d => ({ ...d, open }))}>
        <AlertDialogContent className="bg-[#111] border-white/10 text-white rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-black">Delete Post?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50 text-sm">
              <span className="text-white/80 font-bold">"{deleteDialog.title}"</span> will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl font-bold"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl font-black border-0 shadow-lg shadow-red-500/20"
            >
              {isDeleting ? 'Deleting…' : 'Delete Post'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBlogs;

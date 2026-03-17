import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye,
  FileText,
  Calendar,
  User as UserIcon
} from 'lucide-react';
import { BlogService } from '@/services/blog-service';
import { BlogPost } from '@/types';
import { toast } from "sonner";
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const data = await BlogService.getAll();
      setBlogs(data);
    } catch (error) {
      toast.error('Failed to load blog posts');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Blog Posts</h1>
          <p className="text-muted-foreground">Share your thoughts and insights with the world.</p>
        </div>
        <Button 
          onClick={() => navigate('/admin/blogs/new')}
          className="bg-accent hover:bg-accent/90 text-black font-semibold shadow-[0_0_20px_rgba(255,184,0,0.2)]"
        >
          <Plus className="w-4 h-4 mr-2" /> Write New Post
        </Button>
      </div>

      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search posts..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-accent/50 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-24 w-full bg-white/5 border border-white/5 rounded-2xl animate-pulse" />
          ))
        ) : filteredBlogs.length > 0 ? (
          filteredBlogs.map((post) => (
            <Card key={post.id} className="bg-white/5 border-white/10 hover:border-white/[0.07] transition-all group overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center p-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-white/5 mr-4 flex-shrink-0">
                    {post.image ? (
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-accent/20">
                        <FileText className="w-6 h-6 text-accent" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white truncate">{post.title}</h3>
                      {!post.published && (
                        <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-500 text-[10px] font-bold uppercase tracking-wider">Draft</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                       <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(post.date), 'MMM dd, yyyy')}</span>
                       <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> {post.author}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate max-w-xl">{post.excerpt}</p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hover:bg-white/10 text-muted-foreground hover:text-white"
                      title="Preview post"
                      onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-white/10">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-white/10 text-white">
                        <DropdownMenuItem 
                          className="hover:bg-accent hover:text-black cursor-pointer"
                          onClick={() => navigate(`/admin/blogs/${post.id}`)}
                        >
                          <Edit2 className="w-4 h-4 mr-2" /> Edit Content
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="hover:bg-red-500 hover:text-white cursor-pointer text-red-400"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Post
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No blog posts found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {searchQuery ? "Try searching for something else." : "Share your first story with the world."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBlogs;

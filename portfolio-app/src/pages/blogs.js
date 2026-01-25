import React, { useState } from 'react';
import { addBlog, getBlogs } from '../services/dataManager';

const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [newBlog, setNewBlog] = useState('');

    const fetchBlogs = async () => {
        const fetchedBlogs = await getBlogs();
        setBlogs(fetchedBlogs);
    };

    const handleAddBlog = async () => {
        if (newBlog.trim()) {
            await addBlog(newBlog);
            setNewBlog('');
            fetchBlogs();
        }
    };

    React.useEffect(() => {
        fetchBlogs();
    }, []);

    return (
        <div className="blogs-container">
            <h1>My Blogs</h1>
            <input
                type="text"
                value={newBlog}
                onChange={(e) => setNewBlog(e.target.value)}
                placeholder="Add a new blog post"
            />
            <button onClick={handleAddBlog}>Add Blog</button>
            <div className="blogs-list">
                {blogs.map((blog, index) => (
                    <div key={index} className="blog-post">
                        <h2>{blog.title}</h2>
                        <p>{blog.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Blogs;
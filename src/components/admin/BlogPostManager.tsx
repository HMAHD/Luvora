'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import {
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    Eye,
    Calendar,
    Clock,
    Tag,
    Image as ImageIcon,
    FileText,
    Sparkles,
    AlertCircle,
    ExternalLink,
    Check,
} from 'lucide-react';
import type { BlogArticle } from '@/lib/blog-data';

type BlogCategory = 'relationships' | 'communication' | 'tips' | 'love-languages';

interface BlogPost {
    id?: string;
    slug: string;
    title: string;
    description: string;
    keywords: string[];
    content: string;
    category: BlogCategory;
    readingTime: number;
    publishedAt: string;
    updatedAt: string;
    image: string;
    published: boolean;
}

const categoryOptions: { value: BlogCategory; label: string; color: string }[] = [
    { value: 'relationships', label: 'Relationships', color: 'badge-error' },
    { value: 'communication', label: 'Communication', color: 'badge-secondary' },
    { value: 'tips', label: 'Tips & Ideas', color: 'badge-warning' },
    { value: 'love-languages', label: 'Love Languages', color: 'badge-primary' },
];

export function BlogPostManager() {
    const { pb } = useAuth();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<Partial<BlogPost>>({
        slug: '',
        title: '',
        description: '',
        keywords: [],
        content: '',
        category: 'relationships',
        readingTime: 5,
        image: '',
        published: false,
    });
    const [keywordInput, setKeywordInput] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const records = await pb.collection('blog_posts').getFullList<BlogPost>({
                sort: '-publishedAt',
            });
            setPosts(records);
            setError(null);
        } catch (error: any) {
            console.error('Failed to load blog posts:', error);
            if (error?.status === 404) {
                setError('blog_collection_not_found');
            } else {
                setError('Failed to load blog posts. Please check your connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const calculateReadingTime = (content: string) => {
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    };

    const handleCreateNew = () => {
        setIsCreating(true);
        setEditingPost(null);
        setFormData({
            slug: '',
            title: '',
            description: '',
            keywords: [],
            content: '',
            category: 'relationships',
            readingTime: 5,
            image: '',
            published: false,
        });
        setKeywordInput('');
    };

    const handleEdit = (post: BlogPost) => {
        setEditingPost(post);
        setIsCreating(true);
        setFormData(post);
        setKeywordInput('');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this blog post?')) return;

        try {
            await pb.collection('blog_posts').delete(id);
            setPosts(posts.filter((p) => p.id !== id));
        } catch (error) {
            console.error('Failed to delete post:', error);
            alert('Failed to delete post');
        }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.content) {
            alert('Title and content are required');
            return;
        }

        setSaving(true);
        const slug = formData.slug || generateSlug(formData.title);
        const readingTime = calculateReadingTime(formData.content || '');
        const now = new Date().toISOString();

        const postData = {
            ...formData,
            slug,
            readingTime,
            updatedAt: now,
            publishedAt: formData.publishedAt || now,
        };

        try {
            if (editingPost?.id) {
                const updated = await pb.collection('blog_posts').update<BlogPost>(editingPost.id, postData);
                setPosts(posts.map((p) => (p.id === editingPost.id ? updated : p)));
            } else {
                const created = await pb.collection('blog_posts').create<BlogPost>(postData);
                setPosts([created, ...posts]);
            }

            setIsCreating(false);
            setEditingPost(null);
            setFormData({});
        } catch (error) {
            console.error('Failed to save post:', error);
            alert('Failed to save post');
        } finally {
            setSaving(false);
        }
    };

    const handleAddKeyword = () => {
        if (keywordInput.trim() && (!formData.keywords || formData.keywords.length < 10)) {
            setFormData({
                ...formData,
                keywords: [...(formData.keywords || []), keywordInput.trim()],
            });
            setKeywordInput('');
        }
    };

    const handleRemoveKeyword = (keyword: string) => {
        setFormData({
            ...formData,
            keywords: (formData.keywords || []).filter((k) => k !== keyword),
        });
    };

    // Setup Instructions Component
    if (error === 'blog_collection_not_found') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center min-h-[60vh]"
            >
                <div className="card bg-base-100 shadow-xl border border-warning/20 max-w-2xl">
                    <div className="card-body">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-full bg-warning/10">
                                <AlertCircle className="w-8 h-8 text-warning" />
                            </div>
                            <div>
                                <h2 className="card-title text-2xl">Blog Collection Not Found</h2>
                                <p className="text-base-content/60">Let's set up your blog system</p>
                            </div>
                        </div>

                        <div className="space-y-4 mt-4">
                            <div className="alert alert-info">
                                <Sparkles className="w-5 h-5" />
                                <span>The <code className="font-mono">blog_posts</code> collection needs to be created in PocketBase first.</span>
                            </div>

                            <div className="steps steps-vertical">
                                <div className="step step-primary">
                                    <div className="text-left ml-4">
                                        <h4 className="font-bold">Open PocketBase Admin</h4>
                                        <p className="text-sm text-base-content/60">Navigate to your PocketBase admin panel</p>
                                        <a
                                            href="http://localhost:8090/_/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-ghost gap-2 mt-2"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            Open Admin Panel
                                        </a>
                                    </div>
                                </div>

                                <div className="step step-primary">
                                    <div className="text-left ml-4">
                                        <h4 className="font-bold">Create Collection</h4>
                                        <p className="text-sm text-base-content/60">Go to Collections → Create collection → Import from JSON</p>
                                        <code className="text-xs block mt-2 p-2 bg-base-200 rounded">pb_migrations/blog_posts_collection.json</code>
                                    </div>
                                </div>

                                <div className="step">
                                    <div className="text-left ml-4">
                                        <h4 className="font-bold">Refresh This Page</h4>
                                        <p className="text-sm text-base-content/60">Come back here and start creating blog posts!</p>
                                    </div>
                                </div>
                            </div>

                            <div className="divider">OR</div>

                            <div className="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" />
                                <div className="collapse-title font-medium">
                                    <FileText className="w-4 h-4 inline mr-2" />
                                    View Full Setup Instructions
                                </div>
                                <div className="collapse-content text-sm space-y-2">
                                    <p className="font-semibold">Manual Collection Setup:</p>
                                    <ol className="list-decimal list-inside space-y-1 ml-2">
                                        <li>Collection name: <code>blog_posts</code></li>
                                        <li>Add these fields: slug, title, description, keywords (JSON), content, category, readingTime, publishedAt, updatedAt, image, published</li>
                                        <li>Set API rules: List/View for published posts, Create/Update/Delete for admins only</li>
                                    </ol>
                                    <p className="mt-3">
                                        <a
                                            href="https://github.com/yourusername/luvora/wiki/Blog-Setup"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="link link-primary"
                                        >
                                            View detailed setup guide →
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card-actions justify-end mt-6">
                            <button onClick={() => loadPosts()} className="btn btn-primary gap-2">
                                <Check className="w-4 h-4" />
                                I've Created the Collection
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="text-base-content/60">Loading blog posts...</p>
            </div>
        );
    }

    if (isCreating) {
        const categoryConfig = categoryOptions.find(c => c.value === formData.category);

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-5xl mx-auto"
            >
                {/* Clean Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-base-content flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-primary" />
                            {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
                        </h3>
                        <p className="text-sm text-base-content/60 mt-1">Craft your next amazing article</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(false)}
                        className="btn btn-sm btn-ghost btn-circle"
                        disabled={saving}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Clean Form with Sections */}
                <div className="space-y-5">
                    {/* Section 1: Basic Info */}
                    <div className="card bg-base-100 shadow-sm border border-base-content/10">
                        <div className="card-body p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-6 bg-primary rounded-full"></div>
                                <h4 className="text-base font-bold text-base-content">Basic Information</h4>
                            </div>

                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-semibold">Title</span>
                                    <span className="label-text-alt text-xs opacity-60">{formData.title?.length || 0}/500</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title || ''}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="input input-bordered w-full"
                                    placeholder="How to Keep Romance Alive in a Long-Term Relationship..."
                                />
                            </div>

                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-semibold">URL Slug</span>
                                    <span className="label-text-alt text-xs opacity-60">Auto-generated</span>
                                </label>
                                <div className="join w-full">
                                    <span className="join-item bg-base-200 text-base-content/60 px-4 flex items-center text-sm font-medium">/blog/</span>
                                    <input
                                        type="text"
                                        value={formData.slug || ''}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder={generateSlug(formData.title || 'your-post-title')}
                                        className="input input-bordered join-item flex-1 font-mono text-sm"
                                    />
                                </div>
                            </div>

                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-semibold">Description</span>
                                    <span className="label-text-alt text-xs opacity-60">{formData.description?.length || 0}/1000</span>
                                </label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="textarea textarea-bordered w-full h-24 resize-none"
                                    placeholder="A compelling description that entices readers and helps with SEO..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text font-semibold">Category</span>
                                    </label>
                                    <select
                                        value={formData.category || 'relationships'}
                                        onChange={(e) =>
                                            setFormData({ ...formData, category: e.target.value as BlogCategory })
                                        }
                                        className="select select-bordered w-full"
                                    >
                                        {categoryOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text font-semibold">Status</span>
                                    </label>
                                    <div className="flex items-center h-12 gap-3 px-4 border border-base-content/20 rounded-lg">
                                        <input
                                            type="checkbox"
                                            checked={formData.published || false}
                                            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                            className="toggle toggle-primary toggle-sm"
                                        />
                                        <span className="text-sm font-medium">{formData.published ? 'Published' : 'Draft'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Media & SEO */}
                    <div className="card bg-base-100 shadow-sm border border-base-content/10">
                        <div className="card-body p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-6 bg-secondary rounded-full"></div>
                                <h4 className="text-base font-bold text-base-content">Media & SEO</h4>
                            </div>

                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-semibold">Featured Image URL</span>
                                    <a href="https://unsplash.com/s/photos/couple" target="_blank" rel="noopener noreferrer" className="label-text-alt link link-primary text-xs">
                                        Browse Unsplash →
                                    </a>
                                </label>
                                <input
                                    type="text"
                                    value={formData.image || ''}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    className="input input-bordered w-full font-mono text-xs"
                                    placeholder="https://images.unsplash.com/photo-..."
                                />
                                <label className="label">
                                    <span className="label-text-alt text-xs opacity-50">Recommended: 1200x630px</span>
                                </label>
                            </div>

                            {formData.image && (
                                <div className="rounded-lg overflow-hidden border border-base-content/10 bg-base-200">
                                    <div className="relative h-48">
                                        <img
                                            src={formData.image}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-3">
                                            <span className="text-xs text-white font-medium">Image Preview</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-semibold">Keywords/Tags</span>
                                    <span className="label-text-alt text-xs opacity-60">{(formData.keywords || []).length}/10</span>
                                </label>
                                <div className="join w-full">
                                    <input
                                        type="text"
                                        value={keywordInput}
                                        onChange={(e) => setKeywordInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                                        className="input input-bordered join-item flex-1"
                                        placeholder="Type keyword and press Enter..."
                                    />
                                    <button
                                        onClick={handleAddKeyword}
                                        className="btn btn-primary join-item"
                                        disabled={(formData.keywords || []).length >= 10}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                {formData.keywords && formData.keywords.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {formData.keywords.map((keyword) => (
                                            <div
                                                key={keyword}
                                                className={`badge ${categoryConfig?.color} gap-2 cursor-pointer hover:opacity-70 transition-opacity px-3 py-3`}
                                                onClick={() => handleRemoveKeyword(keyword)}
                                            >
                                                {keyword}
                                                <X className="w-3 h-3" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Content */}
                    <div className="card bg-base-100 shadow-sm border border-base-content/10">
                        <div className="card-body p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-6 bg-accent rounded-full"></div>
                                    <h4 className="text-base font-bold text-base-content">Content</h4>
                                </div>
                                <div className="flex items-center gap-3 text-xs opacity-60">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="font-medium">{calculateReadingTime(formData.content || '')} min</span>
                                    </div>
                                    <div className="font-medium">{formData.content?.split(/\s+/).length || 0} words</div>
                                </div>
                            </div>

                            <div className="form-control w-full">
                                <textarea
                                    value={formData.content || ''}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="textarea textarea-bordered w-full font-mono text-sm leading-relaxed h-[400px] resize-none"
                                    placeholder="# Your Article Title&#10;&#10;Start writing your amazing content here...&#10;&#10;## Use Markdown Formatting&#10;&#10;- **Bold** for emphasis&#10;- *Italic* for subtle emphasis&#10;- Links: [text](url)&#10;&#10;> Use blockquotes for important notes"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => setIsCreating(false)}
                            className="btn btn-ghost"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="btn btn-primary gap-2 min-w-[140px]"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {editingPost ? 'Update Post' : 'Create Post'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-3xl font-bold flex items-center gap-3">
                        <FileText className="w-8 h-8 text-primary" />
                        Blog Posts
                    </h3>
                    <p className="text-base-content/60 mt-1">{posts.length} {posts.length === 1 ? 'article' : 'articles'} published</p>
                </div>
                <button onClick={handleCreateNew} className="btn btn-primary gap-2">
                    <Plus className="w-5 h-5" />
                    New Post
                </button>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AnimatePresence>
                    {posts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full text-center py-20"
                        >
                            <div className="inline-flex p-6 rounded-full bg-base-200/50 mb-4">
                                <FileText className="w-16 h-16 text-base-content/30" />
                            </div>
                            <h4 className="text-xl font-semibold mb-2">No blog posts yet</h4>
                            <p className="text-base-content/60 mb-6">Create your first blog post to get started</p>
                            <button onClick={handleCreateNew} className="btn btn-primary gap-2">
                                <Plus className="w-5 h-5" />
                                Create First Post
                            </button>
                        </motion.div>
                    ) : (
                        posts.map((post, index) => {
                            const categoryConfig = categoryOptions.find(c => c.value === post.category);
                            return (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="card bg-base-100 border border-base-content/10 hover:shadow-xl hover:border-primary/20 transition-all duration-200 group"
                                >
                                    <div className="card-body p-0">
                                        {post.image && (
                                            <figure className="relative overflow-hidden">
                                                <img
                                                    src={post.image}
                                                    alt={post.title}
                                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute top-3 left-3">
                                                    <span className={`badge ${categoryConfig?.color} gap-1 shadow-lg`}>
                                                        <Tag className="w-3 h-3" />
                                                        {categoryConfig?.label}
                                                    </span>
                                                </div>
                                                <div className="absolute top-3 right-3">
                                                    <span className={`badge ${post.published ? 'badge-success' : 'badge-ghost'} shadow-lg`}>
                                                        {post.published ? 'Published' : 'Draft'}
                                                    </span>
                                                </div>
                                            </figure>
                                        )}
                                        <div className="p-5 space-y-3">
                                            <h4 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                                                {post.title}
                                            </h4>
                                            <p className="text-sm text-base-content/60 line-clamp-2">
                                                {post.description}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-3 text-xs text-base-content/50">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {post.readingTime} min
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(post.publishedAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {post.keywords && post.keywords.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {post.keywords.slice(0, 3).map((keyword) => (
                                                        <span key={keyword} className="badge badge-ghost badge-xs">
                                                            {keyword}
                                                        </span>
                                                    ))}
                                                    {post.keywords.length > 3 && (
                                                        <span className="badge badge-ghost badge-xs">
                                                            +{post.keywords.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="card-actions justify-end pt-2 border-t border-base-content/5">
                                                <a
                                                    href={`/blog/${post.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-ghost btn-sm gap-2"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Preview
                                                </a>
                                                <button
                                                    onClick={() => handleEdit(post)}
                                                    className="btn btn-ghost btn-sm gap-2"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => post.id && handleDelete(post.id)}
                                                    className="btn btn-ghost btn-sm gap-2 text-error hover:bg-error/10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

# Blog Setup

> Complete guide to setting up and managing the Luvora blog system

## Quick Start

### Prerequisites
- PocketBase installed and running
- Admin user with `is_admin = true` flag
- Access to `/admin` route

### Setup Steps

1. **Create PocketBase Collection**
2. **Set Admin Permissions**
3. **Start Creating Posts**

---

## 1. PocketBase Collection Setup

### Option A: Import JSON Schema (Recommended)

1. Open PocketBase admin panel: `http://localhost:8090/_/`
2. Navigate to **Collections** → **Create collection**
3. Click **Import from JSON**
4. Upload: `pb_migrations/blog_posts_collection.json`
5. Click **Import**

### Option B: Manual Setup

**Collection Name:** `blog_posts`

**Fields:**

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `slug` | Text | ✅ | Unique, Pattern: `^[a-z0-9-]+$` |
| `title` | Text | ✅ | Max: 500 chars |
| `description` | Text | ✅ | Max: 1000 chars |
| `keywords` | JSON | | Array of strings |
| `content` | Editor | ✅ | Full markdown content |
| `category` | Select | ✅ | Values: relationships, communication, tips, love-languages |
| `readingTime` | Number | ✅ | 1-60 minutes |
| `publishedAt` | Date | ✅ | Publication timestamp |
| `updatedAt` | Date | ✅ | Last modified timestamp |
| `image` | URL | | Featured image URL |
| `published` | Bool | | Publication status |

**API Rules:**

```javascript
// List Rule
@request.auth.id != '' || published = true

// View Rule
@request.auth.id != '' || published = true

// Create Rule
@request.auth.id != '' && @request.auth.is_admin = true

// Update Rule
@request.auth.id != '' && @request.auth.is_admin = true

// Delete Rule
@request.auth.id != '' && @request.auth.is_admin = true
```

**Indexes:**
```sql
CREATE INDEX idx_blog_posts_category ON blog_posts (category)
CREATE INDEX idx_blog_posts_published ON blog_posts (published)
CREATE UNIQUE INDEX idx_blog_posts_slug ON blog_posts (slug)
```

---

## 2. Admin User Setup

1. Open PocketBase admin panel
2. Go to **Collections** → **users**
3. Find your user record
4. Add or update field: `is_admin` (Bool) = `true`
5. Save the record

---

## 3. Using the Blog Admin Panel

### Access
1. Navigate to `/admin`
2. Click the **Blog** tab in the admin dashboard

### First Time Setup
If you see "Blog Collection Not Found":
1. Follow the on-screen wizard
2. Click "Open Admin Panel" → Create collection
3. Return and click "I've Created the Collection"

---

## Creating Blog Posts

### The Form Layout

**Left Sidebar:**
- Real-time reading time calculation
- Word count display
- Category selection
- Publish status toggle
- Featured image preview

**Main Content:**
- Title (500 chars max)
- URL Slug (auto-generated)
- Description (1000 chars SEO description)
- Featured Image URL
- Keywords/Tags (up to 10)
- Markdown content editor

### Step-by-Step

1. Click **New Post**
2. Enter a **Title** → Slug auto-generates
3. Write compelling **Description** for SEO
4. Select **Category**
5. Paste **Featured Image URL** (1200x630px recommended)
6. Add **Keywords** (press Enter to add each)
7. Write your **Content** in Markdown
8. Toggle **Publish Status** when ready
9. Click **Create Post**

### Keyboard Shortcuts
- `Enter` in keyword field → Add keyword
- Click keyword badge → Remove keyword
- All form fields save automatically on submit

---

## Markdown Reference

### Headings
```markdown
# Heading 1
## Heading 2
### Heading 3
```

### Formatting
```markdown
**Bold text**
*Italic text*
***Bold and italic***
```

### Lists
```markdown
- Bullet point
- Another bullet

1. Numbered item
2. Next item
```

### Links & Images
```markdown
[Link text](https://example.com)
![Alt text](https://image-url.com/image.jpg)
```

### Blockquotes
```markdown
> Important note or quote
```

---

## Featured Images

### Recommended Sources
- [Unsplash](https://unsplash.com/) - Free high-quality images
- Search: couple, love, relationship, romance, heart

### Specifications
- **Aspect Ratio:** 16:9
- **Minimum Size:** 1200x630px (for social sharing)
- **Format:** JPG or PNG
- **File Size:** < 500KB (optimized for web)

### How to Get Unsplash URLs
1. Find image on Unsplash
2. Click download
3. Copy URL from the image source
4. Paste in "Featured Image URL" field

Example URL:
```
https://images.unsplash.com/photo-1234567890?w=1200&q=80
```

---

## Categories

### Relationships
- **Topics:** Dating, commitment, long-term relationships, marriage
- **Keywords:** love, partnership, connection, romance, trust

### Communication
- **Topics:** Talking, listening, conflict resolution, understanding
- **Keywords:** communication, expressing feelings, active listening

### Tips & Ideas
- **Topics:** Date ideas, gift suggestions, romantic gestures
- **Keywords:** ideas, activities, dates, gifts, surprises

### Love Languages
- **Topics:** Words, acts of service, gifts, quality time, physical touch
- **Keywords:** love languages, appreciation, affection, caring

---

## SEO Optimization

Blog posts automatically generate:

### Meta Tags
- Title: `{article.title} | Luvora Blog`
- Description from your description field
- Keywords from your keywords array
- Canonical URL

### OpenGraph (Social Sharing)
- og:title, og:description
- og:image (featured image)
- og:type: article
- article:published_time

### Twitter Card
- Large image card
- Title, description, image

### JSON-LD Structured Data
- @type: BlogPosting
- Author, publisher, dates
- Keywords, word count
- Breadcrumbs

---

## Managing Posts

### Edit a Post
1. Find post in the list
2. Click **Edit** button
3. Make changes
4. Click **Update Post**

### Preview
- Click **Preview** to open in new tab
- View at: `/blog/{slug}`

### Delete
- Click **Delete** button
- Confirm in dialog
- Permanent action - cannot be undone

### Draft vs Published
- Toggle "Publish Status" in sidebar
- Draft posts visible only to authenticated users
- Published posts visible to all

---

## Post List Features

- **Grid View:** 2-column responsive layout
- **Hover Effects:** Image zoom, title color change
- **Category Badges:** Color-coded by category
- **Status Indicators:** Published (green) / Draft (gray)
- **Quick Actions:** Preview, Edit, Delete
- **Metadata:** Reading time, publish date
- **Keywords Preview:** First 3 tags + count

---

## Best Practices

### Content
1. **Engaging Titles** - Use numbers, questions, "How to" format
2. **Clear Structure** - Use headings (H2, H3) for scanability
3. **Short Paragraphs** - 2-3 sentences max
4. **Internal Links** - Link to other blog posts
5. **Reading Time** - Aim for 5-10 minute reads (800-1500 words)

### SEO
1. **Keywords** - Use 5-8 relevant keywords
2. **Description** - 150-160 characters, include main keyword
3. **URL Slug** - Short, descriptive, keyword-rich
4. **Images** - Always include high-quality featured image
5. **Alt Text** - Will be auto-generated from title

### Publishing
1. **Schedule** - Post consistently (weekly/bi-weekly)
2. **Categories** - Distribute across all 4 categories
3. **Draft First** - Review before publishing
4. **Mobile Test** - Check on phone before publishing

---

## Troubleshooting

### "Blog Collection Not Found"
**Solution:** Create the `blog_posts` collection in PocketBase admin panel

### "Permission Denied"
**Solution:** Set `is_admin = true` on your user record in PocketBase

### Images Not Showing
- Verify URL is publicly accessible
- Use HTTPS URLs only
- Test URL in browser first
- Try Unsplash direct URLs

### Slug Conflict
- Each slug must be unique
- Modify slug manually in the form
- Use hyphens only (no spaces or special characters)

### Can't Save Post
- Check required fields: Title, Content
- Verify network connection
- Check browser console for errors
- Ensure admin permissions are set

---

## Performance Tips

### Optimizations Built-In
- ✅ Lazy loading for images
- ✅ Responsive images
- ✅ Minimal bundle size
- ✅ Server-side rendering (SSR)
- ✅ Static generation for posts
- ✅ Automatic code splitting

### Writing for Performance
1. Optimize images before uploading (< 500KB)
2. Use Unsplash's `?w=1200&q=80` parameters
3. Keep content under 2000 words for best performance
4. Avoid embedding large external resources

---

## Future Enhancements

Planned features:
- [ ] Rich text WYSIWYG editor
- [ ] Direct image upload to PocketBase
- [ ] Draft auto-save
- [ ] Version history
- [ ] Comment system
- [ ] Related posts algorithm
- [ ] Newsletter integration
- [ ] Analytics dashboard
- [ ] Content calendar view
- [ ] Bulk actions
- [ ] Tag management system

---

## Support

### Getting Help
1. Check this wiki page first
2. Review [BLOG_IMPROVEMENTS_SUMMARY.md](../BLOG_IMPROVEMENTS_SUMMARY.md)
3. Inspect browser console for errors
4. Check Network tab for API failures

### Common Questions

**Q: Can I import existing blog posts?**
A: Yes, use the PocketBase API or manually create each post via the admin panel.

**Q: Can I schedule posts for future publication?**
A: Not yet - manually change the `publishedAt` date in PocketBase for now.

**Q: How do I add authors?**
A: Currently all posts are attributed to "Luvora Team" - multi-author support coming soon.

**Q: Can I upload images directly?**
A: Not yet - use Unsplash URLs or external image hosting for now.

---

Last Updated: 2026-02-01
Version: 1.0.0

# Blog Setup Guide

This guide explains how to set up and manage the blog system in Luvora.

## PocketBase Collection Setup

### 1. Create the `blog_posts` Collection

1. Open your PocketBase admin panel (usually at `http://localhost:8090/_/`)
2. Go to **Collections** → **Create collection**
3. Import the schema from `/pb_migrations/blog_posts_collection.json` OR create manually:

**Collection name:** `blog_posts`

**Fields:**
- `slug` (Text, Required, Unique) - URL-friendly identifier
- `title` (Text, Required) - Article title
- `description` (Text, Required) - Brief description for SEO
- `keywords` (JSON, Optional) - Array of keywords/tags
- `content` (Editor, Required) - Full article content in Markdown
- `category` (Select, Required) - One of: relationships, communication, tips, love-languages
- `readingTime` (Number, Required) - Estimated reading time in minutes
- `publishedAt` (Date, Required) - Publication date
- `updatedAt` (Date, Required) - Last update date
- `image` (URL, Optional) - Featured image URL (Unsplash recommended)
- `published` (Bool, Optional) - Whether the post is published

**API Rules:**
- List: `@request.auth.id != '' || published = true` (authenticated users or published posts)
- View: `@request.auth.id != '' || published = true`
- Create: `@request.auth.id != '' && @request.auth.is_admin = true` (admin only)
- Update: `@request.auth.id != '' && @request.auth.is_admin = true` (admin only)
- Delete: `@request.auth.id != '' && @request.auth.is_admin = true` (admin only)

### 2. Set Admin Flag on Your User

To create and manage blog posts, you need admin privileges:

1. Go to the `users` collection in PocketBase admin
2. Find your user record
3. Add a field `is_admin` (Bool) and set it to `true`
4. Save the record

## Using the Blog Admin Panel

### Access the Admin Panel

1. Log in to your Luvora account
2. Navigate to `/admin`
3. Click the **Blog** tab

### Create a New Blog Post

1. Click **New Post** button
2. Fill in the required fields:
   - **Title** - Your article title
   - **Slug** - Auto-generated if left empty, or customize
   - **Description** - Brief summary for SEO (max 1000 chars)
   - **Category** - Select appropriate category
   - **Image URL** - Paste Unsplash or other image URL
   - **Keywords** - Add relevant keywords (up to 10)
   - **Content** - Write your article in Markdown format

3. Toggle **Publish immediately** to make it live
4. Click **Create Post**

### Edit Existing Posts

1. Find the post in the list
2. Click the **Edit** icon (pencil)
3. Make your changes
4. Click **Update Post**

### Preview Posts

- Click the **Eye** icon to preview the post on the live site
- Opens in a new tab at `/blog/[slug]`

### Delete Posts

- Click the **Trash** icon
- Confirm deletion in the dialog

## Markdown Guide

The content editor supports standard Markdown:

### Headings
```markdown
# Heading 1
## Heading 2
### Heading 3
```

### Text Formatting
```markdown
**Bold text**
*Italic text*
***Bold and italic***
```

### Lists
```markdown
- Bullet point 1
- Bullet point 2
  - Nested item

1. Numbered item 1
2. Numbered item 2
```

### Blockquotes
```markdown
> This is a blockquote
> It can span multiple lines
```

### Links
```markdown
[Link text](https://example.com)
```

## SEO Optimization

The blog system automatically generates:

### Meta Tags
- Title: `{article.title} | Luvora Blog`
- Description: Article description
- Keywords: From keywords array
- Canonical URL

### OpenGraph Tags
- og:title
- og:description
- og:type: article
- og:image: Featured image
- og:url
- article:published_time
- article:modified_time

### Twitter Card
- twitter:card: summary_large_image
- twitter:title
- twitter:description
- twitter:image

### JSON-LD Structured Data
- @type: BlogPosting
- headline, description, author
- publisher with logo
- datePublished, dateModified
- keywords, articleSection
- wordCount, inLanguage

### Breadcrumb Schema
- Home → Blog → Article

## Image Guidelines

### Recommended Sources
- **Unsplash** (https://unsplash.com/) - Free high-quality images
- Use search terms: "couple", "love", "relationship", "romance", "heart", etc.

### Image Specifications
- Aspect ratio: 16:9 recommended
- Minimum resolution: 1200x630 (for social sharing)
- Format: JPG or PNG
- File size: Optimize for web (< 500KB ideal)

### Getting Unsplash URLs
1. Find an image on Unsplash
2. Click the download button
3. Copy the image URL from the download link
4. Paste in the Image URL field

Example:
```
https://images.unsplash.com/photo-1234567890?w=1200&q=80
```

## Category Guidelines

### Relationships
- Topics: Dating, commitment, long-term relationships, marriage
- Keywords: love, partnership, connection, romance

### Communication
- Topics: Talking, listening, conflict resolution, understanding
- Keywords: communication, talking, listening, expressing

### Tips & Ideas
- Topics: Date ideas, gift suggestions, romantic gestures
- Keywords: ideas, tips, activities, dates, gifts

### Love Languages
- Topics: Words, acts, gifts, time, touch
- Keywords: love languages, appreciation, affection

## Migration from Static Blog Data

If you have existing blog posts in `/src/lib/blog-data.ts`, you can:

1. Create each post manually using the admin panel, OR
2. Use the PocketBase API to bulk import:

```javascript
// Example bulk import script (run in browser console with admin auth)
const articles = BLOG_ARTICLES; // from blog-data.ts

for (const article of articles) {
  await pb.collection('blog_posts').create({
    ...article,
    published: true,
  });
}
```

## Troubleshooting

### "Failed to create post"
- Check that your user has `is_admin = true` in PocketBase
- Verify all required fields are filled
- Check browser console for specific errors

### Images not showing
- Verify the image URL is publicly accessible
- Check for CORS issues
- Try using Unsplash URLs directly

### Slug conflicts
- Each slug must be unique
- If you get a conflict, modify the slug manually
- Use hyphens only (no spaces or special characters)

### SEO not working
- Verify meta tags in page source (View Page Source)
- Test with Google's Rich Results Test
- Check robots.txt isn't blocking blog pages

## Best Practices

1. **Consistent Publishing Schedule** - Post regularly (weekly or bi-weekly)
2. **Keyword Research** - Use tools like Google Trends for relevant keywords
3. **Internal Linking** - Link to other blog posts and Luvora pages
4. **Engaging Titles** - Use numbers, questions, or "How to" formats
5. **Quality Images** - Always use high-quality, relevant images
6. **Mobile-Friendly** - Test posts on mobile devices
7. **Reading Time** - Aim for 5-10 minute reads (800-1500 words)
8. **Categories Balance** - Distribute posts across all categories

## Future Enhancements

Potential improvements to the blog system:

- [ ] Image upload to PocketBase storage
- [ ] Draft auto-save
- [ ] Version history
- [ ] Comment system
- [ ] Related posts algorithm
- [ ] Newsletter integration
- [ ] Analytics integration
- [ ] Content calendar view
- [ ] Bulk actions (publish, delete)
- [ ] Tag management system

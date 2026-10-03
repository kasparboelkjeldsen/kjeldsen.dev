# Content spec: personal developer blog

A personal site for a developer. It has a front page, a handful of free-form content pages, a blog, and a small list of authors. There is one language (English).

Editors build every page body from a shared set of content blocks. They don't fill in fixed page templates.

---

## Site structure

- The **home page** is the root of the site. There is exactly one.
- Under the home page an editor can create:
  - a **blog** section that holds blog posts
  - an **authors** section that holds authors
  - any number of **content pages**
- Content pages can have content pages beneath them, so editors can build small sub-sections.
- Blog posts can only be created inside the blog section. Authors can only be created inside the authors section.

---

## User stories

### Home page

**As an editor**, I want to build the front page from content blocks, so that I can change its layout and message without a developer.

**As an editor**, I want to choose a background image for the site, so that the front page (and section landing pages) have a visual backdrop.

**As an editor**, I want to manage the main menu from the home page, adding, removing and reordering links to pages on the site or to external URLs, so that visitors can find the important sections.

### Content page

**As an editor**, I want to create general pages (for example "About me" or "Packages") and build their body from content blocks, so that I can publish anything that isn't a blog post.

### Blog section

**As a visitor**, I want the blog section to list all published posts with the newest one highlighted first, so that I can see what's new and browse older posts.

**As an editor**, I want the blog listing to fill itself from the posts in the section, so that I don't have to maintain the list by hand.

### Blog post

**As an editor**, I want to write a blog post body from content blocks, so that I can mix text, headings, images, code and video.

**As an editor**, I want to pick the post's author from the list of authors, so that the author is entered once and reused. Every post has exactly one author.

**As an editor**, I want to give each post search and listing details, kept apart from the body:
- a title for search engines and listings
- a short description
- keywords
- a listing image
- a publishing date

This lets the post look right in search results and in the blog listing. The listing card shows the image, date, author, title and description.

### Authors

**As an editor**, I want to keep a list of authors, each with a name and a lucky number between 1 and 100, so that posts can credit them.

---

## Content blocks

The same set of blocks is available on the home page, content pages and blog posts. Editors place blocks on a grid. Most blocks can be full width or half width, so two can sit side by side. The Spotlight block can also take three-quarters of the width.

**Rich text.** As an editor, I want a rich text block for running copy. It needs the usual formatting: bold, italic and underline; alignment; bulleted and numbered lists; quotes; dividers; links; code; and embedded media.

**Header.** As an editor, I want a stand-alone heading block where I type the text and choose its level (H1 to H5), so that I control the page outline.

**Image.** As an editor, I want an image block where I pick an image, set a focal point, write alt text and add an optional caption. I also want to choose the shape it is shown in: widescreen, slim banner, square, or the original proportions.

**Code.** As an editor, I want to paste a code snippet and say which language it is in, so that visitors see it formatted and highlighted and can copy it.

**Spotlight.** As an editor, I want a highlighted callout with a heading, a small icon or logo image, and a short piece of rich text, so that I can draw attention to something (a package, a product, a key point).

**Video.** As an editor, I want to embed a Vimeo video by pasting its URL.

---

## Media

Images need predefined crops in three shapes, each in several sizes: widescreen (16:9), square (1:1) and slim banner (4:1). The image block's shape choice uses these crops.

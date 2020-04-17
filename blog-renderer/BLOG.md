# Hello World
hello world,first,blog,render,renderer

![hello_world](https://blog.nikitas.link/earth.jpg)

A lot of times when I get stuck on some problem I search for solutions online, and a lot of times I find really specific solutions in the form of blog posts. Occasionally, I find a solution myself, so I got the idea that I should start a blog and post about:

- Solutions that I find, to help others with similar issues
- Projects that I've made/working on
- Interesting things I find that I feel like sharing
- Maybe more?

And since this is my hello-world blog post, what I am interested in sharing is how I created this blog post.

## My Custom Blog Renderer

I wrote a set of blog rendering and publishing scripts that allow me to write blogs in Markdown format, and publish them with a click of a button.
I know there's a variety of publishing software out there that do similar things, but I wanted a couple specific features, and I thought the best way (and most fun way) would be to make my own solution. Here's what I wanted the blog renderer to be able to do:

- [X] Blog posts written and rendered via GitHub flavored Markdown
- [X] Blog posts are published after they are comitted to my monorepo
- [X] Automatically fill in the date/contact information
- [ ] Ability to sort/filter blog posts by category
- [ ] Custom Markdown plugins for things I want to add in the future
    - [ ] Collapsable code sections
    - [ ] Easy format directory structures


The first two points are the most important. The first is important because Markdown allows me to easily write nicely styled pages. And the idea behind the second point is that when I write code in my monorepo, **I want to document solutions closest to where they are relevant**.



##### How it works

The blog renderer has two main parts

- The rendering script that takes a `BLOG.md` file and outputs a `blog.html`
- The update script that finds all `BLOG.md` files that have changed since the last commit.

The rendering script is not all that interesting. If I break it down into pseudo code it looks something like this:

```js
// render_blog.js:

blogContents = fs.readFileSync(firstArgument)
blogConfig = require('blog_config.json')

// fill in variables from config like my name
// my contact info, my blog URL, etc.
blogFormatted = formatBlog(blogContents, blogConfig)

markdownRendered = marked(blogFormatted)
myHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <other tags...>
    <custom styling...>
</head>
<body>
    <div class="markdown-body">
        ${markdownRendered}
    </div>
</body>
`

console.log(myHtml)
```


But the far more interesting part is the `update_blog` shell script. It is fairly long, so again I will only provide the pseudo code here, but the full code is available [here](https://github.com/nikita-skobov/my_blog) 


```sh
# update_blog.sh:

# remember the current branch name so we can switch back
# at the end
current_branch_name=$(git rev-parse --abbrev-ref HEAD)

# switch to a branch that tracks the blog posts
# this branch must exist prior to running this script
git checkout blogs

# find everything in my repository that matches *BLOG.md
all_blog_files=$(get_paths_of_matches "$repo_absolute_path" "*BLOG.md")

# get a list of files that have changed since the last time
# update_blogs was ran
updated_files=$(git diff --name-only "$current_branch_name")

for file in $updated_files ; do
    if file_is_a_blog_file $all_blog_files $file ; then
        blog_title=$(get_blog_title "$file")

        # checkout the latest version of this file
        # from the branch where we actually made the commit
        git checkout "$current_branch_name" -- "$f"

        node render_blog.js $file > $blog_title
    fi
done

# merge all diffs from current to blogs
# so that next time update_blogs is ran
# it only updates the newly modified blogs
git merge "$current_branch_name"
git checkout "$current_branch_name"
```

Again, the real code is a lot more complicated and it also renders the homepage which has links to all the existing blogs (that's why we need to get `all_blog_files`).

The important part is that the `blogs` branch is just a slightly behind version of master (or any other branch where blog posts are made), and the `blogs` branch can simply be fast forwarded every time there is a new/updated blog post. This way, the next time that update_blogs is ran, there is no need to re-render old `BLOG.md` files. This is necessary because when this script outputs its files, **it should only output files that need to be sent to the webserver.** This keeps data transmission costs at a minimum, and makes deployment easy because you can just deploy all of the files that it outputs.

At the time of writing this, the core functionality that I want exists, and I look forward to writing blog posts in the future. But I will keep working on this project from time to time, and adding some features when I need them. Below is a checklist of things I've added, and things I want to add.

- [X] implement custom markdown rendering
- [X] create script that can detect `BLOG.md` files from git commit history
- [X] output files with "nice" styling
- [X] add basic SEO tags
- [X] make it open source
- [X] write about how it works
- [ ] implement tag system
- [X] center images
- [ ] Medium style highlighting
- [ ] collapsable code sections

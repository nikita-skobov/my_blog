# Update May 2021

This repository contains the scripts I used to use to update/maintain my blog. They were rather cumbersome and hack-ish and in May 2021 I decided to rewrite it in rust. I now use: [blog-updater](https://github.com/nikita-skobov/blog-updater) instead. It's still quite new and experimental, but it has some nice options by default and is much easier to use than this repository. So I am now archiving `my_blog` in favor of `blog-updater`.

# my_blog

This repo contains the rendering and updating code that I use to render my blog. 

The whole concept of this project is to be able to write `BLOG.md` files anywhere I want in my repository and then run a script: `update_blogs` that will locate all of these `BLOG.md` files that have changed since the last time I ran `update_blogs`, render each new/modified `BLOG.md` file, and render an updated homepage that contains links to all of the blog posts.

For more information about how it renders, see the blog-renderer directory README.

## Installation

```sh
git clone https://github.com/nikita-skobov/my_blog
cd my_blog
cd blog-renderer
npm install --save
cd ..
absolute_path_to_script=$(readlink -e update_blogs.sh)
sudo ln -sf "$absolute_path_to_script" /usr/local/bin/update_blogs

# make sure it is executable
sudo chmod +x /usr/local/bin/update_blogs

# you will need to remember where the blog-renderer folder is
# installed:
blog_renderer_path=$(readlink -e blog-renderer)
```

## Usage

You must be wihin a git repository to call update_blogs

update_blogs works by using a blogs branch that is always slightly behind master (or any branch, really), and it merges the master into the blogs branch every time there is a new blog post. That way, when you run update_blogs again, it only renders any new or modified blog posts that have been committed to master. To set this up, simply run `git checkout -b blogs` from your master branch (or any branch that you want to track blog posts from) and then go back to master `git checkout master`. If you do not want to use the name "blogs" for the blog posts, simply change the `blog_branch_name` variable inside the `update_blogs.sh` file.

Next, to run the update_blogs script, you simply need to pass in a path to wherever you installed the blog-renderer scripts. So if you followed the installation instructions, you can do:

```sh
update_blogs "$blog_renderer_path"
```

Which should initially only output an empty index.html file inside a blog_tmp folder that it will create.

If you want to actually render a blog post, make a BLOG.md file somewhere in your repository, write some markdown inside it, commit it.

It is important that your BLOG.md file follows the format:

```md
# Title
comma,delimited,tags

```

the update_blogs script reads these first two lines and passes this information to the render_homepage script

Now if you run it again, you will see that the blog_tmp folder will contain index.html as well as the name of your blog post, but without an html extension. This is designed **specifically so that you can copy the entire contents of blog_tmp to where you are hosting your webserver, and the blog links will direct to the correct page**


## Example output

My first `BLOG.md` file is inside [blog-renderer/BLOG.md](https://github.com/nikita-skobov/my_blog/blob/master/blog-renderer/BLOG.md). You can see the output of this file on [my first blog post](https://blog.nikitas.link/hello-world)

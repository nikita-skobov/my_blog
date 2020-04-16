# Usage

This library provides two scripts:
- render_blog
- render_homepage

Both of these scripts render some html text that is formatted via some options. This html template, and css is hardcoded into the render_blog and render_homepage scripts. If you want to modify the styling of your blog, modify the code within those files.

## Render Blog

Render blog takes in as an argument a path to a markdown file. It loads the markdown file, and renders it using `marked`, and it uses `highlight.js` for code highlighting.

It renders specific information such as name, email, and URLs via a blog config file that by default it searches for 'blog_config.json'. You can optionally pass in an alternate path to the blog config via the `BLOG_CONFIG` environment variable.

render blog will simply console log an html string, so you can redirect the output to a file.

example usage:

```sh
BLOG_CONFIG="./my_custom_blog_config.json" node render_blog.js my_blog.md > my_blog.html
```


## Render Homepage

Render homepage is responsible for rendering a homepage that contains links to every single blog post. It takes positional arguments in groups of 3. Every 3 arguments correspond to a single blog post. The first is the title, the second is the tags split by comma, and the third is a timestamp of when the blog was initially created in seconds from the epoch.

Render homepage will sort the blog links in newest first order, so you do not need to pass the blog posts in order.

The tags are included so in the future, blog posts can be filtered by category, but currently that functionality is not there.

It renders specific information such as name, email, and URLs via a blog config file that by default it searches for 'blog_config.json'. You can optionally pass in an alternate path to the blog config via the `BLOG_CONFIG` environment variable.

it will simply console log an html string, so you can redirect the output to a file.

example usage:

If you have two blog posts that you wish to include links to on the homepage, you would call render_homepage via:

```sh
node render_homepage.js "# Hello World" tag1,tag2 1587052152 "# My Next Blog" tag2,tag3 1587062177 > my_blog.html
```

This is a rather cumbersome command to run especially if you have many blogs, which is why render_homepage was not intended to be ran directly, but rather via a helper script that finds all of your blog posts, and creates the arguments for you.

## blog_config

The blog_config.json file defines the configuration for your blog such as the name of the blog, the links, the descriptions, etc. JSON files cannot have comments, but I have provided the below pseudo-json code to demonstrate which options go where on the rendered blog. Please note that this single config file is used for both render_homepage, AND render_blog, so some of the options are used for both. An actual, working blog_config.json is provided in the repository (that I use for my blogposts) for you to see how it works, and to modify as needed.

```js
{
    // USED FOR BOTH render_blog and render_homepage:

    // used for:
    // <meta property="article:publisher" content="${nameURL}">
    // and on render_blog, its used as a link when you click
    // on the name of the blog writer located under the article title
    "nameURL": "https://mywebsite.com",

    // used for:
    // the title of the navbar at the top
    // also used for some meta tags like og:sitename
    "blogHome": "My Blog Title",

    // used for:
    // the actual link of the blogHome navbar
    // also used for some meta tags like link rel:canonical
    "blogHomeURL": "https://myblog.mywebsite.com",


    // ONLY USED FOR render_blog

    // used for:
    // under each blog post it says who made the post
    // so the name option is what shows up, and nameURL is
    // the link that corresponds to this text
    "name": "Person McPersonson",

    // used for:
    // if no "aboutMe" is provided, a default aboutMe
    // is created and it uses projectsURL to say
    // where more of your projects can be found
    "projectsURL": "https://github.com/myusername",

    // used for:
    // if no "aboutMe" is provided, a default aboutMe
    // is created and it uses email to say
    // how you can be contacted
    "email": "me@email.com",

    // used for:
    // under every blog post, an about the author section
    // is rendered. You can optionally pass in your own markdown
    // formatted string, or rely on the default one created
    // via email, projectsURL, and name
    "aboutMe": "> some markdown formatted string",


    // ONLY USED FOR render_homepage
    // the description text at the top of the homepage. It is
    // also included in the meta description tag
    "description": "Hi my name is somename, and this is my blog about something..."
}

```

# Future Goals:

- [X] customize renderer library to output fancy code brackets
- [ ] a dropdown to view edited versions
- [X] BIG FONT SIZE
- [ ] "good" SEO tags (lol how)
- [ ] categorize blog posts on homepage via their tags
- [ ] allow users to use their own html templates without having to edit the actual scripts

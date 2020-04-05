import marked from 'marked'
import hljs from 'highlight.js'
import fs from 'fs'

const args = process.argv.slice(2)

const blogHome = 'Nikita\'s blog'
const blogHomeURL = 'https://blog.nikitas.link'
const name = 'Nikita Skobov'
const nameURL = 'https://nikitas.link'
const description = 'My name is Nikita Skobov and this is my blog. I am a student of statistics, and computer science at the University of Minnesota. Sometimes I write code for fun.'

const rightNow = new Date()

const blogs = []

for (let i = 0; i < args.length; i += 1) {
    if (i % 3 == 0) {
        // these are the titles:
        const titleWithoutHashtag = args[i].substr(2)
        let blogFileName = titleWithoutHashtag.toLowerCase()
        blogFileName = blogFileName.replace(/\s+/g, '-')
        blogFileName = blogFileName.replace(/\'+/g, '')
        blogFileName = blogFileName.replace(/,+/g, '')
        blogs.push({
            title: titleWithoutHashtag,
            path: blogFileName,
        })
    } else if (i % 3 == 1) {
        // these are the tags
        blogs[blogs.length - 1].tags = args[i].split(',')
    } else if (i % 3 == 2) {
        // these are the timestamps (in epoch seconds)
        const timestampNumber = parseInt(args[i], 10)
        const date = new Date(timestampNumber * 1000)

        const month = date.toLocaleString('default', {
            month: 'long',
        })
        const day = date.getDate()
        const year = date.getFullYear()
        const dateStr = `${month} ${day}, ${year}`

        blogs[blogs.length - 1].dateStr = dateStr
        blogs[blogs.length - 1].dateNum = timestampNumber
    }
}

// sort by newest date first:
blogs.sort((a, b) => {
    return b.dateNum - a.dateNum
})

const renderBlogPostLink = (blogObj) => {
    return `<div class="bloglink"><a class="abloglink" href="${blogHomeURL}/${blogObj.path}">${blogObj.dateStr} - ${blogObj.title}</a></div>`
}
let blogListHTMLString = ''
blogs.forEach((blogObj) => {
    blogListHTMLString = `${blogListHTMLString}${renderBlogPostLink(blogObj)}\n    `
})

const myhtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${blogHome}</title>
    <meta name="HandheldFriendly" content="True">
    <link rel="shortcut icon" href="/favicon.png" type="image/png">
    <link rel="canonical" href="${blogHomeURL}/">
    <meta property="og:site_name" content="${blogHome}">
    <meta property="og:title" content="${blogHome}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${blogHomeURL}/">
    <meta property="article:published_time" content="${rightNow.toISOString()}">
    <meta property="article:modified_time" content="${rightNow.toISOString()}">
    <meta property="article:publisher" content="${nameURL}">
    <style>
        .bloglink {
            text-align: center !important;
            font-weight: 300 !important;
            line-height: 2.1 !important;
            font-size: 20px !important;
            margin-bottom: 0.5em !important;
        }
        .abloglink {
            text-decoration: none !important;
            color: royalblue !important;
        }
        .abloglink:hover {
            color: midnightblue !important;
        }
        .abloglink:visited {
            color: rebeccapurple !important;
        }
        .blogwrapper {
            margin-left: auto;
            margin-right: auto;
            width: 260px;
        }
        h1 {
            font-size: 3.2em !important;
            font-weight: 600 !important;
            letter-spacing:  -1px !important;
            margin-bottom: 0% !important;
        }
        h2, h3, h4, h5, h6 {
            font-size: 2.5em !important;
        }
        p, li, input {
            font-weight: 300 !important;
            line-height: 2.1 !important;
            font-size: 20px !important;
        }

        .navbar {
            min-height: 60px !important;
            background-color: black;
            position: relative;
        }
        html, body {
            margin: 0;
        }
        .blog-title {
            color: white;
            font-size: 36px;
            margin-bottom: 0;
            border-bottom: none;
            text-decoration: none;
        }
        .wrapper {
            padding-left: 30px;
            padding-right: 30px;
            position: absolute;
            width: 95%;
            top: 50%;
            margin: auto;
            text-align: center;
            transform: translate(0, -50%);
        }
        .description {
            margin-left: auto !important;
            margin-right: auto !important;
            width: 460px;
            margin-top: 1em;
            margin-bottom: 1em;
        }
    </style>
</head>
<body>
    <header class="navbar">
        <div class="wrapper">
            <a class="blog-title" href="${blogHomeURL}">${blogHome}</a>
        </div>
    </header>
    <p class="description">
        ${description}
    </p>
    <div class="blogwrapper">
    ${blogListHTMLString}
    </div>
</body>
</html>`

console.log(myhtml)

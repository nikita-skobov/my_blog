const marked = require('marked')
const hljs = require('highlight.js')
const fs = require('fs')

const args = process.argv.slice(2)
const absolutePathToFile = args[0]
if (!absolutePathToFile) {
    console.error('Must provide a single argument: an absolute path to a .md file that will be rendered')
    process.exit()
}

const blogConfigPath = process.env.BLOG_CONFIG || `${__dirname}/blog_config.json`

let blogConfig
try {
    blogConfig = require(blogConfigPath)
} catch (e) {
    console.error(`FAILED TO FIND BLOG CONFIG: ${blogConfigPath}`)
    blogConfig = {}
}


const renderer = new marked.Renderer()
const markdownContent = fs.readFileSync(absolutePathToFile, { encoding: 'UTF-8' })

// split out the first line (thats the title)
// so that we can insert the date in between the
// title and the rest of the article
const lineSplit = markdownContent.split('\n')
const markdownTitle = lineSplit.shift()
const titleWithoutHashtag = markdownTitle.substr(2)
const tags = lineSplit.shift()
const restOfMarkdown = lineSplit.join('\n')
const rightNow = new Date()
const month = rightNow.toLocaleString('default', {
    month: 'long',
})
const day = rightNow.getDate()
const year = rightNow.getFullYear()
let time = rightNow.toLocaleTimeString('default', {
    hour: '2-digit',
    minute: '2-digit',
})
// remove leading 0 if present
if (time.charAt(0) === '0') time = time.substr(1)
// I think it looks better without time:
const dateStr = `${month} ${day}, ${year}`
// const dateStr = `${month} ${day}, ${year} ${time}`

let {
    blogHome = "Default Blog Name!",
    blogHomeURL = "https://example.com",
    name = "Default Blogger Name!",
    email = "default@email.com",
    nameURL = "https://example.com",
    projectsURL = "https://github.com/username",
    aboutMe = '',
} = blogConfig

if (aboutMe === '') {
    aboutMe = `
About me:

> I am ${name}.<br>
> Contact me via email: ${email}<br>
> Check out my projects: ${projectsURL}<br>
> Check out my other blog posts: ${blogHomeURL}<br>`
}

const blogNameAndDate = `<span style="color: #92979b; font-size: 16px"><a style="font-weight: bold; color: #92979b" href="${nameURL}">${name}</a> - ${dateStr}</span>`

const tagWord = '<span style="font-size: 14px">tags: </span><br />'
const renderTag = (tag) => `<span style="font-size: 14px"><a href="#">${tag}</a></span>`
const tagStr = tags.split(',').reduce((prev, current, index) => {
    return index === 1 ? `${renderTag(prev)} ${renderTag(current)}` :`${prev} ${renderTag(current)}`
})

// make meta tags:
let metaTagString = ''
const renderMetaTag = (tag) => `<meta property="article:tag" content="${tag}">`
const tagList = tags.split(',')
for (let i = 0; i < tagList.length; i += 1) {
    metaTagString = `${metaTagString}${renderMetaTag(tagList[i])}\n    `
}


// find first paragraph
let firstParagraph = ''
const markdownSections = restOfMarkdown.split('\n').filter(a => a !== '')
let isCode = 0
for (let i = 0; i < markdownSections.length; i += 1) {
    const section = markdownSections[i]
    if (isCode && section.includes('```')) {
        // if we are within a code block,
        // and then we find the end of the code block
        // stop treating it as a code block:
        isCode = 0
        continue
    }
    if (section.includes('```')) {
        // found a code block, ignore next several lines
        isCode = 1
        continue
    }
    if (isCode) {
        continue
    }

    const isAlphabetical = /^[a-z]+$/i
    if (isAlphabetical.test(section.charAt(0))) {
        // found first paragraph
        firstParagraph = section
        break
    }
}
// only take the first 160 characters of the first paragraph by sentences:
let numChars = 0
let description = ''
const firstSentences = firstParagraph.split('.')
for (let i = 0; i < firstSentences.length; i += 1) {
    description = `${description}${firstSentences[i]}.`
    numChars += firstSentences[i].length
    if (numChars >= 160) {
        break
    }
}

let blogFileName = titleWithoutHashtag.toLowerCase()
blogFileName = blogFileName.replace(/\s+/g, '-')
blogFileName = blogFileName.replace(/\'+/g, '')
blogFileName = blogFileName.replace(/,+/g, '')
// TODO:
// add tag system:
/*
<div style="line-height: 1.5 !important">
${tagWord}
${tagStr}
</div>
*/

const blogFormattedContent = `${markdownTitle}
${blogNameAndDate}
${restOfMarkdown}



${aboutMe}
`

const markdownRendered = marked(blogFormattedContent, {
    renderer,
    highlight: (code, language) => {
        const validLanguage = hljs.getLanguage(language) ? language : 'plaintext'
        return hljs.highlight(validLanguage, code).value
    }
})

// TODO:
// let user specify a html template
const myhtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${titleWithoutHashtag}</title>
    <meta name="HandheldFriendly" content="True">
    <link rel="shortcut icon" href="/favicon.png" type="image/png">
    <link rel="canonical" href="${blogHomeURL}/${blogFileName}">
    <meta property="og:site_name" content="${blogHome}">
    <meta property="og:title" content="${titleWithoutHashtag}">
    <meta property="og:type" content="article">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${blogHomeURL}/${blogFileName}">
    <meta property="article:published_time" content="${rightNow.toISOString()}">
    <meta property="article:modified_time" content="${rightNow.toISOString()}">
    ${metaTagString}
    <meta property="article:publisher" content="${nameURL}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/styles/night-owl.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css">
    <style>
        .markdown-body>:first-child {
            margin-top: 0.5em !important;
        }
        div.markdown-body {
            margin-bottom: 100px !important;
        }
        .markdown-body h1, .markdown-body h2 {
            border-bottom: none !important;
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
        p img {
            display: block !important;
            margin-left: auto !important;
            margin-right: auto !important;
        }
        code {
            font-weight: 300 !important;
            line-height: 1.1 !important;
            font-size: 20px !important;
        }
        pre {
            background-color: #333 !important;
            color: #fff !important;
            font-family: "Andale Monaco", "Monaco", "Consolas", monospace !important;
            font-style: normal !important;
        }
        div.markdown-body {
            margin-left: auto !important;
            margin-right: auto !important;
        }

        /* Extra small devices (phones, 600px and down) */
        @media only screen and (max-width: 600px) {
            div.markdown-body {
                margin-left: 15px !important;
                margin-right: 15px !important;
            }
        }

        /* Small devices (portrait tablets and large phones, 600px and up) */
        @media only screen and (min-width: 601px) {
            div.markdown-body {
                max-width: 600px !important;
            }
        }

        /* Medium devices (landscape tablets, 768px and up) */
        @media only screen and (min-width: 768px) {
            div.markdown-body {
                max-width: 700px !important;
            }
        }

        /* Extra large devices (large laptops and desktops, 1200px and up) */
        @media only screen and (min-width: 900px) {
            div.markdown-body {
                max-width: 800px !important;
            }
        }

        /* Extra large devices (large laptops and desktops, 1200px and up) */
        @media only screen and (min-width: 1100px) {
            div.markdown-body {
                max-width: 880px !important;
            }
        }

        .navbar {
            min-height: 60px !important;
            background-color: black;
            position: relative;
        }
        html, body {
            margin: 0;
            overflow-x: hidden !important;
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
    </style>
</head>
<body>
    <header class="navbar">
        <div class="wrapper">
            <a class="blog-title" href="${blogHomeURL}">${blogHome}</a>
        </div>
    </header>
    <div class="markdown-body">
        ${markdownRendered}
    </div>
</body>
</html>`

console.log(myhtml)

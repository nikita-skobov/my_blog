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
    }
}

const renderBlogPostLink = (blogObj) => {
    return `<a href="${blogHomeURL}/${blogObj.path}">${blogObj.dateStr} - ${blogObj.title}</a>`
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
    </style>
</head>
<body>
    <header class="navbar">
        <div class="wrapper">
            <a class="blog-title" href="${blogHomeURL}">${blogHome}</a>
        </div>
    </header>
    <div>
    ${blogListHTMLString}
    </div>
</body>
</html>`

console.log(myhtml)


// const absolutePathToFile = args[0]
// if (!absolutePathToFile) {
//     console.error('Must provide a single argument: an absolute path to a .md file that will be rendered')
//     process.exit()
// }

// const renderer = new marked.Renderer()
// const markdownContent = fs.readFileSync(absolutePathToFile, { encoding: 'UTF-8' })

// // split out the first line (thats the title)
// // so that we can insert the date in between the
// // title and the rest of the article
// const lineSplit = markdownContent.split('\n')
// const markdownTitle = lineSplit.shift()
// const tags = lineSplit.shift()
// const restOfMarkdown = lineSplit.join('\n')
// const rightNow = new Date()
// const month = rightNow.toLocaleString('default', {
//     month: 'long',
// })
// const day = rightNow.getDate()
// const year = rightNow.getFullYear()
// let time = rightNow.toLocaleTimeString('default', {
//     hour: '2-digit',
//     minute: '2-digit',
// })
// // remove leading 0 if present
// if (time.charAt(0) === '0') time = time.substr(1)
// const dateStr = `${month} ${day}, ${year} ${time}`

// // TODO: make this dynamic
// // let "user" pass in option of name, name url,
// // date format?
// // name/date color?
// const blogHome = 'Nikita&#39;s blog'
// const blogHomeURL = 'https://blog.nikitas.link'
// const name = 'Nikita Skobov'
// const nameURL = 'https://nikitas.link'
// const blogNameAndDate = `<span style="color: #92979b; font-size: 16px"><a style="font-weight: bold; color: #92979b" href="${nameURL}">${name}</a> - ${dateStr}</span>`

// const tagWord = '<span style="font-size: 14px">tags: </span><br />'
// const renderTag = (tag) => `<span style="font-size: 14px"><a href="#">${tag}</a></span>`
// const tagStr = tags.split(',').reduce((prev, current, index) => {
//     return index === 1 ? `${renderTag(prev)} ${renderTag(current)}` :`${prev} ${renderTag(current)}`
// })

// const blogFormattedContent = `${markdownTitle}
// ${blogNameAndDate}
// ${restOfMarkdown}


// <div style="line-height: 1.5 !important">
// ${tagWord}
// ${tagStr}
// </div>

// About me:

// > I am Nikita Skobov.<br>
// > Contact me via email: skobo002@umn.edu<br>
// > Check out my projects: https://github.com/nikita-skobov<br>
// > Check out my other blogs: ${blogHomeURL}<br>
// `

// const markdownRendered = marked(blogFormattedContent, {
//     renderer,
//     highlight: (code, language) => {
//         const validLanguage = hljs.getLanguage(language) ? language : 'plaintext'
//         return hljs.highlight(validLanguage, code).value
//     }
// })

// // TODO:
// // let user specify a html template
// const myhtml = `<!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Document</title>
//     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/styles/night-owl.min.css">
//     <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css">
//     <style>
//         .markdown-body>:first-child {
//             margin-top: 0.5em !important;
//         }
//         div.markdown-body {
//             margin-bottom: 100px !important;
//         }
//         .markdown-body h1, .markdown-body h2 {
//             border-bottom: none !important;
//         }
//         h1 {
//             font-size: 3.2em !important;
//             font-weight: 600 !important;
//             letter-spacing:  -1px !important;
//             margin-bottom: 0% !important;
//         }
//         h2, h3, h4, h5, h6 {
//             font-size: 2.5em !important;
//         }
//         p, li, input {
//             font-weight: 300 !important;
//             line-height: 2.1 !important;
//             font-size: 20px !important;
//         }
//         code {
//             font-weight: 300 !important;
//             line-height: 1.1 !important;
//             font-size: 20px !important;
//         }
//         pre {
//             background-color: #333 !important;
//             color: #fff !important;
//             font-family: "Andale Monaco", "Monaco", "Consolas", monospace !important;
//             font-style: normal !important;
//         }
//         div.markdown-body {
//             margin-left: auto !important;
//             margin-right: auto !important;
//         }

//         /* Extra small devices (phones, 600px and down) */
//         @media only screen and (max-width: 600px) {
//             div.markdown-body {
//                 margin-left: 5px !important;
//                 margin-right: 5px !important;
//             }
//         }

//         /* Small devices (portrait tablets and large phones, 600px and up) */
//         @media only screen and (min-width: 601px) {
//             div.markdown-body {
//                 max-width: 600px !important;
//             }
//         }

//         /* Medium devices (landscape tablets, 768px and up) */
//         @media only screen and (min-width: 768px) {
//             div.markdown-body {
//                 max-width: 700px !important;
//             }
//         }

//         /* Extra large devices (large laptops and desktops, 1200px and up) */
//         @media only screen and (min-width: 900px) {
//             div.markdown-body {
//                 max-width: 800px !important;
//             }
//         }

//         /* Extra large devices (large laptops and desktops, 1200px and up) */
//         @media only screen and (min-width: 1100px) {
//             div.markdown-body {
//                 max-width: 880px !important;
//             }
//         }

//         .navbar {
//             min-height: 60px !important;
//             background-color: black;
//             position: relative;
//         }
//         html, body {
//             margin: 0;
//         }
//         .blog-title {
//             color: white;
//             font-size: 36px;
//             margin-bottom: 0;
//             border-bottom: none;
//             text-decoration: none;
//         }
//         .wrapper {
//             padding-left: 30px;
//             padding-right: 30px;
//             position: absolute;
//             width: 95%;
//             top: 50%;
//             margin: auto;
//             text-align: center;
//             transform: translate(0, -50%);
//         }
//     </style>
// </head>
// <body>
//     <header class="navbar">
//         <div class="wrapper">
//             <a class="blog-title" href="${blogHomeURL}">${blogHome}</a>
//         </div>
//     </header>
//     <div class="markdown-body">
//         ${markdownRendered}
//     </div>
// </body>
// </html>`

// console.log(myhtml)

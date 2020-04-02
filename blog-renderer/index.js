import marked from 'marked'
import hljs from 'highlight.js'
import fs from 'fs'

const args = process.argv.slice(2)
const absolutePathToFile = args[0]
if (!absolutePathToFile) {
    console.error('Must provide a single argument: an absolute path to a .md file that will be rendered')
    process.exit()
}

const renderer = new marked.Renderer()
const markdownContent = fs.readFileSync(absolutePathToFile, { encoding: 'UTF-8' })

// split out the first line (thats the title)
// so that we can insert the date in between the
// title and the rest of the article
const lineSplit = markdownContent.split('\n')
const markdownTitle = lineSplit.shift()
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
const dateStr = `${month} ${day}, ${year} ${time}`

// TODO: make this dynamic
// let "user" pass in option of name, name url,
// date format?
// name/date color?
const name = 'Nikita Skobov'
const nameURL = 'https://nikitas.link'
const blogNameAndDate = `<span style="color: #92979b; font-size: 16px"><a style="font-weight: bold; color: #92979b" href="${nameURL}">${name}</a> - ${dateStr}</span>`
const blogFormattedContent = `${markdownTitle}
${blogNameAndDate}
${restOfMarkdown}
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
    <title>Document</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/styles/night-owl.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css">
    <style>
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
        p, li, input, code {
            font-weight: 300 !important;
            line-height: 2.1 !important;
            font-size: 20px !important;
        }
        pre {
            background-color: #333 !important;
            color: #fff !important;
            font-family: "Andale Monaco", "Monaco", "Consolas", monospace !important;
            font-style: normal !important;
        }
        div.markdown-body {
            margin: auto !important;
        }

        /* Extra small devices (phones, 600px and down) */
        @media only screen and (max-width: 600px) {
            div.markdown-body {
                margin-left: 5px !important;
                margin-right: 5px !important;
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
    </style>
</head>
<body>
    <div class="markdown-body">
        ${markdownRendered}
    </div>
</body>
</html>`

console.log(myhtml)

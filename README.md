# "html2json" Test Task solution by Kyrylo Prokopenko

I've decided to check character by caracter every element of imported html text file to interact with any kind of tags instead of importing and picking every existing element from an array or object.  

## Initial data
- `root = []` - the entry-point array that holds top level of our DOM
- `stack = []` - stack used to track active parent elements
- `currentTagNode = null` - dynamic pointer referencing the node currently having its tag name or attributes
- `state = 'TEXT'` - active handler name, helping to participate with direct character-by-character processing
- `curData = ''` - an accumulator that collects characters for tag/attribute(name, value) or doc/comment until a boundary character is met

### How it works

The parser processes input string character-by-character, transitioning through defined states:
**`TEXT`**: Collects inner text until `<` or `nextChar == undefined` is encountered.
**`COMMENT_OR_DOCTYPE`**: Collects inner text until `>` with `-` is encountered.
**`TAG_OPEN`**: Determines if the upcoming sequence is a closing tag (`/`), comment/doctype (`!`), or a standard opening tag name.
**`TAG_NAME`**: Accumulates the tag identifier, constructs the node, pushes it to `children`, and conditionally pushes non-void tags to `stack`.
**`CLOSE_TAG_NAME`**: Matches closing tags and pops the current active parent from `stack`.
**`ATTRIBUTE_NAME`**: Captures attribute keys until encountering `=` (for value assignment) or space | `>` (for boolean attributes).
**`ATTRIBUTE_VALUE`**: Accumulates attribute values, stripping surrounding quotes automatically.

**`dataPush` Function**: Collecting imported data and it type to futher pushing to the `root` | `stack` array depending on it length.
**`void_tags` Array**: Self closed tags collection.

---

## Usage Example

**Imported Data:**
```bash
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport">
    <title>Sample HTML</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Welcome to My Website</h1>
    </header>
    <nav>
        <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
    </nav>
    <main>
        <section id="home">
            <h2>Home Section</h2>
            <p>This is the home section of the webpage.</p>
        </section>
        <section id="about">
            <h2>About Section</h2>
            <p>This is the about section of the webpage.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2024 My Website</p>
    </footer>
    <script src="script.js"></script>
</body>
</html>
```

**Output Structure**
```bash
[
  {
    "doctype": "!DOCTYPE html"
  },
  {
    "tag": "html",
    "attribute": [
      {
        "attributeName": "lang",
        "attributeValue": "en"
      }
    ],
    "children": [
      {
        "tag": "head",
        "attribute": [],
        "children": [
          {
            "tag": "meta",
            "attribute": [
              {
                "attributeName": "charset",
                "attributeValue": "UTF-8"
              }
            ]
          },
          {
            "tag": "meta",
            "attribute": [
              {
                "attributeName": "name",
                "attributeValue": "viewport"
              }
            ]
          },
          {
            "tag": "title",
            "attribute": [],
            "children": [
              "Sample HTML"
            ]
          },
          {
            "tag": "link",
            "attribute": [
              {
                "attributeName": "rel",
                "attributeValue": "stylesheet"
              },
              {
                "attributeName": "href",
                "attributeValue": "styles.css"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "tag": "body",
    "attribute": [],
    "children": [
      {
        "tag": "header",
        "attribute": [],
        "children": [
          {
            "tag": "h1",
            "attribute": [],
            "children": [
              "Welcome to My Website"
            ]
          }
        ]
      }
    ]
  },
  {
    "tag": "nav",
    "attribute": [],
    "children": [
      {
        "tag": "ul",
        "attribute": [],
        "children": [
          {
            "tag": "li",
            "attribute": [],
            "children": [
              {
                "tag": "a",
                "attribute": [
                  {
                    "attributeName": "href",
                    "attributeValue": "#home"
                  }
                ],
                "children": [
                  "Home"
                ]
              }
            ]
          }
        ]
      },
      {
        "tag": "li",
        "attribute": [],
        "children": [
          {
            "tag": "a",
            "attribute": [
              {
                "attributeName": "href",
                "attributeValue": "#about"
              }
            ],
            "children": [
              "About"
            ]
          }
        ]
      }
    ]
  },
  {
    "tag": "li",
    "attribute": [],
    "children": [
      {
        "tag": "a",
        "attribute": [
          {
            "attributeName": "href",
            "attributeValue": "#contact"
          }
        ],
        "children": [
          "Contact"
        ]
      }
    ]
  },
  {
    "tag": "main",
    "attribute": [],
    "children": [
      {
        "tag": "section",
        "attribute": [
          {
            "attributeName": "id",
            "attributeValue": "home"
          }
        ],
        "children": [
          {
            "tag": "h2",
            "attribute": [],
            "children": [
              "Home Section"
            ]
          },
          {
            "tag": "p",
            "attribute": [],
            "children": [
              "This is the home section of the webpage."
            ]
          }
        ]
      }
    ]
  },
  {
    "tag": "section",
    "attribute": [
      {
        "attributeName": "id",
        "attributeValue": "about"
      }
    ],
    "children": [
      {
        "tag": "h2",
        "attribute": [],
        "children": [
          "About Section"
        ]
      },
      {
        "tag": "p",
        "attribute": [],
        "children": [
          "This is the about section of the webpage."
        ]
      }
    ]
  },
  {
    "tag": "footer",
    "attribute": [],
    "children": [
      {
        "tag": "p",
        "attribute": [],
        "children": [
          "&copy; 2024 My Website"
        ]
      }
    ]
  },
  {
    "tag": "script",
    "attribute": [
      {
        "attributeName": "src",
        "attributeValue": "script.js"
      }
    ],
    "children": []
  }
]
```



/**
 * Plan:  Consider two trees of bookmarks, 'current' and 'to_merge'
 *
 * Schema of browser sync data seems to be
 *
 * { xbrowsersync:
 *   { date: "20200130213047040",
 *     sync: {
 *       various metadata...  treat as opaque, keep metadata of 'current'
 *     }
 *     data: {        // Why not top toolbar node, but can't change now...
 *       bookmarks: [
 *          {title: "[xbs] Toolbar",
 *           children: [
 *              {
 *                 title: "title",
 *                 description: ".... <optional>",
 *                 url: "///url",
 *                 id="22"
 *              },
 *           ]
 *           id="2234"
 *          }
 *       ]
 *     }
 *   }
 * }
 *
 * So load everything into a Map, key'd by URL.
 *   If the URL exists, replace if the ID is later.
 *   Store the path folder/folder/folder, the description, and the ID
 * Then unwind the map to recreate the structure
 *
 * So merge will just operate on xbrowsersync.data.bookmarks[0]
 * Unclear correct appraoch if there can be multiple root nodes?  Treat
 * them as independent (just iterate).
 *
 * What to do if the root node is named differently.
 *
 */
const YAML = require('yaml');

Object.entries = (typeof Object.entries === 'function' ?
                  Object.entries :
                  obj => Object.keys(obj).map(k => [k, obj[k]]));

const current_yaml = `
Toolbar,1:
  - folder1,2:
    - bookmark1, url001, 101, Text Description
    - bookmark2, url002, 102
    - folder1_1, 3:
      - bookmark3, url003, 103
      - bookmark4, url004, 104
    - folder1_2, 4:
      - bookmark5, url005, 105
      - bookmark6, url006, 106
  - folder2, 5:
    - bookmark7, url007, 107, Long Description
  - emptyfolder, 6:
    - emptyfolder2, 7:
    - emptyfolder3, 8:
  - emptyafterremoval, 9:
    - duplicates5, url005, 55, Prefer older tags that are more recent
  - bookmark8, url008, 108
  - bookmark9, url009, 109
`;
/**
 * This just converts the more dense yaml into the JSON used
 * by browser sync
 */
function yaml_to_json(y) {
  if (typeof(y) === 'object') {
    // Each key is a folder/object or string/leaf
    return Object.keys(y).map(
      function(k) {
        let [title, id] = k.split(', ');
        return {
          title: title,
          id: id,
          contents: yaml_to_json(y[k])
        };
      }
    )
  } else {
    // y is a string, return as a URL node
    let [title, url, id, ...desc] = y.split(', ')
    bkmk = {
      title: title,
      id: id,
      url: url,
    }
    if (desc.length > 0) {
      bkmk.desc = desc.join(', ')
    }
    return bkmk
  }
}


function walk(node, path=[]) {
  Object.keys(node).map( )
  path = [...path,]
}

const noop_keep_later = `
Toolbar,1:
  - bookmark8, url008, 58
  - bookmark9, url009, 59
`

const additive_merge = `
Toolbar,1:
  - folder1,2:
    - newbookmark1, newurl001, 201, Text Description
    - newbookmark2, newurl002, 202
`
 const title_change = `
 Toolbar,1:
    - folder1,2:
      - newbookmark1, newurl001, 201, Text Description
      - newbookmark2, newurl002, 202
 `

 const CURRENT = {
   title: "[xbs] Toolbar",
   chilren: [
     title: "folder1 "
   ]
 }

let merge = require('merge');